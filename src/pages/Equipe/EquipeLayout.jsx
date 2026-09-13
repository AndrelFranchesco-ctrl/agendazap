import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/authContextBase'
import { useMeuNegocio } from '../../hooks/useMeuNegocio'
import { useMeuProfissional } from '../../hooks/useMeuProfissional'
import { sair } from '../../services/auth'
import styles from './EquipeLayout.module.css'

export default function EquipeLayout() {
  const { usuario, perfil } = useAuth()
  const { negocio, carregando: carregandoNegocio } = useMeuNegocio(perfil.negocioId)
  const { profissional, carregando: carregandoProfissional, recarregar } = useMeuProfissional(
    perfil.negocioId,
    usuario.uid
  )

  if (carregandoNegocio || carregandoProfissional) {
    return <p className={styles.mensagemCentral}>Carregando…</p>
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.nomeNegocio}>{negocio?.nome}</p>
          <p className={styles.papel}>Você atende aqui como profissional</p>
        </div>
        <button type="button" className={styles.botaoSair} onClick={sair}>
          Sair
        </button>
      </header>

      {profissional && !profissional.ativo && (
        <div className={styles.avisoPendente}>
          Seu perfil está aguardando aprovação do dono do negócio. Você já pode ajustar seu horário e serviços
          enquanto espera.
        </div>
      )}

      <nav className={styles.abas}>
        <NavLink to="/equipe/perfil" className={({ isActive }) => (isActive ? styles.abaAtiva : styles.aba)}>
          Meu perfil
        </NavLink>
        <NavLink to="/equipe/horario" className={({ isActive }) => (isActive ? styles.abaAtiva : styles.aba)}>
          Meu horário
        </NavLink>
      </nav>

      <main className={styles.conteudo}>
        <Outlet context={{ negocio, profissional, recarregarProfissional: recarregar }} />
      </main>
    </div>
  )
}
