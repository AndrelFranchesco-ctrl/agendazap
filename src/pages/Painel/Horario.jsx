import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { atualizarNegocio } from '../../services/negocios'
import { DIAS_SEMANA } from '../../lib/horarios'
import Botao from '../../components/Botao'
import styles from './Horario.module.css'

const NOME_DIA = { dom: 'Domingo', seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado' }
const PADRAO_ABERTO = { abre: '09:00', fecha: '18:00' }

export default function Horario() {
  const { negocio, recarregarNegocio } = useOutletContext()
  const [horario, setHorario] = useState(negocio.horarioFuncionamento)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  function alternarDia(dia) {
    setSalvo(false)
    setHorario((h) => ({ ...h, [dia]: h[dia] ? null : PADRAO_ABERTO }))
  }

  function mudarHorario(dia, campo, valor) {
    setSalvo(false)
    setHorario((h) => ({ ...h, [dia]: { ...h[dia], [campo]: valor } }))
  }

  async function salvar() {
    setSalvando(true)
    try {
      await atualizarNegocio(negocio.id, { horarioFuncionamento: horario })
      await recarregarNegocio()
      setSalvo(true)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <ul className={styles.lista}>
        {DIAS_SEMANA.map((dia) => {
          const aberto = Boolean(horario[dia])
          return (
            <li key={dia} className={styles.linha}>
              <label className={styles.diaLabel}>
                <input type="checkbox" checked={aberto} onChange={() => alternarDia(dia)} />
                {NOME_DIA[dia]}
              </label>

              {aberto ? (
                <div className={styles.horarios}>
                  <input
                    type="time"
                    className={styles.inputHora}
                    value={horario[dia].abre}
                    onChange={(e) => mudarHorario(dia, 'abre', e.target.value)}
                    aria-label={`Abre ${NOME_DIA[dia]}`}
                  />
                  <span>às</span>
                  <input
                    type="time"
                    className={styles.inputHora}
                    value={horario[dia].fecha}
                    onChange={(e) => mudarHorario(dia, 'fecha', e.target.value)}
                    aria-label={`Fecha ${NOME_DIA[dia]}`}
                  />
                </div>
              ) : (
                <span className={styles.fechado}>Fechado</span>
              )}
            </li>
          )
        })}
      </ul>

      <Botao onClick={salvar} disabled={salvando} className={styles.botaoSalvar}>
        {salvando ? 'Salvando…' : salvo ? 'Horário salvo' : 'Salvar horário'}
      </Botao>
    </div>
  )
}
