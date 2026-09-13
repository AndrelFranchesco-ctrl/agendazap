// Sem 0/O, 1/I/L — caracteres fáceis de confundir quando alguém dita o código
// em voz alta ou o lê numa tela pequena.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Gera um código de equipe de 6 caracteres (ver ADR-0006). */
export function gerarCodigoEquipe() {
  let codigo = ''
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)]
  }
  return codigo
}

/** Normaliza o que o usuário digitou (maiúsculas, sem espaços) antes de consultar. */
export function normalizarCodigo(valor) {
  return valor.trim().toUpperCase().replace(/\s+/g, '')
}
