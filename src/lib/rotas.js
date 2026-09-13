/** Pra onde mandar alguém autenticado, de acordo com o papel do perfil dele. */
export function caminhoInicial(perfil) {
  if (perfil?.tipo === 'profissional') return '/equipe'
  if (perfil?.tipo === 'dono' && perfil.negocioId) return '/painel'
  return '/comecar'
}
