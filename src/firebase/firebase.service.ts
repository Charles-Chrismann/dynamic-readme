import { Injectable } from '@nestjs/common';
import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from 'serviceAccountKey.json';

@Injectable()
export class FirebaseService {
    db;
    constructor() {
        initializeApp({
            credential: cert(<ServiceAccount>serviceAccount),
        });
        this.db = getFirestore();

        // this.test();
    }

    async test() {
        const docRef = this.db.collection('users').doc('alovelace');
        await docRef.set({
            first: 'Ada',
            last: 'Lovelace',
            born: 1815,
        });
        const a = await docRef.get();
        console.log(a.data());
    }

    async setWordle(wordle) {
        const date = new Date();
        const simpleDate = `-${date.getDate().toString().padStart(2, "0")}-${date.getMonth().toString().padStart(2, "0")}-${date.getFullYear()}`;
        const docRef = this.db.collection('wordle').doc('word' + simpleDate);
        await docRef.set(wordle);
    }

    async getWordle() {
        const date = new Date();
        const simpleDate = `-${date.getDate().toString().padStart(2, "0")}-${date.getMonth().toString().padStart(2, "0")}-${date.getFullYear()}`;
        const docRef = this.db.collection('wordle').doc('word' + simpleDate);
        const doc = await docRef.get();
        return doc.data();
    }

    async getWordleScoreBoard() {
        const docRef = this.db.collection('wordle').doc('scoreboard');
        const doc = await docRef.get();
        return doc.data();
    }

    async setWordleScoreBoard(scoreBoard) {
        const docRef = this.db.collection('wordle').doc('scoreboard');
        await docRef.set(scoreBoard);
    }
}
