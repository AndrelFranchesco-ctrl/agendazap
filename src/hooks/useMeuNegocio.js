import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

function paraNegocio(snap) {
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** Carrega o negócio do dono logado, pro painel administrativo. */
export function useMeuNegocio(negocioId) {
  const [estado, setEstado] = useState({ chave: null, negocio: null })

  useEffect(() => {
    if (!negocioId) return
    let cancelado = false
    getDoc(doc(db, 'negocios', negocioId)).then((snap) => {
      if (!cancelado) setEstado({ chave: negocioId, negocio: paraNegocio(snap) })
    })
    return () => {
      cancelado = true
    }
  }, [negocioId])

  const recarregar = useCallback(async () => {
    const snap = await getDoc(doc(db, 'negocios', negocioId))
    setEstado({ chave: negocioId, negocio: paraNegocio(snap) })
  }, [negocioId])

  return {
    negocio: estado.negocio,
    carregando: estado.chave !== negocioId,
    recarregar,
  }
}
