import { useEffect, useState } from 'react'
import { buscarNegocioPorSlug } from '../services/negocios'
import { listarServicosAtivos } from '../services/servicos'
import { listarProfissionaisAtivos } from '../services/profissionais'
import { negocioDemo, servicosDemo, profissionaisDemo } from '../data/negocioDemo'

const ESTADO_INICIAL = { chave: null, negocio: null, servicos: [], profissionais: [], erro: null }

/**
 * Carrega o negócio, seus serviços e seus profissionais ativos a partir do
 * slug da URL. `slug === 'demo'` usa dados fictícios locais, sem tocar o
 * Firestore — ver src/data/negocioDemo.js.
 *
 * `carregando` é derivado comparando a `chave` do último resultado recebido
 * com o `slug` atual, em vez de um setState síncrono no início do efeito —
 * evita um render extra desnecessário a cada troca de slug.
 */
export function useDadosNegocio(slug) {
  const ehDemo = slug === 'demo'
  const [estado, setEstado] = useState(() =>
    ehDemo
      ? { chave: slug, negocio: negocioDemo, servicos: servicosDemo, profissionais: profissionaisDemo, erro: null }
      : ESTADO_INICIAL
  )

  useEffect(() => {
    if (ehDemo) return
    let cancelado = false

    buscarNegocioPorSlug(slug)
      .then(async (encontrado) => {
        if (cancelado) return
        if (!encontrado) {
          setEstado({ chave: slug, negocio: null, servicos: [], profissionais: [], erro: 'negocio-nao-encontrado' })
          return
        }
        const [servicos, profissionais] = await Promise.all([
          listarServicosAtivos(encontrado.id),
          listarProfissionaisAtivos(encontrado.id),
        ])
        if (!cancelado) setEstado({ chave: slug, negocio: encontrado, servicos, profissionais, erro: null })
      })
      .catch(() => {
        if (!cancelado) setEstado({ chave: slug, negocio: null, servicos: [], profissionais: [], erro: 'falha-ao-carregar' })
      })

    return () => {
      cancelado = true
    }
  }, [slug, ehDemo])

  const carregando = !ehDemo && estado.chave !== slug
  return {
    negocio: estado.negocio,
    servicos: estado.servicos,
    profissionais: estado.profissionais,
    carregando,
    erro: estado.erro,
    ehDemo,
  }
}
