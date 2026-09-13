import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

/**
 * Envolve só as rotas de dono/painel com o AuthProvider (que carrega o
 * Firebase Auth). A página pública de agendamento (a mais visitada, geralmente
 * por clientes no celular) não precisa de Auth — mantê-la fora desse provider
 * evita baixar esse código à toa. Este arquivo só é importado via lazy() em
 * App.jsx, então o corte de bundle depende de nunca importá-lo fora disso.
 */
export default function AreaAutenticada() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
