import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import CartaoFormulario from '../../components/CartaoFormulario'
import CampoTexto from '../../components/CampoTexto'
import Botao from '../../components/Botao'
import SeletorHorarioSemanal from '../../components/SeletorHorarioSemanal'
import { useAuth } from '../../contexts/authContextBase'
import { buscarNegocioPorCodigoEquipe } from '../../services/negocios'
import { listarTodosServicos } from '../../services/servicos'
import { criarProfissional } from '../../services/profissionais'
import { normalizarCodigo } from '../../lib/codigo'
import { caminhoInicial } from '../../lib/rotas'
import styles from './EntrarEquipe.module.css'

export default function EntrarEquipe() {
  const { usuario, perfil, refreshPerfil } = useAuth()
  const navigate = useNavigate()

  const [etapa, setEtapa] = useState('codigo') // 'codigo' | 'perfil'
  const [codigo, setCodigo] = useState('')
  const [negocio, setNegocio] = useState(null)
  const [servicosDoNegocio, setServicosDoNegocio] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [erroCodigo, setErroCodigo] = useState(null)

  const [nome, setNome] = useState('')
  const [bio, setBio] = useState('')
  const [servicosIds, setServicosIds] = useState([])
  const [horario, setHorario] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erroPerfil, setErroPerfil] = useState(null)

  // Já é dono ou profissional de um negócio — não faz sentido entrar em outro.
  if (perfil?.negocioId) return <Navigate to={caminhoInicial(perfil)} replace />

  async function aoBuscarCodigo(e) {
    e.preventDefault()
    setBuscando(true)
    setErroCodigo(null)
    const codigoNormalizado = normalizarCodigo(codigo)
    try {
      const encontrado = await buscarNegocioPorCodigoEquipe(codigoNormalizado)
      if (!encontrado) {
        setErroCodigo('Código não encontrado. Confira com quem te passou o código.')
        return
      }
      setNegocio(encontrado)
      setHorario(encontrado.horarioFuncionamento)
      setServicosDoNegocio(await listarTodosServicos(encontrado.id))
      setEtapa('perfil')
    } catch {
      setErroCodigo('Não foi possível verificar o código. Tente de novo.')
    } finally {
      setBuscando(false)
    }
  }

  function alternarServico(servicoId) {
    setServicosIds((atual) =>
      atual.includes(servicoId) ? atual.filter((id) => id !== servicoId) : [...atual, servicoId]
    )
  }

  const formValido = nome.trim().length >= 2 && servicosIds.length > 0

  async function aoCriarPerfil(e) {
    e.preventDefault()
    if (!formValido) return
    setEnviando(true)
    setErroPerfil(null)
    try {
      await criarProfissional({
        negocioId: negocio.id,
        uid: usuario.uid,
        nome: nome.trim(),
        bio: bio.trim(),
        servicosIds,
        horarioTrabalho: horario,
        codigoUsado: normalizarCodigo(codigo),
      })
      await refreshPerfil()
      navigate('/equipe')
    } catch {
      setErroPerfil('Não foi possível criar seu perfil. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (etapa === 'codigo') {
    return (
      <CartaoFormulario titulo="Entrar na equipe" subtitulo="Digite o código que o dono do negócio te passou">
        <form onSubmit={aoBuscarCodigo} noValidate>
          <CampoTexto
            label="Código de equipe"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            erro={erroCodigo}
            placeholder="Ex: K7P2MQ"
            autoCapitalize="characters"
            required
          />
          <Botao type="submit" disabled={buscando || codigo.trim().length < 6}>
            {buscando ? 'Verificando…' : 'Continuar'}
          </Botao>
        </form>
      </CartaoFormulario>
    )
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <p className={styles.nomeNegocio}>{negocio.nome}</p>
        <p className={styles.subtitulo}>Crie seu perfil de profissional</p>
      </header>

      <form onSubmit={aoCriarPerfil} noValidate className={styles.conteudo}>
        <CampoTexto label="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <CampoTexto
          label="Sobre você (opcional)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          ajuda="Aparece pros clientes na hora de escolher com quem agendar."
        />

        <fieldset className={styles.campo}>
          <legend className={styles.label}>Quais serviços você realiza?</legend>
          <div className={styles.listaServicos}>
            {servicosDoNegocio.map((servico) => (
              <label key={servico.id} className={styles.itemServico}>
                <input
                  type="checkbox"
                  checked={servicosIds.includes(servico.id)}
                  onChange={() => alternarServico(servico.id)}
                />
                {servico.nome}
              </label>
            ))}
            {servicosDoNegocio.length === 0 && (
              <p className={styles.mensagem}>Esse negócio ainda não cadastrou nenhum serviço.</p>
            )}
          </div>
        </fieldset>

        <div className={styles.campo}>
          <p className={styles.label}>Seus dias e horários de trabalho</p>
          <p className={styles.ajudaHorario}>
            Vem preenchido com o horário do negócio — ajuste pros seus dias de verdade.
          </p>
          <SeletorHorarioSemanal value={horario} onChange={setHorario} />
        </div>

        {erroPerfil && (
          <p role="alert" style={{ color: 'var(--cor-erro)', fontSize: 14, marginBottom: 'var(--espaco-4)' }}>
            {erroPerfil}
          </p>
        )}

        <Botao type="submit" disabled={!formValido || enviando}>
          {enviando ? 'Enviando…' : 'Enviar pra aprovação do dono'}
        </Botao>
      </form>
    </div>
  )
}
