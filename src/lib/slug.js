// Rotas fixas do app — um negócio nunca pode reservar um desses slugs,
// senão a página dele fica inacessível pra sempre (a rota estática sempre
// vence a rota dinâmica /:slug no React Router).
export const SLUGS_RESERVADOS = [
  'demo',
  'entrar',
  'cadastro',
  'novo-negocio',
  'painel',
  'comecar',
  'entrar-equipe',
  'equipe',
]

/** Converte um texto livre (ex: nome do negócio) num slug de URL. */
export function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove marcas de acento (combining diacritics) após NFD
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function slugValido(slug) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && !SLUGS_RESERVADOS.includes(slug)
}
