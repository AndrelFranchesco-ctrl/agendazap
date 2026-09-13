import { useId, useState } from 'react'
import { mascararTelefone, telefoneValido } from '../../../lib/telefone'
import styles from './FormularioCliente.module.css'

export default function FormularioCliente({ enviando, erroEnvio, aoConfirmar }) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [toquei, setToquei] = useState({ nome: false, telefone: false })
  const idNome = useId()
  const idTelefone = useId()
  const idErroNome = useId()
  const idErroTelefone = useId()

  const erroNome = nome.trim().length < 2 ? 'Digite seu nome completo.' : null
  const erroTelefone = !telefoneValido(telefone) ? 'Digite um telefone válido com DDD.' : null
  const formValido = !erroNome && !erroTelefone

  function aoEnviar(e) {
    e.preventDefault()
    setToquei({ nome: true, telefone: true })
    if (!formValido) return
    aoConfirmar({ nome: nome.trim(), telefone })
  }

  return (
    <form onSubmit={aoEnviar} noValidate>
      <div className={styles.campo}>
        <label htmlFor={idNome} className={styles.label}>
          Seu nome
        </label>
        <input
          id={idNome}
          type="text"
          autoComplete="name"
          className={styles.input}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={() => setToquei((t) => ({ ...t, nome: true }))}
          aria-invalid={toquei.nome && !!erroNome}
          aria-describedby={toquei.nome && erroNome ? idErroNome : undefined}
        />
        {toquei.nome && erroNome && (
          <p id={idErroNome} className={styles.erro} role="alert">
            {erroNome}
          </p>
        )}
      </div>

      <div className={styles.campo}>
        <label htmlFor={idTelefone} className={styles.label}>
          WhatsApp (com DDD)
        </label>
        <input
          id={idTelefone}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(11) 91234-5678"
          className={styles.input}
          value={telefone}
          onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
          onBlur={() => setToquei((t) => ({ ...t, telefone: true }))}
          aria-invalid={toquei.telefone && !!erroTelefone}
          aria-describedby={toquei.telefone && erroTelefone ? idErroTelefone : undefined}
        />
        {toquei.telefone && erroTelefone && (
          <p id={idErroTelefone} className={styles.erro} role="alert">
            {erroTelefone}
          </p>
        )}
        <p className={styles.ajuda}>
          Você vai receber a confirmação e um lembrete pelo WhatsApp nesse número.
        </p>
      </div>

      {erroEnvio && (
        <p className={styles.erroEnvio} role="alert">
          {erroEnvio}
        </p>
      )}

      <button type="submit" className={styles.botao} disabled={enviando}>
        {enviando ? 'Confirmando…' : 'Confirmar agendamento'}
      </button>
    </form>
  )
}
