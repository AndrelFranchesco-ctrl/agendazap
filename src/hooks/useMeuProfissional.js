import { useCallback, useEffect, useState } from 'react'
import { buscarMeuProfissional } from '../services/profissionais'

function chave(negocioId, uid) {
  return `${negocioId}_${uid}`
}

/** Carrega o perfil de profissional do uid logado, dentro do negócio dele. */
export function useMeuProfissional(negocioId, uid) {
  const [estado, setEstado] = useState({ chave: null, profissional: null })

  useEffect(() => {
    if (!negocioId || !uid) return
    let cancelado = false
    buscarMeuProfissional(negocioId, uid).then((p) => {
      if (!cancelado) setEstado({ chave: chave(negocioId, uid), profissional: p })
    })
    return () => {
      cancelado = true
    }
  }, [negocioId, uid])

  const recarregar = useCallback(async () => {
    const p = await buscarMeuProfissional(negocioId, uid)
    setEstado({ chave: chave(negocioId, uid), profissional: p })
  }, [negocioId, uid])

  return {
    profissional: estado.profissional,
    carregando: estado.chave !== chave(negocioId, uid),
    recarregar,
  }
}
