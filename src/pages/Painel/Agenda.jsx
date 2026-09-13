import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { listarAgendamentosDoDia, cancelarAgendamento } from '../../services/agendamentos'
import { formatarHora, formatarDataCurta } from '../../lib/horarios'
import { paraE164 } from '../../lib/telefone'
import styles from './Agenda.module.css'

const NOME_STATUS = { confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }

function hojeSemHora() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function ehHoje(data) {
  return data.toDateString() === new Date().toDateString()
}

function chaveDoDia(negocioId, dia) {
  return `${negocioId}_${dia.toDateString()}`
}

export default function Agenda() {
  const { negocio } = useOutletContext()
  const [dia, setDia] = useState(hojeSemHora)
  const [estado, setEstado] = useState({ chave: null, agendamentos: [] })
  const [cancelandoId, setCancelandoId] = useState(null)

  const chaveAtual = chaveDoDia(negocio.id, dia)

  useEffect(() => {
    let cancelado = false
    listarAgendamentosDoDia(negocio.id, dia).then((lista) => {
      if (!cancelado) setEstado({ chave: chaveDoDia(negocio.id, dia), agendamentos: lista })
    })
    return () => {
      cancelado = true
    }
  }, [negocio.id, dia])

  const recarregar = useCallback(async () => {
    const lista = await listarAgendamentosDoDia(negocio.id, dia)
    setEstado({ chave: chaveDoDia(negocio.id, dia), agendamentos: lista })
  }, [negocio.id, dia])

  const carregando = estado.chave !== chaveAtual
  const agendamentos = estado.agendamentos

  function mudarDia(deltaDias) {
    setDia((d) => {
      const novo = new Date(d)
      novo.setDate(novo.getDate() + deltaDias)
      return novo
    })
  }

  async function aoCancelar(agendamento) {
    if (!confirm(`Cancelar o horário de ${agendamento.clienteNome} às ${formatarHora(agendamento.dataHoraInicio)}?`)) {
      return
    }
    setCancelandoId(agendamento.id)
    try {
      await cancelarAgendamento({
        negocioId: negocio.id,
        agendamentoId: agendamento.id,
        dataHoraInicio: agendamento.dataHoraInicio,
        duracaoMin: agendamento.duracaoMin,
        profissionalId: agendamento.profissionalId,
      })
      await recarregar()
    } finally {
      setCancelandoId(null)
    }
  }

  const ativos = agendamentos.filter((a) => a.status !== 'cancelado')
  const cancelados = agendamentos.filter((a) => a.status === 'cancelado')

  return (
    <div>
      <div className={styles.navegacaoDia}>
        <button type="button" className={styles.botaoNav} onClick={() => mudarDia(-1)} aria-label="Dia anterior">
          ←
        </button>
        <div className={styles.diaAtual}>
          <span>{formatarDataCurta(dia)}</span>
          {!ehHoje(dia) && (
            <button type="button" className={styles.linkHoje} onClick={() => setDia(hojeSemHora())}>
              Ir para hoje
            </button>
          )}
        </div>
        <button type="button" className={styles.botaoNav} onClick={() => mudarDia(1)} aria-label="Próximo dia">
          →
        </button>
      </div>

      {carregando && <p className={styles.mensagem}>Carregando…</p>}

      {!carregando && ativos.length === 0 && <p className={styles.mensagem}>Nenhum agendamento nesse dia.</p>}

      <ul className={styles.lista}>
        {ativos.map((a) => (
          <li key={a.id} className={styles.item}>
            <div className={styles.hora}>{formatarHora(a.dataHoraInicio)}</div>
            <div className={styles.detalhes}>
              <p className={styles.cliente}>{a.clienteNome}</p>
              <p className={styles.servico}>
                {a.servicoNome} · {a.duracaoMin} min
                {a.profissionalNome && ` · ${a.profissionalNome}`}
              </p>
              <a
                className={styles.linkWhats}
                href={`https://wa.me/${paraE164(a.clienteTelefone)}`}
                target="_blank"
                rel="noreferrer"
              >
                {a.clienteTelefone}
              </a>
            </div>
            <div className={styles.acoes}>
              <span className={styles.status}>{NOME_STATUS[a.status] ?? a.status}</span>
              {a.status === 'confirmado' && (
                <button
                  type="button"
                  className={styles.botaoCancelar}
                  onClick={() => aoCancelar(a)}
                  disabled={cancelandoId === a.id}
                >
                  {cancelandoId === a.id ? 'Cancelando…' : 'Cancelar'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {cancelados.length > 0 && (
        <details className={styles.detalhesCancelados}>
          <summary>{cancelados.length} cancelado(s) nesse dia</summary>
          <ul className={styles.lista}>
            {cancelados.map((a) => (
              <li key={a.id} className={`${styles.item} ${styles.itemCancelado}`}>
                <div className={styles.hora}>{formatarHora(a.dataHoraInicio)}</div>
                <div className={styles.detalhes}>
                  <p className={styles.cliente}>{a.clienteNome}</p>
                  <p className={styles.servico}>{a.servicoNome}</p>
                </div>
                <span className={styles.status}>Cancelado</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
