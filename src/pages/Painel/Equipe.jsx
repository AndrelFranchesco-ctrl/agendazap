import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { listarTodosProfissionais, aprovarProfissional, desativarProfissional } from '../../services/profissionais'
import { listarTodosServicos } from '../../services/servicos'
import { gerarNovoCodigoEquipe } from '../../services/negocios'
import styles from './Equipe.module.css'

export default function Equipe() {
  const { negocio, recarregarNegocio } = useOutletContext()
  const [profissionais, setProfissionais] = useState([])
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [gerandoCodigo, setGerandoCodigo] = useState(false)

  async function recarregar() {
    setCarregando(true)
    const [listaProfissionais, listaServicos] = await Promise.all([
      listarTodosProfissionais(negocio.id),
      listarTodosServicos(negocio.id),
    ])
    setProfissionais(listaProfissionais)
    setServicos(listaServicos)
    setCarregando(false)
  }

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.id])

  function nomesDosServicos(servicosIds) {
    return servicosIds.map((id) => servicos.find((s) => s.id === id)?.nome ?? '?').join(', ')
  }

  async function copiarCodigo() {
    await navigator.clipboard.writeText(negocio.codigoEquipe)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function gerarCodigo() {
    setGerandoCodigo(true)
    try {
      await gerarNovoCodigoEquipe(negocio.id)
      await recarregarNegocio()
    } finally {
      setGerandoCodigo(false)
    }
  }

  async function aprovar(profissional) {
    await aprovarProfissional(negocio.id, profissional.id)
    recarregar()
  }

  async function desativar(profissional) {
    await desativarProfissional(negocio.id, profissional.id)
    recarregar()
  }

  const pendentes = profissionais.filter((p) => !p.ativo)
  const ativos = profissionais.filter((p) => p.ativo)

  return (
    <div>
      <div className={styles.codigoCard}>
        {negocio.codigoEquipe ? (
          <>
            <p className={styles.codigoLabel}>Código de equipe</p>
            <p className={styles.codigoValor}>{negocio.codigoEquipe}</p>
            <p className={styles.codigoAjuda}>Compartilhe com quem trabalha com você — é assim que a pessoa entra.</p>
            <button type="button" className={styles.botaoCopiar} onClick={copiarCodigo}>
              {copiado ? 'Copiado!' : 'Copiar código'}
            </button>
          </>
        ) : (
          <>
            <p className={styles.codigoAjuda}>
              Seu negócio ainda não tem um código de equipe — gere um pra convidar profissionais.
            </p>
            <button type="button" className={styles.botaoCopiar} onClick={gerarCodigo} disabled={gerandoCodigo}>
              {gerandoCodigo ? 'Gerando…' : 'Gerar código de equipe'}
            </button>
          </>
        )}
      </div>

      {carregando && <p className={styles.mensagem}>Carregando…</p>}

      {!carregando && pendentes.length > 0 && (
        <>
          <h2 className={styles.titulo}>Aguardando aprovação</h2>
          <ul className={styles.lista}>
            {pendentes.map((p) => (
              <li key={p.id} className={styles.item}>
                <div>
                  <p className={styles.nome}>{p.nome}</p>
                  <p className={styles.detalhe}>{nomesDosServicos(p.servicosIds)}</p>
                </div>
                <button type="button" className={styles.botaoAprovar} onClick={() => aprovar(p)}>
                  Aprovar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {!carregando && (
        <>
          <h2 className={styles.titulo}>Equipe ativa</h2>
          {ativos.length === 0 && <p className={styles.mensagem}>Ninguém ativo ainda.</p>}
          <ul className={styles.lista}>
            {ativos.map((p) => (
              <li key={p.id} className={styles.item}>
                <div>
                  <p className={styles.nome}>{p.nome}</p>
                  <p className={styles.detalhe}>{nomesDosServicos(p.servicosIds)}</p>
                </div>
                <button type="button" className={styles.linkAcaoPerigo} onClick={() => desativar(p)}>
                  Desativar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
