import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  writeBatch,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

/** Profissionais ativos de um negócio, pra tela pública de agendamento. */
export async function listarProfissionaisAtivos(negocioId) {
  const ref = collection(db, 'negocios', negocioId, 'profissionais')
  const q = query(ref, where('ativo', '==', true), orderBy('nome'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** Todos os profissionais (ativos e pendentes), pro painel do dono aprovar/gerenciar. */
export async function listarTodosProfissionais(negocioId) {
  const ref = collection(db, 'negocios', negocioId, 'profissionais')
  const snap = await getDocs(query(ref, orderBy('nome')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** O profissional dono do `uid` logado, dentro de um negócio. Null se não existir. */
export async function buscarMeuProfissional(negocioId, uid) {
  const ref = collection(db, 'negocios', negocioId, 'profissionais')
  const snap = await getDocs(query(ref, where('uid', '==', uid)))
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function buscarProfissional(negocioId, profissionalId) {
  const snap = await getDoc(doc(db, 'negocios', negocioId, 'profissionais', profissionalId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Cria o perfil do profissional (nasce `ativo:false` — ver ADR-0006, precisa
 * o dono aprovar) e vincula `usuarios/{uid}` a esse negócio/profissional.
 */
export async function criarProfissional({
  negocioId,
  uid,
  nome,
  bio,
  servicosIds,
  horarioTrabalho,
  codigoUsado,
}) {
  const negocioRef = doc(db, 'negocios', negocioId)
  const profissionalRef = doc(collection(negocioRef, 'profissionais'))
  const usuarioRef = doc(db, 'usuarios', uid)

  const batch = writeBatch(db)
  batch.set(profissionalRef, {
    uid,
    nome,
    bio,
    servicosIds,
    horarioTrabalho,
    ativo: false,
    codigoUsado,
    criadoEm: serverTimestamp(),
  })
  batch.set(usuarioRef, { negocioId, profissionalId: profissionalRef.id, tipo: 'profissional' }, { merge: true })
  await batch.commit()

  return profissionalRef.id
}

/** O próprio profissional edita perfil/horário — nunca o campo `ativo` (só o dono aprova). */
export function atualizarMeuProfissional(negocioId, profissionalId, dados) {
  return updateDoc(doc(db, 'negocios', negocioId, 'profissionais', profissionalId), dados)
}

export function aprovarProfissional(negocioId, profissionalId) {
  return updateDoc(doc(db, 'negocios', negocioId, 'profissionais', profissionalId), { ativo: true })
}

export function desativarProfissional(negocioId, profissionalId) {
  return updateDoc(doc(db, 'negocios', negocioId, 'profissionais', profissionalId), { ativo: false })
}
