import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContextBase'
import { caminhoInicial } from '../lib/rotas'

/**
 * Exige login. `papel` restringe a rota a 'dono' ou 'profissional' — quem
 * está logado com o papel errado é mandado pra própria área (painel ou
 * equipe) em vez de tentar renderizar uma tela que o Firestore vai negar
 * de qualquer forma (defesa em profundidade, ver firestore.rules).
 */
export default function RotaProtegida({ children, papel }) {
  const { usuario, perfil } = useAuth()

  if (usuario === undefined || (usuario && perfil === undefined)) {
    return <p style={{ textAlign: 'center', padding: 32, color: 'var(--cor-texto-suave)' }}>Carregando…</p>
  }

  if (!usuario) return <Navigate to="/entrar" replace />

  if (papel && perfil?.tipo !== papel) return <Navigate to={caminhoInicial(perfil)} replace />

  return children
}
