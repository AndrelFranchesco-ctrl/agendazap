const MENSAGENS = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
}

/** Traduz um erro do Firebase Auth pra uma mensagem amigável em português. */
export function mensagemErroAuth(erro) {
  return MENSAGENS[erro?.code] ?? 'Não foi possível concluir. Tente novamente.'
}
