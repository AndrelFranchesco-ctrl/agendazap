import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
  writeBatch,
  Timestamp,
  doc,
  documentId,
} from 'firebase/firestore'
import { db } from './firebase'
import { blocosOcupados, chaveDoBloco, parseChaveDoBloco, INTERVALO_MIN } from '../lib/horarios'

function inicioDoDia(data) {
  const d = new Date(data)
  d.setHours(0, 0, 0, 0)
  return d
}

function fimDoDia(data) {
  const d = new Date(data)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Onde ficam as travas de horário: por Profissional quando o negócio usa esse
 * modelo (ADR-0005), ou no negócio inteiro no modo de compatibilidade (negócio
 * sem nenhum Profissional cadastrado — negócios antigos ou dono que atende sozinho).
 */
function refAgendaTravas(negocioId, profissionalId) {
  return profissionalId
    ? collection(db, 'negocios', negocioId, 'profissionais', profissionalId, 'agendaTravas')
    : collection(db, 'negocios', negocioId, 'agendaTravas')
}

/**
 * Blocos de 15min ocupados por agendamentos confirmados, no dia informado.
 *
 * Lê a coleção pública `agendaTravas` (só {agendamentoId}, sem dado do cliente)
 * em vez da coleção `agendamentos` (que tem nome/telefone do cliente) — a tela
 * pública de agendamento não pode ler dados de outros clientes só pra calcular
 * horário livre. Ver firestore.rules e ADR-0003/ADR-0005.
 */
export async function buscarOcupadosDoDia(negocioId, dataBase, profissionalId) {
  const ref = refAgendaTravas(negocioId, profissionalId)
  const diaSeguinte = new Date(dataBase)
  diaSeguinte.setDate(diaSeguinte.getDate() + 1)
  const q = query(
    ref,
    where(documentId(), '>=', chaveDoBloco(inicioDoDia(dataBase))),
    where(documentId(), '<', chaveDoBloco(inicioDoDia(diaSeguinte)))
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const inicio = parseChaveDoBloco(d.id)
    return { inicio, fim: new Date(inicio.getTime() + INTERVALO_MIN * 60000) }
  })
}

/** Bloqueios (folgas/feriados) de um negócio que colidem com o dia informado. */
export async function buscarBloqueiosDoDia(negocioId, dataBase) {
  const ref = collection(db, 'negocios', negocioId, 'bloqueios')
  const q = query(ref, where('inicio', '<=', Timestamp.fromDate(fimDoDia(dataBase))))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return { inicio: data.inicio.toDate(), fim: data.fim.toDate() }
    })
    .filter((b) => b.fim >= inicioDoDia(dataBase))
}

/**
 * Lista os agendamentos do dia pro PAINEL DO DONO — com nome/telefone do
 * cliente (PII). Nunca usar isso na tela pública (ver ADR-0003); a regra do
 * Firestore já restringe essa coleção só ao dono do negócio.
 */
export async function listarAgendamentosDoDia(negocioId, dataBase) {
  const ref = collection(db, 'negocios', negocioId, 'agendamentos')
  const q = query(
    ref,
    where('dataHoraInicio', '>=', Timestamp.fromDate(inicioDoDia(dataBase))),
    where('dataHoraInicio', '<=', Timestamp.fromDate(fimDoDia(dataBase))),
    orderBy('dataHoraInicio')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return { id: d.id, ...data, dataHoraInicio: data.dataHoraInicio.toDate() }
  })
}

/**
 * Cancela um agendamento e libera os blocos de horário que ele ocupava
 * (ver ADR-0002/ADR-0003 — sem isso o horário fica "fantasma-ocupado" pra
 * sempre, mesmo aparecendo cancelado no painel). `profissionalId` decide de
 * qual coleção de travas apagar (ver ADR-0005) — precisa ser o mesmo valor
 * gravado no agendamento original.
 */
export async function cancelarAgendamento({ negocioId, agendamentoId, dataHoraInicio, duracaoMin, profissionalId }) {
  const negocioRef = doc(db, 'negocios', negocioId)
  const travasRef = refAgendaTravas(negocioId, profissionalId)
  const batch = writeBatch(db)

  batch.update(doc(negocioRef, 'agendamentos', agendamentoId), { status: 'cancelado' })

  blocosOcupados(dataHoraInicio, duracaoMin).forEach((b) => {
    batch.delete(doc(travasRef, chaveDoBloco(b)))
  })

  await batch.commit()
}

export class HorarioIndisponivelError extends Error {
  constructor() {
    super('Esse horário acabou de ser ocupado. Escolha outro, por favor.')
    this.name = 'HorarioIndisponivelError'
  }
}

/**
 * Cria um agendamento de forma atômica usando trava por documentos-bloco
 * (ver ADR-0002 — o SDK Web do Firestore não permite query dentro de transação,
 * só leitura de documentos individuais por referência). Quando `profissionalId`
 * é informado, a trava e o agendamento ficam atrelados a esse Profissional
 * (ADR-0005); sem ele, ao negócio inteiro (modo de compatibilidade).
 *
 * Nunca criar um agendamento fora desta função.
 */
export async function criarAgendamento({
  negocioId,
  profissionalId,
  profissionalNome,
  servicoId,
  servicoNome,
  duracaoMin,
  clienteNome,
  clienteTelefone,
  dataHoraInicio,
}) {
  const negocioRef = doc(db, 'negocios', negocioId)
  const agendamentoRef = doc(collection(negocioRef, 'agendamentos'))
  const travasRef = refAgendaTravas(negocioId, profissionalId)
  const blocos = blocosOcupados(dataHoraInicio, duracaoMin)
  const travaRefs = blocos.map((b) => doc(travasRef, chaveDoBloco(b)))

  await runTransaction(db, async (tx) => {
    // Todas as leituras precisam vir antes de qualquer escrita na transação.
    const travasExistentes = await Promise.all(travaRefs.map((ref) => tx.get(ref)))
    if (travasExistentes.some((snap) => snap.exists())) {
      throw new HorarioIndisponivelError()
    }

    tx.set(agendamentoRef, {
      ...(profissionalId ? { profissionalId, profissionalNome } : {}),
      servicoId,
      servicoNome,
      duracaoMin,
      clienteNome,
      clienteTelefone,
      dataHoraInicio: Timestamp.fromDate(dataHoraInicio),
      status: 'confirmado',
      lembreteEnviado: false,
      criadoEm: Timestamp.now(),
    })

    travaRefs.forEach((ref) => {
      tx.set(ref, { agendamentoId: agendamentoRef.id })
    })
  })

  return agendamentoRef.id
}
