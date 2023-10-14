import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameboyService } from './gameboy.service';

@WebSocketGateway({
  namespace: 'gameboy'
})
export class GameboyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  renderInterval: NodeJS.Timer | null
  sessionFrames = 0
  connected = 0
  constructor(private gameboyService: GameboyService){}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket): void {
    console.log('connection la')
    if(++this.connected > 1) return
    
    this.gameboyService.stopRenderSession()
    this.renderInterval = setInterval(() => {
      if(++this.sessionFrames % 20 === 0) {
        this.server.emit('frame', this.gameboyService.gameboy_instance.doFrame())
      } else this.gameboyService.gameboy_instance.doFrame()
    }, 5)
    // this.socketService.handleConnection(socket);
  }

  handleDisconnect(socket: Socket) {
    console.log('deco')

    if(--this.connected === 0) {
      this.sessionFrames = 0
      clearInterval(this.renderInterval as NodeJS.Timeout)
      this.renderInterval = null
      this.gameboyService.setRenderSession()
    }
  }

  @SubscribeMessage('input')
  handleMessage(client: any, payload: any) {
    for(let i = 0; i < 2; i++) {
      this.gameboyService.gameboy_instance.pressKeys(payload)
      this.gameboyService.gameboy_instance.doFrame()
    }
  }


}
