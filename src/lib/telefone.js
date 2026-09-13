/** Aplica a máscara brasileira (DD) 9XXXX-XXXX enquanto o usuário digita. */
export function mascararTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  const ddd = digitos.slice(0, 2)
  const parte1 = digitos.slice(2, 7)
  const parte2 = digitos.slice(7, 11)

  if (digitos.length <= 2) return ddd.length ? `(${ddd}` : ''
  if (digitos.length <= 7) return `(${ddd}) ${parte1}`
  return `(${ddd}) ${parte1}-${parte2}`
}

/** true se o telefone tem DDD (2) + 8 ou 9 dígitos — cobre fixo e celular. */
export function telefoneValido(valor) {
  const digitos = valor.replace(/\D/g, '')
  return digitos.length === 10 || digitos.length === 11
}

/** Converte pro formato E.164 que a WhatsApp Cloud API espera (com DDI 55). */
export function paraE164(valor) {
  const digitos = valor.replace(/\D/g, '')
  return `55${digitos}`
}
