import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartaoFormulario from '../../components/CartaoFormulario'
import CampoTexto from '../../components/CampoTexto'
import Botao from '../../components/Botao'
import { entrar } from '../../services/auth'
import { mensagemErroAuth } from '../../lib/erroFirebase'

export default function Entrar() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  async function aoEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      await entrar(email, senha)
      navigate('/painel')
    } catch (e) {
      setErro(mensagemErroAuth(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <CartaoFormulario titulo="Entrar" subtitulo="Acesse o painel do seu negócio">
      <form onSubmit={aoEnviar} noValidate>
        <CampoTexto
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <CampoTexto
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        {erro && (
          <p role="alert" style={{ color: 'var(--cor-erro)', fontSize: 14, marginBottom: 'var(--espaco-4)' }}>
            {erro}
          </p>
        )}
        <Botao type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </Botao>
      </form>
      <p style={{ textAlign: 'center', marginTop: 'var(--espaco-4)', fontSize: 14 }}>
        Ainda não tem conta? <Link to="/cadastro">Cadastre seu negócio</Link>
      </p>
    </CartaoFormulario>
  )
}
