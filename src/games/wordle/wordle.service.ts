import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { five_char_words } from './word_list';

@Injectable()
export class WordleService {
    todayWordle: string;
    constructor(private readonly firebaseService: FirebaseService) {}

    // scheduled
    async wordle() {
        this.todayWordle = five_char_words[Math.floor(Math.random() * five_char_words.length)]
        const wordle = {
            word: this.todayWordle,
            guessed: false,
            guesses: []
        }
        await this.firebaseService.setWordle(wordle);

        return 'wordle';
    }

    async guess(guess: string, issuer: string) {
        guess = guess.toUpperCase();
        const guessContainsOnlyLetters = /^[a-zA-Z]+$/.test(guess);
        if(!guessContainsOnlyLetters) return
        const wordle = await this.firebaseService.getWordle();
        // if(!wordle || wordle.guessed) return
        wordle.word = wordle.word.toUpperCase();
        const guessObj = {
            username: issuer,
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
        if(wordle.guessed) {
            let scoreBoard = await this.firebaseService.getWordleScoreBoard();
            if(!scoreBoard) await this.firebaseService.setWordleScoreBoard({ users: [] });
            scoreBoard = await this.firebaseService.getWordleScoreBoard();
            // scoreBoard.users.push({ username: issuer, guesses: wordle.guesses.length });
            const userIndex = scoreBoard.users.findIndex(user => user.username === issuer);
            if(userIndex === -1) {
                scoreBoard.users.push({ username: issuer, guesses: 1});
            } else {
                scoreBoard.users[userIndex].guesses += 1;
            }
            scoreBoard.users.sort((a, b) => b.guesses - a.guesses);
            await this.firebaseService.setWordleScoreBoard(scoreBoard);
        }
    }


    toMd(): string {
        return ""
    }
}
