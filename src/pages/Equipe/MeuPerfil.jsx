import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { listarTodosServicos } from '../../services/servicos'
import { atualizarMeuProfissional } from '../../services/profissionais'
import CampoTexto from '../../components/CampoTexto'
import Botao from '../../components/Botao'
import styles from './MeuPerfil.module.css'

export default function MeuPerfil() {
  const { negocio, profissional, recarregarProfissional } = useOutletContext()
  const [servicosDoNegocio, setServicosDoNegocio] = useState([])
  const [nome, setNome] = useState(profissional.nome)
  const [bio, setBio] = useState(profissional.bio ?? '')
  const [servicosIds, setServicosIds] = useState(profissional.servicosIds)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    listarTodosServicos(negocio.id).then(setServicosDoNegocio)
  }, [negocio.id])

  function alternarServico(servicoId) {
    setSalvo(false)
    setServicosIds((atual) =>
      atual.includes(servicoId) ? atual.filter((id) => id !== servicoId) : [...atual, servicoId]
    )
  }

  const formValido = nome.trim().length >= 2 && servicosIds.length > 0

  async function salvar(e) {
    e.preventDefault()
    if (!formValido) return
    setSalvando(true)
    try {
      await atualizarMeuProfissional(negocio.id, profissional.id, {
        nome: nome.trim(),
        bio: bio.trim(),
        servicosIds,
      })
      await recarregarProfissional()
      setSalvo(true)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={salvar} noValidate>
      <CampoTexto
        label="Seu nome"
        value={nome}
        onChange={(e) => {
          setNome(e.target.value)
          setSalvo(false)
        }}
        required
      />
      <CampoTexto
        label="Sobre você (opcional)"
        value={bio}
        onChange={(e) => {
          setBio(e.target.value)
          setSalvo(false)
        }}
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
        </div>
      </fieldset>

      <Botao type="submit" disabled={!formValido || salvando}>
        {salvando ? 'Salvando…' : salvo ? 'Perfil salvo' : 'Salvar perfil'}
      </Botao>
    </form>
  )
}
