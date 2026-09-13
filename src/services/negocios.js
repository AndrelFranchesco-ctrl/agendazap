import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from './firebase'

/** Busca um negócio público pelo slug da URL. Retorna null se não existir. */
export async function buscarNegocioPorSlug(slug) {
  const q = query(collection(db, 'negocios'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const doc = snap.docs[0]
  return { id: doc.id, ...doc.data() }
}
