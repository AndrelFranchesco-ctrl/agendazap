import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/authContextBase'
import { useMeuNegocio } from '../../hooks/useMeuNegocio'
import { sair } from '../../services/auth'
import styles from './PainelLayout.module.css'

export default function PainelLayout() {
  const { perfil } = useAuth()
  const { negocio, carregando, recarregar } = useMeuNegocio(perfil.negocioId)

  if (carregando) {
    return <p className={styles.mensagemCentral}>Carregando…</p>
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.nomeNegocio}>{negocio?.nome}</p>
          <a
            className={styles.linkPublico}
            href={`/${negocio?.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            agendazap.app/{negocio?.slug} ↗
          </a>
        </div>
        <button type="button" className={styles.botaoSair} onClick={sair}>
          Sair
        </button>
      </header>

      <nav className={styles.abas}>
        <NavLink to="/painel/servicos" className={({ isActive }) => (isActive ? styles.abaAtiva : styles.aba)}>
          Serviços
        </NavLink>
        <NavLink to="/painel/horario" className={({ isActive }) => (isActive ? styles.abaAtiva : styles.aba)}>
          Horário
        </NavLink>
      </nav>

      <main className={styles.conteudo}>
        <Outlet context={{ negocio, recarregarNegocio: recarregar }} />
      </main>
    </div>
  )
}
