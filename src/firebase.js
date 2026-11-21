import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Configuración de Firebase (no es secreta; la seguridad la dan las reglas de Firestore).
const firebaseConfig = {
  apiKey: 'AIzaSyA7KWp2VezzFwu_1e0acf_28SA26kbG0q0',
  authDomain: 'catalogo-abierto.firebaseapp.com',
  projectId: 'catalogo-abierto',
  storageBucket: 'catalogo-abierto.firebasestorage.app',
  messagingSenderId: '548629282883',
  appId: '1:548629282883:web:7b80038eb78d0f1fee94f6',
  measurementId: 'G-Q5EX3916C5',
}

export const configured = !firebaseConfig.apiKey.startsWith('PEGA')
const app = configured ? initializeApp(firebaseConfig) : null
export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
