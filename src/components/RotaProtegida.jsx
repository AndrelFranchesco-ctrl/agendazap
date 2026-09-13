import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContextBase'

/** Exige login. Se `exigirNegocio`, também exige que o dono já tenha criado um negócio. */
export default function RotaProtegida({ children, exigirNegocio = false }) {
  const { usuario, perfil } = useAuth()

  if (usuario === undefined || (usuario && perfil === undefined)) {
    return <p style={{ textAlign: 'center', padding: 32, color: 'var(--cor-texto-suave)' }}>Carregando…</p>
  }

  if (!usuario) return <Navigate to="/entrar" replace />

  if (exigirNegocio && !perfil?.negocioId) return <Navigate to="/novo-negocio" replace />

  return children
}
