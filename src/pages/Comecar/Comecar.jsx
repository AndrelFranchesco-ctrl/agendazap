import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContextBase'
import { caminhoInicial } from '../../lib/rotas'
import CartaoFormulario from '../../components/CartaoFormulario'
import styles from './Comecar.module.css'

export default function Comecar() {
  const { perfil } = useAuth()
  const navigate = useNavigate()

  // Já tem negócio ou já é profissional de um — não faz sentido escolher de novo.
  if (perfil?.negocioId) return <Navigate to={caminhoInicial(perfil)} replace />

  return (
    <CartaoFormulario titulo="Bem-vindo ao AgendaZap" subtitulo="Como você vai usar a plataforma?">
      <div className={styles.opcoes}>
        <button type="button" className={styles.opcao} onClick={() => navigate('/novo-negocio')}>
          <span className={styles.opcaoTitulo}>Sou dono de um negócio</span>
          <span className={styles.opcaoDescricao}>Vou cadastrar meu salão, barbearia ou clínica do zero.</span>
        </button>
        <button type="button" className={styles.opcao} onClick={() => navigate('/entrar-equipe')}>
          <span className={styles.opcaoTitulo}>Trabalho em um negócio que já usa o AgendaZap</span>
          <span className={styles.opcaoDescricao}>
            Tenho um código de equipe e vou criar meu perfil de profissional.
          </span>
        </button>
      </div>
    </CartaoFormulario>
  )
}
