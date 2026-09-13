import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from './firebase'

/** Lista os serviços ativos de um negócio, para a tela pública de agendamento. */
export async function listarServicosAtivos(negocioId) {
  const ref = collection(db, 'negocios', negocioId, 'servicos')
  const q = query(ref, where('ativo', '==', true), orderBy('nome'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** Lista todos os serviços (ativos e inativos), pro painel do dono. */
export async function listarTodosServicos(negocioId) {
  const ref = collection(db, 'negocios', negocioId, 'servicos')
  const snap = await getDocs(query(ref, orderBy('nome')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export function criarServico(negocioId, dados) {
  const ref = collection(db, 'negocios', negocioId, 'servicos')
  return addDoc(ref, dados)
}

export function atualizarServico(negocioId, servicoId, dados) {
  return updateDoc(doc(db, 'negocios', negocioId, 'servicos', servicoId), dados)
}

export function excluirServico(negocioId, servicoId) {
  return deleteDoc(doc(db, 'negocios', negocioId, 'servicos', servicoId))
}
