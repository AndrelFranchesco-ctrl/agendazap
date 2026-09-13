import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

/** Perfil do dono (vínculo com o negócio). `undefined` = ainda não existe. */
export async function buscarPerfil(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  return snap.exists() ? snap.data() : null
}
