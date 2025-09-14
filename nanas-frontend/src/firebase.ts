import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD-Ovid7r13ZzAypH0aOKWzbvP1kxwUlFQ",
  authDomain: "nanas-caa94.firebaseapp.com",
  projectId: "nanas-caa94",
  storageBucket: "nanas-caa94.firebasestorage.app",
  messagingSenderId: "335022969515",
  appId: "1:335022969515:web:06d417028575f571ff1dee",
  measurementId: "G-06L592YJTM"
};


const app = initializeApp(firebaseConfig)


export const auth = getAuth(app)
export const db = getFirestore(app)
export default app

