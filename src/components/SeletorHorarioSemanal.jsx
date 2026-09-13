import { DIAS_SEMANA } from '../lib/horarios'
import styles from './SeletorHorarioSemanal.module.css'

const NOME_DIA = { dom: 'Domingo', seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado' }
const PADRAO_ABERTO = { abre: '09:00', fecha: '18:00' }

/** Editor de horário semanal (dia aberto/fechado + abre/fecha) — controlado, sem estado próprio. */
export default function SeletorHorarioSemanal({ value, onChange }) {
  function alternarDia(dia) {
    onChange({ ...value, [dia]: value[dia] ? null : PADRAO_ABERTO })
  }

  function mudarHorario(dia, campo, valor) {
    onChange({ ...value, [dia]: { ...value[dia], [campo]: valor } })
  }

  return (
    <ul className={styles.lista}>
      {DIAS_SEMANA.map((dia) => {
        const aberto = Boolean(value[dia])
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
                  value={value[dia].abre}
                  onChange={(e) => mudarHorario(dia, 'abre', e.target.value)}
                  aria-label={`Abre ${NOME_DIA[dia]}`}
                />
                <span>às</span>
                <input
                  type="time"
                  className={styles.inputHora}
                  value={value[dia].fecha}
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
  )
}
