import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { atualizarMeuProfissional } from '../../services/profissionais'
import SeletorHorarioSemanal from '../../components/SeletorHorarioSemanal'
import Botao from '../../components/Botao'
import styles from './MeuHorario.module.css'

export default function MeuHorario() {
  const { negocio, profissional, recarregarProfissional } = useOutletContext()
  const [horario, setHorario] = useState(profissional.horarioTrabalho)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  function aoMudar(novoHorario) {
    setSalvo(false)
    setHorario(novoHorario)
  }

  async function salvar() {
    setSalvando(true)
    try {
      await atualizarMeuProfissional(negocio.id, profissional.id, { horarioTrabalho: horario })
      await recarregarProfissional()
      setSalvo(true)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <p className={styles.ajuda}>
        Esses são os dias e horários em que você atende — diferente do horário geral do negócio, se precisar.
      </p>
      <SeletorHorarioSemanal value={horario} onChange={aoMudar} />

      <Botao onClick={salvar} disabled={salvando} className={styles.botaoSalvar}>
        {salvando ? 'Salvando…' : salvo ? 'Horário salvo' : 'Salvar horário'}
      </Botao>
    </div>
  )
}
