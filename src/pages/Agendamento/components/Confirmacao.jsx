import { formatarDataCurta, formatarHora } from '../../../lib/horarios'
import styles from './Confirmacao.module.css'

export default function Confirmacao({ negocio, servico, horario, nomeCliente }) {
  return (
    <div className={styles.container}>
      <div className={styles.icone} aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className={styles.titulo}>Agendamento confirmado!</h2>
      <p className={styles.subtitulo}>
        {nomeCliente}, seu horário em <strong>{negocio.nome}</strong> está marcado.
      </p>

      <dl className={styles.resumo}>
        <div className={styles.linha}>
          <dt>Serviço</dt>
          <dd>{servico.nome}</dd>
        </div>
        <div className={styles.linha}>
          <dt>Data</dt>
          <dd>{formatarDataCurta(horario)}</dd>
        </div>
        <div className={styles.linha}>
          <dt>Horário</dt>
          <dd>{formatarHora(horario)}</dd>
        </div>
      </dl>

      <p className={styles.aviso}>
        Você vai receber a confirmação e um lembrete no WhatsApp antes do horário.
      </p>
    </div>
  )
}
