import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartaoFormulario from '../../components/CartaoFormulario'
import CampoTexto from '../../components/CampoTexto'
import Botao from '../../components/Botao'
import { cadastrar } from '../../services/auth'
import { mensagemErroAuth } from '../../lib/erroFirebase'

export default function Cadastro() {
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
      await cadastrar(email, senha)
      navigate('/novo-negocio')
    } catch (e) {
      setErro(mensagemErroAuth(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <CartaoFormulario titulo="Criar conta" subtitulo="Cadastre seu negócio no AgendaZap">
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
          autoComplete="new-password"
          minLength={6}
          ajuda="Pelo menos 6 caracteres."
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
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Botao>
      </form>
      <p style={{ textAlign: 'center', marginTop: 'var(--espaco-4)', fontSize: 14 }}>
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </CartaoFormulario>
  )
}
