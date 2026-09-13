import { useId } from 'react'
import styles from './CampoTexto.module.css'

/** Campo de formulário com label visível e erro associado via aria-describedby. */
export default function CampoTexto({ label, erro, ajuda, ...inputProps }) {
  const id = useId()
  const idErro = useId()
  const idAjuda = useId()

  const describedBy = [erro && idErro, ajuda && idAjuda].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={!!erro}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {ajuda && (
        <p id={idAjuda} className={styles.ajuda}>
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={idErro} className={styles.erro} role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}
