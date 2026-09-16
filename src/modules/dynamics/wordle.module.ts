import { AbstractDynamicModule } from "../abstract.module";
import { FIVE_CHAR_WORDS } from "src/games/wordle/word_list";
import { CronJob } from "cron";
import ReadmeService from "src/services/ReadmeService";
import { AppConfigService } from "src/services";
import { readFile, writeFile } from "fs/promises";
import { Wordle, wordleSchema } from "src/zod.zodobject";
import State from "src/State";

interface Data {
}

interface Options {
}

export class WordleDynamicModule extends AbstractDynamicModule<Data, Options> {
  initialized = false
  todayWordle!: Wordle['todayWordle'];
  scoreBoard!: Wordle['scoreboard'];

  createWordleCron = new CronJob('0 0 22 * * *', async () => {
    await this.wordle()
    this.needsRender = true
    await ReadmeService.renderCommitAndPush(':book: set today\'s wordle')
  }, null, true)

  public async init(): Promise<void> {
    let wordleData: Wordle
    try {
      const wordleStringData = (await readFile('./config/datas/wordle.json')).toString('utf-8')
      wordleData = wordleSchema.parse(JSON.stringify(wordleStringData))
    } catch (err: unknown) {
      wordleData = {
        scoreboard: [],
        todayWordle: this.getNewWordle()
      }
      await this.save()
    }
    const { scoreboard, todayWordle } = wordleData
    this.scoreBoard = scoreboard
    this.todayWordle = todayWordle
    this.initialized = true
  }

  async save() {
    const { todayWordle, scoreBoard } = this
    await writeFile('./config/datas/wordle.json', JSON.stringify({
      todayWordle,
      scoreBoard,
    }))
  }

  getNewWordle() {
    const word = FIVE_CHAR_WORDS[Math.floor(Math.random() * FIVE_CHAR_WORDS.length)]
    const wordle = {
      word,
      guessed: false,
      guesses: [] as Wordle['todayWordle']['guesses']
    }
    return wordle
  }

  async wordle() {
    this.todayWordle = this.getNewWordle()
    await this.save()

    return 'wordle';
  }

  async guess(guess: string, issuer: string, issuerId: number) {

    if(!this.initialized) throw new Error('Wordle module not initialized')

    guess = guess.toUpperCase();
    if(!guess.length || guess.length > 5) return

    const guessContainsOnlyLetters = /^[A-Z]+$/.test(guess);
    if(!guessContainsOnlyLetters) return

    if(this.todayWordle.guessed) return

    this.needsRender = true
    const guessObj = {
      username: issuer,
      userId: issuerId,
      guess: {
        valid: FIVE_CHAR_WORDS.includes(guess),
        letters: [] as Wordle['todayWordle']['guesses'][number]['guess']['letters']
      }
    }
    for(let i = 0; i < 5; i++) {
      const value = guess[i];
      if(value === this.todayWordle.word[i]) {
        guessObj.guess.letters.push({ value, status: "correct" })
      } else if(this.todayWordle.word.includes(value)) {
        guessObj.guess.letters.push({ value, status: "present" })
      } else {
        guessObj.guess.letters.push({ value, status: "absent" })
      }
    }
  
    this.todayWordle.guessed = guess === this.todayWordle.word;
    this.todayWordle.guesses.push(guessObj);
  
    if(this.todayWordle.guessed) {
      const userIndex = this.scoreBoard.findIndex(user => user.username === issuer);
      if(userIndex === -1) {
        this.scoreBoard.push({ username: issuer, userId: issuerId, guesses: 1});
      } else {
        this.scoreBoard[userIndex].guesses += 1;
      }
      this.scoreBoard.sort((a, b) => b.guesses - a.guesses);
      await this.save()
    }
  }

  public async render(): Promise<string> {
    const { name, owner } = State.getConfig('datas.repo')
    const url = `https://github.com/${owner}/${name}`
    const { todayWordle, scoreBoard } = this
    let md = `<h3 align="center">A classic Wordle</h3>\n`
    md += `<table align="center">\n  <thead>\n    <tr>\n      <th colspan="5">Wordle</th><th>Player</th>\n    </tr>\n  </thead>\n  <tbody>\n`
    md += todayWordle.guesses.map(guess => {
      let letterTds: string
      if(!guess.guess.valid) letterTds = guess.guess.letters.map(letter => `      <td>$\\text{\\color{red}{${letter.value}}}$</td>\n`).join('')
      else letterTds = guess.guess.letters.map(letter => `      <td>${letter.status === 'correct' ? `$\\text{\\color{lightgreen}{${letter.value}}}$` : (letter.status === 'present' ? `$\\text{\\color{orange}{${letter.value}}}$` : `$\\text{\\color{white}{${letter.value}}}$`)}</td>\n`).join('')
      return `    <tr>\n${letterTds}      <td>\n        <a href="https://github.com/${guess.username}">@${guess.username}</a>\n      </td>\n    </tr>\n`
    }).join('')

    md += `    <tr>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>\n        <a href="${url}/issues/new?body=Please+only+add+your+word+to+the+title.+Just+click+%22Submit+new+issue%22.+You+don%27t+need+to+do+anything+else+%3AD&title=Wordle%3A+">Submit a word</a>\n      </td>\n    </tr>\n`
    md += `  </tbody>\n</table>\n`

    md += `<table align="center">\n  <thead>\n    <tr>\n      <th colspan="4">Scoreboard</th>\n    </tr>\n    <tr>\n      <th>Rank</th>\n      <th colspan="2">Player</th>\n      <th>Wins</th>\n    </tr>\n  </thead>\n  <tbody>\n`
    md += scoreBoard.map((user, index) => `    <tr>\n      <td align="center">${index + 1}</td>\n      <td align="center">\n        <a href="https://github.com/${user.username}">\n          <img src="https://avatars.githubusercontent.com/u/${user.userId}?size=32" width="40" height="40"/>\n        </a>\n      </td>\n      <td>\n        <a href="https://github.com/${user.username}">@${user.username}</a>\n      </td>\n      <td align="center">${user.guesses}</td>\n    </tr>\n`).join('')
    md += `  </tbody>\n</table>\n\n`

    md += `<hr>\n\n`
    return md
  }
}