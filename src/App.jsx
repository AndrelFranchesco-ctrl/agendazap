import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Agendamento from './pages/Agendamento/Agendamento'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* /demo usa dados fictícios locais — sem Firebase configurado ainda,
            e útil pra mostrar o produto funcionando pra um prospect. */}
        <Route path="/:slug" element={<Agendamento />} />
        <Route path="/" element={<Agendamento />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
