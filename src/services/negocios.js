import { doc, setDoc, getDoc, runTransaction, writeBatch, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { gerarCodigoEquipe } from '../lib/codigo'

export class SlugIndisponivelError extends Error {
  constructor() {
    super('Esse link já está sendo usado por outro negócio. Escolha outro.')
    this.name = 'SlugIndisponivelError'
  }
}

class CodigoEquipeColidiuError extends Error {}

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
 * Cria um negócio novo, em duas etapas:
 *   1. Cria `negocios/{id}` sozinho, sem slug ainda.
 *   2. Reserva slug + código de equipe numa transação (ADR-0004/ADR-0006).
 *
 * Precisa ser em duas etapas porque a regra de segurança de `slugs`/
 * `codigosEquipe` verifica "quem está criando isso é dono do negócio
 * referenciado?" via `get()` — e um `get()` dentro de uma regra NÃO enxerga
 * escritas irmãs da MESMA transação, só o que já está de fato commitado no
 * banco. Testado e confirmado: tentar fazer tudo numa transação só faz essa
 * checagem falhar sempre, mesmo no caso legítimo.
 *
 * Residual aceito: se a etapa 2 falhar (slug já em uso), o documento da
 * etapa 1 fica órfão (sem slug, invisível pra qualquer busca pública, já que
 * nada aponta pra ele) — inofensivo, só sujeira de dado. Nunca criar um
 * documento em `negocios` fora desta função.
 */
export async function criarNegocio({ uid, nome, slug, whatsappNumero }) {
  const negocioRef = doc(db, 'negocios', crypto.randomUUID())
  const usuarioRef = doc(db, 'usuarios', uid)

  // Etapa 1 — sem get() nenhum na regra, não tem problema de timing.
  await setDoc(negocioRef, {
    nome,
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

  // Etapa 2 — agora o negócio já existe de fato, ehDonoDoNegocio funciona.
  const slugRef = doc(db, 'slugs', slug)

  // Colisão do código de equipe (6 caracteres, ~32^6 combinações) é praticamente
  // impossível, mas como é gerado no cliente sem checar antes, tentamos de novo
  // com um código novo se acontecer — nunca sobrescrever a reserva de outro negócio.
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigoEquipe = gerarCodigoEquipe()
    const codigoRef = doc(db, 'codigosEquipe', codigoEquipe)

    try {
      await runTransaction(db, async (tx) => {
        const [slugSnap, codigoSnap] = [await tx.get(slugRef), await tx.get(codigoRef)]
        if (slugSnap.exists()) throw new SlugIndisponivelError()
        if (codigoSnap.exists()) throw new CodigoEquipeColidiuError()

        tx.set(slugRef, { negocioId: negocioRef.id })
        tx.set(codigoRef, { negocioId: negocioRef.id })
        tx.update(negocioRef, { slug, codigoEquipe })
        tx.set(usuarioRef, { negocioId: negocioRef.id, tipo: 'dono' }, { merge: true })
      })
      return negocioRef.id
    } catch (e) {
      if (e instanceof CodigoEquipeColidiuError) continue
      throw e
    }
  }
  throw new Error('Não foi possível gerar um código de equipe. Tente novamente.')
}

/** Resolve um código de equipe (ADR-0006) no negócio correspondente. Retorna null se inválido. */
export async function buscarNegocioPorCodigoEquipe(codigo) {
  const codigoSnap = await getDoc(doc(db, 'codigosEquipe', codigo))
  if (!codigoSnap.exists()) return null

  const { negocioId } = codigoSnap.data()
  const negocioSnap = await getDoc(doc(db, 'negocios', negocioId))
  if (!negocioSnap.exists()) return null

  return { id: negocioSnap.id, ...negocioSnap.data() }
}

/**
 * Gera um código de equipe pra um negócio que não tem um ainda — caso de
 * negócios criados antes da ADR-0006 existir (ex: dados de teste antigos).
 * Novos negócios já ganham o código na criação (ver criarNegocio).
 */
export async function gerarNovoCodigoEquipe(negocioId) {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigoEquipe = gerarCodigoEquipe()
    const codigoRef = doc(db, 'codigosEquipe', codigoEquipe)
    const codigoSnap = await getDoc(codigoRef)
    if (codigoSnap.exists()) continue

    const batch = writeBatch(db)
    batch.set(codigoRef, { negocioId })
    batch.update(doc(db, 'negocios', negocioId), { codigoEquipe })
    await batch.commit()
    return codigoEquipe
  }
  throw new Error('Não foi possível gerar um código de equipe. Tente novamente.')
}

/** Atualiza campos editáveis do negócio (nunca nome do slug — ver ADR-0004/regras). */
export async function atualizarNegocio(negocioId, dados) {
  await updateDoc(doc(db, 'negocios', negocioId), dados)
}
