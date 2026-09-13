import { doc, getDoc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export class SlugIndisponivelError extends Error {
  constructor() {
    super('Esse link já está sendo usado por outro negócio. Escolha outro.')
    this.name = 'SlugIndisponivelError'
  }
}

/** Busca um negócio público pelo slug da URL (ver ADR-0004). Retorna null se não existir. */
export async function buscarNegocioPorSlug(slug) {
  const slugSnap = await getDoc(doc(db, 'slugs', slug))
  if (!slugSnap.exists()) return null

  const { negocioId } = slugSnap.data()
  const negocioSnap = await getDoc(doc(db, 'negocios', negocioId))
  if (!negocioSnap.exists()) return null

  return { id: negocioSnap.id, ...negocioSnap.data() }
}

/**
 * Cria um negócio novo, reservando o slug de forma atômica (ver ADR-0004).
 * Nunca criar um documento em `negocios` fora desta função.
 */
export async function criarNegocio({ uid, nome, slug, whatsappNumero }) {
  const slugRef = doc(db, 'slugs', slug)
  const negocioRef = doc(db, 'negocios', crypto.randomUUID())
  const usuarioRef = doc(db, 'usuarios', uid)

  await runTransaction(db, async (tx) => {
    const slugSnap = await tx.get(slugRef)
    if (slugSnap.exists()) throw new SlugIndisponivelError()

    tx.set(slugRef, { negocioId: negocioRef.id })
    tx.set(negocioRef, {
      nome,
      slug,
      whatsappNumero,
      donoUid: uid,
      horarioFuncionamento: {
        dom: null,
        seg: { abre: '09:00', fecha: '18:00' },
        ter: { abre: '09:00', fecha: '18:00' },
        qua: { abre: '09:00', fecha: '18:00' },
        qui: { abre: '09:00', fecha: '18:00' },
        sex: { abre: '09:00', fecha: '18:00' },
        sab: null,
      },
      criadoEm: serverTimestamp(),
    })
    tx.set(usuarioRef, { negocioId: negocioRef.id }, { merge: true })
  })

  return negocioRef.id
}

/** Atualiza campos editáveis do negócio (nunca nome do slug — ver ADR-0004/regras). */
export async function atualizarNegocio(negocioId, dados) {
  await updateDoc(doc(db, 'negocios', negocioId), dados)
}
