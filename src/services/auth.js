import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'

export function cadastrar(email, senha) {
  return createUserWithEmailAndPassword(auth, email, senha)
}

export function entrar(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha)
}

export function sair() {
  return signOut(auth)
}

export function observarUsuario(callback) {
  return onAuthStateChanged(auth, callback)
}
