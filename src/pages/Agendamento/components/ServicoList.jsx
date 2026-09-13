import styles from './ServicoList.module.css'

function formatarPreco(preco) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ServicoList({ servicos, selecionado, aoSelecionar }) {
  return (
    <div role="radiogroup" aria-label="Escolha o serviço" className={styles.lista}>
      {servicos.map((servico) => {
        const ativo = selecionado?.id === servico.id
        return (
          <button
            key={servico.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            className={`${styles.card} ${ativo ? styles.cardAtivo : ''}`}
            onClick={() => aoSelecionar(servico)}
          >
            <span className={styles.info}>
              <span className={styles.nome}>{servico.nome}</span>
              <span className={styles.duracao}>{servico.duracaoMin} min</span>
            </span>
            <span className={styles.preco}>{formatarPreco(servico.preco)}</span>
          </button>
        )
      })}
    </div>
  )
}
