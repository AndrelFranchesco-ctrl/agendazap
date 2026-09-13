import { useEffect, useState } from 'react'
import { calcularHorariosLivres, DIAS_SEMANA } from '../lib/horarios'
import { buscarOcupadosDoDia, buscarBloqueiosDoDia } from '../services/agendamentos'
import { ocupadosDemoDoDia } from '../data/negocioDemo'

function chaveDaConsulta(servico, profissional, dia) {
  return servico && dia ? `${servico.id}_${profissional?.id ?? 'negocio'}_${dia.toDateString()}` : null
}

/**
 * Recalcula os horários livres do dia sempre que o dia, o serviço ou o
 * profissional mudam. Quando `profissional` é informado, usa o horário de
 * trabalho DELE (não o do negócio) e a trava de concorrência fica no espaço
 * dele — ver ADR-0005. Sem profissional, mantém o modo anterior (negócio
 * inteiro como recurso, pra negócios sem ninguém cadastrado como Profissional).
 *
 * `carregando` é derivado comparando a chave do último resultado com a
 * consulta atual, em vez de um setState síncrono no início do efeito.
 */
export function useHorariosDoDia({ negocio, servico, profissional, dia, ehDemo }) {
  const chaveAtual = chaveDaConsulta(servico, profissional, dia)
  const [estado, setEstado] = useState({ chave: null, horarios: [] })

  useEffect(() => {
    if (!negocio || !servico || !dia) return
    let cancelado = false
    const chave = chaveDaConsulta(servico, profissional, dia)

    const diaSemana = DIAS_SEMANA[dia.getDay()]
    const horarioDoDia = (profissional ? profissional.horarioTrabalho : negocio.horarioFuncionamento)?.[diaSemana] ?? null

    const carregarOcupacao = ehDemo
      ? Promise.resolve({ ocupados: ocupadosDemoDoDia(dia), bloqueios: [] })
      : Promise.all([
          buscarOcupadosDoDia(negocio.id, dia, profissional?.id),
          buscarBloqueiosDoDia(negocio.id, dia),
        ]).then(([ocupados, bloqueios]) => ({ ocupados, bloqueios }))

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
  }, [negocio, servico, profissional, dia, ehDemo])

  return { horarios: estado.horarios, carregando: estado.chave !== chaveAtual }
}
