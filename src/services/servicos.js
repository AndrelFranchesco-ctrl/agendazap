import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from './firebase'

/** Lista os serviços ativos de um negócio, para a tela pública de agendamento. */
export async function listarServicosAtivos(negocioId) {
  const ref = collection(db, 'negocios', negocioId, 'servicos')
  const q = query(ref, where('ativo', '==', true), orderBy('nome'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
