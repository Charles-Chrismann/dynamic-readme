import { createCanvas, loadImage, Image } from "@napi-rs/canvas";
import { AbstractDynamicModule } from "../abstract.module";
import { Chess, Piece, Square } from "chess.js";
import { MoveInstruction } from "src/games/chess/declarations";
import { AppConfigService } from "src/services";
import { mkdir, readFile, writeFile } from "fs/promises";
import { ChessSave, chessSchema } from "src/zod.zodobject";

interface Data {
  uuid: string
}

interface Options {
}

export class ChessDynamicModule extends AbstractDynamicModule<Data, Options> {
  chess!: Chess
  public boardBuffer!: Buffer
  private static piecesMap: Map<string, Image> | undefined

  async init() {
    await ChessDynamicModule.loadAssets()
    try {
      const chessDataStr = (await readFile(`./config/datas/chess.json`))
      const chessData = chessSchema.parse(chessDataStr)
      const { history } = chessData
      const chess = new Chess()

      for(const move of history) {
        chess.move(move)
      }

      this.chess = chess
      await this.renderBoardImage()
      this.needsRender = true
    } catch (err: unknown) {
      await this.new()
      await this.save()
    }
  }

  async save() {
    const data: ChessSave = {
      fen: this.chess.fen(),
      history: this.chess.history()
    }

    const dir = './config/datas/chess';
    await mkdir(dir, { recursive: true });
    await writeFile(
      `${dir}/${this.data['uuid']}.json`,
      JSON.stringify(data)
    );
  }

  static async loadAssets() {
    if(ChessDynamicModule.piecesMap) return
    this.piecesMap = new Map()

    const pieceNames = [
      'bb', 'bk', 'bn', 'bp', 'bq', 'br',
      'wb', 'wk', 'wn', 'wp', 'wq', 'wr',
    ]

    const loadedImages = await Promise.all(
      pieceNames.map(async (name) => ({
        name,
        image: await loadImage(`./src/games/chess/assets/${name}.png`),
      }))
    )

    for (const { name, image } of loadedImages) {
      this.piecesMap.set(name, image)
    }
  }

  private static pieces = {
    p: {
      w: "♙",
      b: "♟",
    },
    k: {
      w: "♔",
      b: "♚",
    },
    q: {
      w: "♕",
      b: "♛",
    },
    r: {
      w: "♖",
      b: "♜",
    },
    n: {
      w: "♘",
      b: "♞",
    },
    b: {
      w: "♗",
      b: "♝",
    },
  }

  async new() {
    const chess = new Chess()
    this.chess = chess
    this.renderBoardImage()
    this.needsRender = true
  }

  async move(moveInstruction: MoveInstruction) {

    const chess = this.chess

    try {
      chess.move({
        from: moveInstruction.from,
        to: moveInstruction.to,
      })

      await this.save()
      this.needsRender = true

      return true
    } catch (error) {
      return false
    }
  }

  async renderBoardImage() {
    const tileSize = 32;
    const canvas = createCanvas(256, 256)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#eeeed2'
    ctx.fillRect(0, 0, 256, 256)
    
    ctx.fillStyle = '#769656'
    
    let currentColor;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(tileSize * i, tileSize * j, tileSize, tileSize)
        }

        if(j === 7) {
          currentColor = ctx.fillStyle
          ctx.fillStyle = i % 2 === 0 ? '#769656' : '#eeeed2'
          ctx.fillText(String.fromCharCode(97 + i), tileSize * (i + 1) - 6, 253)
          ctx.fillStyle = currentColor
        }
      }
      currentColor = ctx.fillStyle
      ctx.fillStyle = i % 2 !== 0 ? '#769656' : '#eeeed2'
      ctx.fillText(String(8 - i), 1, tileSize * (i + 1) - 24)
      ctx.fillStyle = currentColor
    }
  
    const chess = this.chess

    for(const row of chess.board()) {
      for(const square of row) {
        if(!square) continue

        const [x, y] = square.square.split('')

        ctx.drawImage(
          ChessDynamicModule.piecesMap!.get(`${square.color}${square.type}`)!,
          ["a", "b", "c", "d", "e", "f", "g", "h"].indexOf(x) * tileSize,
          (8 - (+y)) * tileSize,
          tileSize,
          tileSize
        )
      }
    }

    const buffer = await canvas.encode('png')
    this.boardBuffer = buffer
  }
  
  private computeMoveString(chess: Chess, piece: { square: Square } & Piece) {
    const BASE_URL = `${AppConfigService.APP_BASE_URL}/chess/${this.data.uuid}`
    const moves = chess.moves({ square: piece.square, verbose: true })
    const sqrt = Math.ceil(Math.sqrt(moves.length))
    return moves.map((move, index: number) => {
        return `${(index % sqrt === 0 && index !== 0) ? "<br>" : ''}<a href="${BASE_URL}/move?from=${move.from}&to=${move.to}">${move.to}</a>`
    }).join('\n          ')
  }

  async getBoardBuffer() {
    if(!this.boardBuffer) await this.renderBoardImage()
    return this.boardBuffer
  }

  static getletterFromNumber(number: number) {
    let numbers = [
      ":eight:",
      ":seven:",
      ":six:",
      ":five:",
      ":four:",
      ":three:",
      ":two:",
      ":one:",
    ]
  return numbers[number]
}

  public async render(): Promise<string> {
    const chess = this.chess
    const BASE_URL = `${AppConfigService.APP_BASE_URL}/chess/${this.data.uuid}`
  
    let md = `<h3 align="center">A classic Chess</h3>\n`
    this.renderBoardImage()
    md += `<p align="center">\n  <img width="256" src="${BASE_URL}/board" />\n</p>\n`

    if(chess.isGameOver()) {
      if(chess.isStalemate()) md += `<p align="center">Stalemate !</p>\n`
      else `<p align="center">It's ${chess.turn() === "b" ? "White" :"Black"}'s turn</p>\n`
    } else md += `<p align="center">It's ${chess.turn() === "b" ? "Black" : "White"}'s turn</p>\n`
  
    md += `<table align="center">\n  <tbody>\n`
    chess.board().forEach((row, y) => {
      md += `    <tr>\n      <td align="center">${ChessDynamicModule.getletterFromNumber(y)}</td>\n`
      row.forEach((piece) => {
        md += `      <td align="center">${piece ? (piece.color === chess.turn() && chess.moves({ square: piece.square }).length ? `\n        <details>\n          <summary>${ChessDynamicModule.pieces[piece.type][piece.color]}</summary>\n          ${this.computeMoveString(chess, piece)}\n        </details>\n` : ChessDynamicModule.pieces[piece.type][piece.color]
      ): "‎ "}      </td>\n`
      })
      md += `    </tr>\n`
    })
    
    md +=  `  <tr>\n    <td align="center"></td>\n    <td align="center">🇦</td>\n    <td align="center">🇧</td>\n    <td align="center">🇨</td>\n    <td align="center">🇩</td>\n    <td align="center">🇪</td>\n    <td align="center">🇫</td>\n    <td align="center">🇬</td>\n    <td align="center">🇭</td>\n    </tr>\n  </tbody>\n</table>`
  
    md += `<h3 align="center">\n<a href="${BASE_URL}/new">Reset Game</a>\n</h3>\n\n<hr>\n\n`
    return md
  }
}