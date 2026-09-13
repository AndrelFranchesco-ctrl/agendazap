import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CartaoFormulario from '../../components/CartaoFormulario'
import CampoTexto from '../../components/CampoTexto'
import Botao from '../../components/Botao'
import { useAuth } from '../../contexts/authContextBase'
import { criarNegocio, SlugIndisponivelError } from '../../services/negocios'
import { slugify, slugValido } from '../../lib/slug'
import { mascararTelefone, telefoneValido } from '../../lib/telefone'

export default function NovoNegocio() {
  const { usuario, refreshPerfil } = useAuth()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function aoMudarNome(valor) {
    setNome(valor)
    if (!slugEditadoManualmente) setSlug(slugify(valor))
  }

  function aoMudarSlug(valor) {
    setSlugEditadoManualmente(true)
    setSlug(slugify(valor))
  }

  const erroSlug = slug && !slugValido(slug) ? 'Esse link precisa ter pelo menos 3 letras/números, só minúsculas e hífen.' : null
  const erroWhatsapp = whatsapp && !telefoneValido(whatsapp) ? 'Digite um WhatsApp válido com DDD.' : null
  const formValido = nome.trim().length >= 2 && slugValido(slug) && telefoneValido(whatsapp)

  async function aoEnviar(e) {
    e.preventDefault()
    if (!formValido) return
    setEnviando(true)
    setErro(null)
    try {
      await criarNegocio({ uid: usuario.uid, nome: nome.trim(), slug, whatsappNumero: whatsapp })
      await refreshPerfil()
      navigate('/painel')
    } catch (e) {
      setErro(e instanceof SlugIndisponivelError ? e.message : 'Não foi possível criar o negócio. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <CartaoFormulario titulo="Seu negócio" subtitulo="Isso vai aparecer pros seus clientes">
      <form onSubmit={aoEnviar} noValidate>
        <CampoTexto
          label="Nome do negócio"
          value={nome}
          onChange={(e) => aoMudarNome(e.target.value)}
          required
        />
        <CampoTexto
          label="Link de agendamento"
          value={slug}
          onChange={(e) => aoMudarSlug(e.target.value)}
          erro={erroSlug}
          ajuda={!erroSlug ? `Seus clientes vão agendar em agendazap.app/${slug || 'seu-link'}` : undefined}
          required
        />
        <CampoTexto
          label="WhatsApp do negócio"
          type="tel"
          inputMode="numeric"
          placeholder="(11) 91234-5678"
          value={whatsapp}
          onChange={(e) => setWhatsapp(mascararTelefone(e.target.value))}
          erro={erroWhatsapp}
          required
        />
        {erro && (
          <p role="alert" style={{ color: 'var(--cor-erro)', fontSize: 14, marginBottom: 'var(--espaco-4)' }}>
            {erro}
          </p>
        )}
        <Botao type="submit" disabled={enviando || !formValido}>
          {enviando ? 'Criando…' : 'Criar negócio'}
        </Botao>
      </form>
    </CartaoFormulario>
  )
}
