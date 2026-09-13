import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Preenchido depois de criar o projeto Firebase próprio do AgendaZap
// (nunca reutilizar as credenciais do projeto michco-420c1).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const configurado = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

if (!configurado && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[AgendaZap] Firebase não configurado (copie .env.example para .env). ' +
      'A rota /demo funciona normalmente sem isso; qualquer outra rota vai falhar ao carregar dados reais.'
  )
}

// app/auth/db ficam null sem config válida, em vez de derrubar a aplicação inteira
// — assim o modo /demo (que nunca toca Firebase) continua funcionando sem .env.
export const app = configurado ? initializeApp(firebaseConfig) : null
export const auth = configurado ? getAuth(app) : null
export const db = configurado ? getFirestore(app) : null
