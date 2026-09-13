import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RotaProtegida from './components/RotaProtegida'
import Entrar from './pages/Auth/Entrar'
import Cadastro from './pages/Auth/Cadastro'
import NovoNegocio from './pages/NovoNegocio/NovoNegocio'
import PainelLayout from './pages/Painel/PainelLayout'
import Agenda from './pages/Painel/Agenda'
import Servicos from './pages/Painel/Servicos'
import Horario from './pages/Painel/Horario'
import Agendamento from './pages/Agendamento/Agendamento'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/cadastro" element={<Cadastro />} />

          <Route
            path="/novo-negocio"
            element={
              <RotaProtegida>
                <NovoNegocio />
              </RotaProtegida>
            }
          />

          <Route
            path="/painel"
            element={
              <RotaProtegida exigirNegocio>
                <PainelLayout />
              </RotaProtegida>
            }
          >
            <Route index element={<Agenda />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="horario" element={<Horario />} />
          </Route>

          {/* /demo usa dados fictícios locais — sem Firebase configurado ainda,
              e útil pra mostrar o produto funcionando pra um prospect. */}
          <Route path="/:slug" element={<Agendamento />} />
          <Route path="/" element={<Agendamento />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
