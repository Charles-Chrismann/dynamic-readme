import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { five_char_words } from './word_list';
import * as config from 'config.json';

@Injectable()
export class WordleService {
    todayWordle: {
        word: string,
        guessed: boolean,
        guesses: {
            username: string,
            userId: number,
            guess: { letter: string, status: "correct" | "present" | "absent" }[]
        }[]
    };
    scoreBoard: {
        users: {
            username: string,
            userId: number,
            guesses: number
        }[]
    }
    constructor(private readonly firebaseService: FirebaseService) {}

    // scheduled
    async wordle() {
        const word = five_char_words[Math.floor(Math.random() * five_char_words.length)]
        const wordle = {
            word,
            guessed: false,
            guesses: []
        }
        this.todayWordle = wordle;
        await this.firebaseService.setWordle(wordle);
        this.scoreBoard = await this.firebaseService.getWordleScoreBoard();

        return 'wordle';
    }

    async guess(guess: string, issuer: string, issuerId: number) {
        guess = guess.toLowerCase();
        const guessContainsOnlyLetters = /^[a-z]+$/.test(guess);
        if(!guessContainsOnlyLetters) return
        const wordle = await this.firebaseService.getWordle();
        if(!wordle || wordle.guessed) return
        const guessObj = {
            username: issuer,
            userId: issuerId,
            guess: [] as { letter: string, status: "correct" | "present" | "absent" }[]
        }

        for(let i = 0; i < 5; i++) {
            const letter = guess[i];
            if(letter === wordle.word[i]) {
                guessObj.guess.push({ letter, status: "correct" })
            } else if(wordle.word.includes(letter)) {
                guessObj.guess.push({ letter, status: "present" })
            } else {
                guessObj.guess.push({ letter, status: "absent" })
            }
        }

        wordle.guessed = guess === wordle.word;
        wordle.guesses.push(guessObj);
        await this.firebaseService.setWordle(wordle);
        this.todayWordle = wordle;

        let scoreBoard = await this.firebaseService.getWordleScoreBoard();
        this.scoreBoard = scoreBoard;
        if(wordle.guessed) {
            if(!scoreBoard) scoreBoard = { users: [] };
            const userIndex = scoreBoard.users.findIndex(user => user.username === issuer);
            if(userIndex === -1) {
                scoreBoard.users.push({ username: issuer, userId: issuerId, guesses: 1});
            } else {
                scoreBoard.users[userIndex].guesses += 1;
            }
            scoreBoard.users.sort((a, b) => b.guesses - a.guesses);
            await this.firebaseService.setWordleScoreBoard(scoreBoard);
            this.scoreBoard = scoreBoard;
        }
    }


    toMd(): string {
        let str = `<h3 align="center">A classic Wordle</h3>`
        str += `<table align="center"><thead><tr><th colspan="5">Wordle</th><th>Player</th></tr></thead><tbody>`
        str += this.todayWordle.guesses.map(guess => `<tr>${guess.guess.map(letter => `<td>${letter.status === 'correct' ? `$\\text{\\color{lightgreen}{${letter.letter.toUpperCase()}}}$` : (letter.status === 'present' ? `$\\text{\\color{orange}{${letter.letter.toUpperCase()}}}$` : `$\\text{\\color{white}{${letter.letter.toUpperCase()}}}$`)}</td>`).join('')}<td><a href="https://github.com/${guess.username}">@${guess.username}</a></td></tr>`)

        str += `<tr><td>‎ </td><td>‎ </td><td>‎ </td><td>‎ </td><td>‎ </td><td><a href="${config.datas.repo.url.endsWith('/') ? config.datas.repo.url.slice(0, -1) : config.datas.repo.url}/issues/new?body=Please+only+add+your+word+to+the+title.+Just+click+%22Submit+new+issue%22.+You+don%27t+need+to+do+anything+else+%3AD&title=Wordle%3A+"><s>Submit a word</s> (Not working wait until ~ 15/08)</a></td></tr>`
        str += `</tbody></table>`

        str += `<table align="center"><thead><tr><th colspan="4">Scoreboard</th></tr><tr><th>Rank</th><th colspan="2">Player</th><th>Wins</th></tr></thead><tbody>`
        str += this.scoreBoard.users.map((user, index) => `<tr><td align="center">${index + 1}</td><td align="center"><a href="https://github.com/${user.username}"><img src="https://avatars.githubusercontent.com/u/${user.userId}?size=32"></a></td><td><a href="https://github.com/${user.username}">@${user.username}</a></td><td align="center">${user.guesses}</td></tr>`)
        str += `</tbody></table>`

        str += `<hr>`
        return str
    }
}
