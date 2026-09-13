import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RotaProtegida from './components/RotaProtegida'
import Agendamento from './pages/Agendamento/Agendamento'

// Tudo abaixo (inclusive o AuthProvider/Firebase Auth, ver AreaAutenticada)
// só carrega sob demanda — a página pública de agendamento acima, a mais
// visitada e geralmente por clientes no celular, fica fora desse peso.
const AreaAutenticada = lazy(() => import('./routes/AreaAutenticada'))
const Entrar = lazy(() => import('./pages/Auth/Entrar'))
const Cadastro = lazy(() => import('./pages/Auth/Cadastro'))
const NovoNegocio = lazy(() => import('./pages/NovoNegocio/NovoNegocio'))
const PainelLayout = lazy(() => import('./pages/Painel/PainelLayout'))
const Agenda = lazy(() => import('./pages/Painel/Agenda'))
const Servicos = lazy(() => import('./pages/Painel/Servicos'))
const Horario = lazy(() => import('./pages/Painel/Horario'))

function Carregando() {
  return <p style={{ textAlign: 'center', padding: 32, color: 'var(--cor-texto-suave)' }}>Carregando…</p>
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Carregando />}>
        <Routes>
          <Route element={<AreaAutenticada />}>
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
          </Route>

          {/* /demo usa dados fictícios locais — sem Firebase configurado ainda,
              e útil pra mostrar o produto funcionando pra um prospect. */}
          <Route path="/:slug" element={<Agendamento />} />
          <Route path="/" element={<Agendamento />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
