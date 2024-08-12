import { Injectable } from '@nestjs/common';
import { five_char_words } from './word_list';
import * as config from 'config.json';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class WordleService {
    todayWordle: {
        word: string,
        guessed: boolean,
        guesses: {
            username: string,
            userId: number,
            guess: {
              valid: boolean,
              letters: { value: string, status: "correct" | "present" | "absent" }[]
            }
        }[]
    };
    scoreBoard: {
        users: {
            username: string,
            userId: number,
            guesses: number
        }[]
    }
  constructor(private redisService: RedisService) {}

  async onModuleInit() {
    if(!await this.redisService.client.get('wordle')) await this.wordle()
    if(!await this.redisService.client.get('wordle-scoreBoard')) {
      await this.redisService.client.set(
        'wordle-scoreBoard',
        JSON.stringify({
          users: [] as {
            username: string,
            userId: number,
            guesses: number
            }[]
          }
        )
      )
    }
  }

  async wordle() {
    const word = five_char_words[Math.floor(Math.random() * five_char_words.length)]
    const wordle = {
      word,
      guessed: false,
      guesses: []
    }
    await this.redisService.client.set('wordle', JSON.stringify(wordle))

    return 'wordle';
  }

  async guess(guess: string, issuer: string, issuerId: number) {
    guess = guess.toUpperCase();
    if(!guess.length || guess.length > 5) return
    const guessContainsOnlyLetters = /^[A-Z]+$/.test(guess);
    if(!guessContainsOnlyLetters) return
    const wordle = JSON.parse(await this.redisService.client.get('wordle'));
    if(!wordle || wordle.guessed) return
    const guessObj = {
      username: issuer,
      userId: issuerId,
      guess: {
        valid: five_char_words.includes(guess),
        letters: [] as { value: string, status: "correct" | "present" | "absent" }[]
      }
    }
    for(let i = 0; i < 5; i++) {
      const value = guess[i];
      if(value === wordle.word[i]) {
        guessObj.guess.letters.push({ value, status: "correct" })
      } else if(wordle.word.includes(value)) {
        guessObj.guess.letters.push({ value, status: "present" })
      } else {
        guessObj.guess.letters.push({ value, status: "absent" })
      }
    }

    wordle.guessed = guess === wordle.word;
    wordle.guesses.push(guessObj);
    await this.redisService.client.set('wordle', JSON.stringify(wordle))
    this.todayWordle = wordle;

    let scoreBoard = JSON.parse(await this.redisService.client.get('wordle-scoreBoard'))
    if(wordle.guessed) {
      if(!scoreBoard) scoreBoard = { users: [] };
      const userIndex = scoreBoard.users.findIndex(user => user.username === issuer);
      if(userIndex === -1) {
        scoreBoard.users.push({ username: issuer, userId: issuerId, guesses: 1});
      } else {
        scoreBoard.users[userIndex].guesses += 1;
      }
      scoreBoard.users.sort((a, b) => b.guesses - a.guesses);
      await this.redisService.client.set('wordle-scoreBoard', JSON.stringify(scoreBoard))
    }
  }


  async toMd(): Promise<string> {
    const todayWordle = JSON.parse(await this.redisService.client.get('wordle'))
    const scoreBoard = JSON.parse(await this.redisService.client.get('wordle-scoreBoard'))
    let str = `<h3 align="center">A classic Wordle</h3>\n`
    str += `<table align="center">\n  <thead>\n    <tr>\n      <th colspan="5">Wordle</th><th>Player</th>\n    </tr>\n  </thead>\n  <tbody>\n`
    str += todayWordle.guesses.map(guess => {
      let letterTds
      if(!guess.guess.valid) letterTds = guess.guess.letters.map(letter => `      <td>$\\text{\\color{red}{${letter.value}}}$</td>\n`).join('')
      else letterTds = guess.guess.letters.map(letter => `      <td>${letter.status === 'correct' ? `$\\text{\\color{lightgreen}{${letter.value}}}$` : (letter.status === 'present' ? `$\\text{\\color{orange}{${letter.value}}}$` : `$\\text{\\color{white}{${letter.value}}}$`)}</td>\n`).join('')
      return `    <tr>\n${letterTds}      <td>\n        <a href="https://github.com/${guess.username}">@${guess.username}</a>\n      </td>\n    </tr>\n`
    }).join('')

    str += `    <tr>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>‎ </td>\n      <td>\n        <a href="${config.datas.repo.url.endsWith('/') ? config.datas.repo.url.slice(0, -1) : config.datas.repo.url}/issues/new?body=Please+only+add+your+word+to+the+title.+Just+click+%22Submit+new+issue%22.+You+don%27t+need+to+do+anything+else+%3AD&title=Wordle%3A+">Submit a word</a>\n      </td>\n    </tr>\n`
    str += `  </tbody>\n</table>\n`

    str += `<table align="center">\n  <thead>\n    <tr>\n      <th colspan="4">Scoreboard</th>\n    </tr>\n    <tr>\n      <th>Rank</th>\n      <th colspan="2">Player</th>\n      <th>Wins</th>\n    </tr>\n  </thead>\n  <tbody>\n`
    str += scoreBoard.users.map((user, index) => `    <tr>\n      <td align="center">${index + 1}</td>\n      <td align="center">\n        <a href="https://github.com/${user.username}">\n          <img src="https://avatars.githubusercontent.com/u/${user.userId}?size=32">\n        </a>\n      </td>\n      <td>\n        <a href="https://github.com/${user.username}">@${user.username}</a>\n      </td>\n      <td align="center">${user.guesses}</td>\n    </tr>\n`).join('')
    str += `  </tbody>\n</table>\n\n`

    str += `<hr>\n\n`
    return str
  }
}
