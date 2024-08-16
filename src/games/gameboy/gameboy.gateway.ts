import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameboyService } from './gameboy.service';
import { AuthService } from 'src/auth/auth.service';
import { CronJob } from 'cron'
import { RedisService } from 'src/redis/redis.service';
import { ReadmeService } from 'src/readme/readme.service';

@WebSocketGateway({
  namespace: 'gameboy'
})
export class GameboyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  renderInterval: NodeJS.Timer | null
  sessionFrames = 0
  connected = 0
  clients = new Map<string, number>()
  users = new Map<string, { id: number, inputCount: number, pressed: string[], connectetd: boolean }>()
  saveJob = new CronJob('0 * * * * *', async () => { await this.saveUsers(this); if (this.needCommit) this.reamdeService.commit(":joystick: Update Gameboy Contributions"); this.needCommit = false})
  needCommit = false
  lastSendedFrame!: number[]
  constructor(private gameboyService: GameboyService, private authService: AuthService, private redis: RedisService, private reamdeService: ReadmeService){
    this.saveJob.start()
  }

  @WebSocketServer()
  server: Server;

  async afterInit(io: Server) {

    io.use(async (socket, next) => {
      try {
        const payload = await this.authService.verify(socket.handshake.headers.authorization.split(' ')[1])
        if(payload) {
          this.clients.set(socket.id, payload.id)
          this.users.set(String(payload.id), { id: payload.id, inputCount: 0, pressed: [], connectetd: true })
          next()
        } else next(new Error('authentication error'))
      } catch (e) {
        console.log(e)
        next(new Error('authentication error'))
      }
    })
  }

  computeFrameDiff(newFrame: number[]) {
    const startArray: number[][] = Array.from({ length: 256 }, e => Array() )
    for(let i = 0; i < newFrame.length; i++) {
      if(newFrame[i] !== this.lastSendedFrame[i]) {
        startArray[newFrame[i]].push(i)
      }
    }

    const returnArray = [] as (number | number[])[]
    for(let i = 0; i < startArray.length; i+= 1) {
      if(startArray[i].length) {
        returnArray.push(i)
        returnArray.push(startArray[i])
      }
    }
    return returnArray
  }

  handleConnection(socket: Socket): void {
    this.lastSendedFrame = this.gameboyService.gameboy_instance.doFrame()
    this.server.emit('frame', this.lastSendedFrame)
    if(++this.connected > 1) return
    this.saveJob.start()
    
    this.gameboyService.stopRenderSession()
    this.renderInterval = setInterval(() => {
      if(++this.sessionFrames % 10 === 0) {
        const newFrame = this.gameboyService.gameboy_instance.doFrame()
        const diff = this.computeFrameDiff(newFrame)
        if(diff.length) this.server.emit('diff', diff)
        this.lastSendedFrame = newFrame
      } else {
        if(this.gameboyService.lastInputFrames.length >= 80) {
          this.gameboyService.lastInputFrames.splice(0, this.gameboyService.lastInputFrames.length - 80 + 1)
        }
        if(this.sessionFrames % 4 === 0) this.gameboyService.lastInputFrames.push(this.gameboyService.gameboy_instance.doFrame())
        else this.gameboyService.gameboy_instance.doFrame()
      }
    }, 5)
  }

  handleDisconnect(socket: Socket) {
    const user = this.users.get(String(this.clients.get(socket.id)))
    if(user) user.connectetd = false
    this.clients.delete(socket.id)
    if(--this.connected === 0) {
      this.saveUsers(this)
      this.saveJob.stop()
      this.sessionFrames = 0
      clearInterval(this.renderInterval as NodeJS.Timeout)
      this.renderInterval = null
      this.gameboyService.setRenderSession()
    }
  }

  @SubscribeMessage('input')
  async handleMessage(client: any, payload: string[]) {
    this.needCommit = true
    const BASE_URL = `${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}`
    this.gameboyService.renderInputBoard(BASE_URL)
    let userId = this.clients.get(client.id)
    if(!userId) return
    let userAction = this.users.get(String(userId)) ?? { id: userId, inputCount: 0, pressed: [] as string[], connectetd: true }
    const validatedInputs = userAction.pressed.filter(input => !payload.find(v => input === v))
    userAction.inputCount += validatedInputs.length
    userAction.pressed = payload
    this.users.set(String(userId), userAction)
    for(let i = 0; i < 2; i++) {
      this.gameboyService.gameboy_instance.pressKeys(payload)
      this.gameboyService.gameboy_instance.doFrame()
    }
  }

  async saveUsers(that) {
    for(const [key, user] of that.users) {
      const isSaved = await that.redis.client.hGet(`gameboy:players:${user.id}`, 'id')
      if(!isSaved) await that.redis.client.hSet(`gameboy:players:${user.id}`, {id: user.id, inputCount: user.inputCount})
      else {
        const userInputCount = await that.redis.client.hGet(`gameboy:players:${user.id}`, 'inputCount')
        that.redis.client.hSet(`gameboy:players:${user.id}`, 'inputCount', +userInputCount + user.inputCount)
      }
      user.inputCount = 0
      if(!user.connected) that.users.delete(user.id)
    }
  }
}
