import { useEffect, useState } from 'react'
import { calcularHorariosLivres, DIAS_SEMANA } from '../lib/horarios'
import { buscarOcupadosDoDia, buscarBloqueiosDoDia } from '../services/agendamentos'
import { ocupadosDemoDoDia } from '../data/negocioDemo'

function chaveDaConsulta(servico, dia) {
  return servico && dia ? `${servico.id}_${dia.toDateString()}` : null
}

/**
 * Recalcula os horários livres do dia sempre que o dia ou o serviço mudam.
 * `carregando` é derivado comparando a chave do último resultado com a
 * consulta atual, em vez de um setState síncrono no início do efeito.
 */
export function useHorariosDoDia({ negocio, servico, dia, ehDemo }) {
  const chaveAtual = chaveDaConsulta(servico, dia)
  const [estado, setEstado] = useState({ chave: null, horarios: [] })

  useEffect(() => {
    if (!negocio || !servico || !dia) return
    let cancelado = false
    const chave = chaveDaConsulta(servico, dia)

    const diaSemana = DIAS_SEMANA[dia.getDay()]
    const horarioDoDia = negocio.horarioFuncionamento?.[diaSemana] ?? null

    const carregarOcupacao = ehDemo
      ? Promise.resolve({ ocupados: ocupadosDemoDoDia(dia), bloqueios: [] })
      : Promise.all([buscarOcupadosDoDia(negocio.id, dia), buscarBloqueiosDoDia(negocio.id, dia)]).then(
          ([ocupados, bloqueios]) => ({ ocupados, bloqueios })
        )

    carregarOcupacao.then(({ ocupados, bloqueios }) => {
      if (cancelado) return
      const horarios = calcularHorariosLivres({
        dataBase: dia,
        horarioDoDia,
        bloqueios,
        ocupados,
        duracaoMin: servico.duracaoMin,
      })
      setEstado({ chave, horarios })
    })

    return () => {
      cancelado = true
    }
  }, [negocio, servico, dia, ehDemo])

  return { horarios: estado.horarios, carregando: estado.chave !== chaveAtual }
}
