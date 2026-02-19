// src/config/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCub221Qv15WX7UeVcD1UqF7w7V7LcTGTQ",
    authDomain: "toca-do-frango-ef361.firebaseapp.com",
    projectId: "toca-do-frango-ef361",
    storageBucket: "toca-do-frango-ef361.firebasestorage.app",
    messagingSenderId: "388111722320",
    appId: "1:388111722320:web:5afe17d0a0ff530556ee55",
    measurementId: "G-KZ3TW2ZPTW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
export default app;