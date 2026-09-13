import { useMemo } from 'react'
import { agruparPorPeriodo, formatarHora } from '../../../lib/horarios'
import styles from './SeletorDataHora.module.css'

const NOME_PERIODO = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

function proximosDias(quantidade = 14) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(hoje)
    d.setDate(d.getDate() + i)
    return d
  })
}

function mesmodia(a, b) {
  return a.toDateString() === b.toDateString()
}

export default function SeletorDataHora({
  diaSelecionado,
  aoSelecionarDia,
  horarios,
  carregandoHorarios,
  horarioSelecionado,
  aoSelecionarHorario,
}) {
  const dias = useMemo(() => proximosDias(), [])
  const grupos = useMemo(() => agruparPorPeriodo(horarios), [horarios])

  return (
    <div>
      <div className={styles.diasScroll} role="radiogroup" aria-label="Escolha o dia">
        {dias.map((dia) => {
          const ativo = mesmodia(dia, diaSelecionado)
          return (
            <button
              key={dia.toISOString()}
              type="button"
              role="radio"
              aria-checked={ativo}
              className={`${styles.diaPill} ${ativo ? styles.diaPillAtivo : ''}`}
              onClick={() => aoSelecionarDia(dia)}
            >
              <span className={styles.diaSemana}>
                {dia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
              </span>
              <span className={styles.diaNumero}>{dia.getDate()}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.horarios} aria-live="polite">
        {carregandoHorarios && <p className={styles.mensagem}>Carregando horários…</p>}

        {!carregandoHorarios && horarios.length === 0 && (
          <p className={styles.mensagem}>
            Sem horários disponíveis nesse dia. Escolha outra data acima.
          </p>
        )}

        {!carregandoHorarios &&
          Object.entries(grupos)
            .filter(([, lista]) => lista.length > 0)
            .map(([periodo, lista]) => (
              <div key={periodo} className={styles.grupoPeriodo}>
                <h3 className={styles.tituloPeriodo}>{NOME_PERIODO[periodo]}</h3>
                <div
                  className={styles.grade}
                  role="radiogroup"
                  aria-label={`Horários de ${NOME_PERIODO[periodo].toLowerCase()}`}
                >
                  {lista.map((horario) => {
                    const ativo = horarioSelecionado?.getTime() === horario.getTime()
                    return (
                      <button
                        key={horario.toISOString()}
                        type="button"
                        role="radio"
                        aria-checked={ativo}
                        className={`${styles.horaPill} ${ativo ? styles.horaPillAtiva : ''}`}
                        onClick={() => aoSelecionarHorario(horario)}
                      >
                        {formatarHora(horario)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
