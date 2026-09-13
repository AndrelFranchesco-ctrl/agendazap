import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDadosNegocio } from '../../hooks/useDadosNegocio'
import { useHorariosDoDia } from '../../hooks/useHorariosDoDia'
import { criarAgendamento, HorarioIndisponivelError } from '../../services/agendamentos'
import ServicoList from './components/ServicoList'
import SeletorDataHora from './components/SeletorDataHora'
import FormularioCliente from './components/FormularioCliente'
import Confirmacao from './components/Confirmacao'
import styles from './Agendamento.module.css'

const ETAPAS = ['servico', 'horario', 'dados', 'confirmado']
const TITULO_ETAPA = {
  servico: 'Escolha o serviço',
  horario: 'Escolha o dia e horário',
  dados: 'Seus dados',
  confirmado: '',
}

function hojeSemHora() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Agendamento() {
  const { slug = 'demo' } = useParams()
  const { negocio, servicos, carregando, erro, ehDemo } = useDadosNegocio(slug)

  const [etapa, setEtapa] = useState('servico')
  const [servico, setServico] = useState(null)
  const [dia, setDia] = useState(hojeSemHora())
  const [horario, setHorario] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState(null)
  const [cliente, setCliente] = useState(null)

  const { horarios, carregando: carregandoHorarios } = useHorariosDoDia({
    negocio,
    servico,
    dia,
    ehDemo,
  })

  const indiceEtapa = ETAPAS.indexOf(etapa)

  function voltar() {
    setErroEnvio(null)
    setEtapa(ETAPAS[Math.max(0, indiceEtapa - 1)])
  }

  function escolherServico(s) {
    setServico(s)
    setEtapa('horario')
  }

  function escolherHorario(h) {
    setHorario(h)
    setEtapa('dados')
  }

  async function confirmarAgendamento({ nome, telefone }) {
    setEnviando(true)
    setErroEnvio(null)
    setCliente({ nome, telefone })

    try {
      if (ehDemo) {
        await new Promise((resolve) => setTimeout(resolve, 700))
      } else {
        await criarAgendamento({
          negocioId: negocio.id,
          servicoId: servico.id,
          servicoNome: servico.nome,
          duracaoMin: servico.duracaoMin,
          clienteNome: nome,
          clienteTelefone: telefone,
          dataHoraInicio: horario,
        })
      }
      setEtapa('confirmado')
    } catch (e) {
      if (e instanceof HorarioIndisponivelError) {
        setErroEnvio(e.message)
        setEtapa('horario')
        setHorario(null)
      } else {
        setErroEnvio('Não foi possível confirmar. Tente novamente em instantes.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <div className={styles.pagina}>
        <p className={styles.mensagemCentral}>Carregando…</p>
      </div>
    )
  }

  if (erro || !negocio) {
    return (
      <div className={styles.pagina}>
        <p className={styles.mensagemCentral}>
          Não encontramos essa página de agendamento. Confira o link com o estabelecimento.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        {etapa !== 'confirmado' && indiceEtapa > 0 && (
          <button type="button" className={styles.botaoVoltar} onClick={voltar} aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div>
          <p className={styles.nomeNegocio}>{negocio.nome}</p>
          {etapa !== 'confirmado' && (
            <p className={styles.progresso}>
              Passo {indiceEtapa + 1} de 3 — {TITULO_ETAPA[etapa]}
            </p>
          )}
        </div>
      </header>

      <main className={styles.conteudo}>
        {etapa === 'servico' && (
          <ServicoList servicos={servicos} selecionado={servico} aoSelecionar={escolherServico} />
        )}

        {etapa === 'horario' && (
          <SeletorDataHora
            diaSelecionado={dia}
            aoSelecionarDia={setDia}
            horarios={horarios}
            carregandoHorarios={carregandoHorarios}
            horarioSelecionado={horario}
            aoSelecionarHorario={escolherHorario}
          />
        )}

        {etapa === 'dados' && (
          <FormularioCliente enviando={enviando} erroEnvio={erroEnvio} aoConfirmar={confirmarAgendamento} />
        )}

        {etapa === 'confirmado' && (
          <Confirmacao negocio={negocio} servico={servico} horario={horario} nomeCliente={cliente?.nome} />
        )}
      </main>
    </div>
  )
}
