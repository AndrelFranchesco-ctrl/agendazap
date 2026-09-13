import { useEffect, useState } from 'react'
import { buscarNegocioPorSlug } from '../services/negocios'
import { listarServicosAtivos } from '../services/servicos'
import { negocioDemo, servicosDemo } from '../data/negocioDemo'

const ESTADO_INICIAL = { chave: null, negocio: null, servicos: [], erro: null }

/**
 * Carrega o negócio e seus serviços a partir do slug da URL.
 * `slug === 'demo'` usa dados fictícios locais, sem tocar o Firestore —
 * ver src/data/negocioDemo.js.
 *
 * `carregando` é derivado comparando a `chave` do último resultado recebido
 * com o `slug` atual, em vez de um setState síncrono no início do efeito —
 * evita um render extra desnecessário a cada troca de slug.
 */
export function useDadosNegocio(slug) {
  const ehDemo = slug === 'demo'
  const [estado, setEstado] = useState(() =>
    ehDemo
      ? { chave: slug, negocio: negocioDemo, servicos: servicosDemo, erro: null }
      : ESTADO_INICIAL
  )

  useEffect(() => {
    if (ehDemo) return
    let cancelado = false

    buscarNegocioPorSlug(slug)
      .then(async (encontrado) => {
        if (cancelado) return
        if (!encontrado) {
          setEstado({ chave: slug, negocio: null, servicos: [], erro: 'negocio-nao-encontrado' })
          return
        }
        const servicos = await listarServicosAtivos(encontrado.id)
        if (!cancelado) setEstado({ chave: slug, negocio: encontrado, servicos, erro: null })
      })
      .catch(() => {
        if (!cancelado) setEstado({ chave: slug, negocio: null, servicos: [], erro: 'falha-ao-carregar' })
      })

    return () => {
      cancelado = true
    }
  }, [slug, ehDemo])

  const carregando = !ehDemo && estado.chave !== slug
  return { negocio: estado.negocio, servicos: estado.servicos, carregando, erro: estado.erro, ehDemo }
}
