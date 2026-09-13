import styles from './SeletorProfissional.module.css'

export default function SeletorProfissional({ profissionais, selecionado, aoSelecionar }) {
  return (
    <div role="radiogroup" aria-label="Escolha o profissional" className={styles.lista}>
      {profissionais.map((profissional) => {
        const ativo = selecionado?.id === profissional.id
        return (
          <button
            key={profissional.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            className={`${styles.card} ${ativo ? styles.cardAtivo : ''}`}
            onClick={() => aoSelecionar(profissional)}
          >
            <span className={styles.avatar} aria-hidden="true">
              {profissional.nome.charAt(0).toUpperCase()}
            </span>
            <span className={styles.info}>
              <span className={styles.nome}>{profissional.nome}</span>
              {profissional.bio && <span className={styles.bio}>{profissional.bio}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
