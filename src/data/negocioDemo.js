// Dados fictícios para a rota /demo — permite testar e demonstrar o fluxo
// completo de agendamento sem precisar de um projeto Firebase configurado.
// Nunca usado em produção real (ver src/hooks/useDadosNegocio.js).

export const negocioDemo = {
  id: 'demo',
  slug: 'demo',
  nome: 'Espaço Bella Vida',
  whatsappNumero: '5511999999999',
  horarioFuncionamento: {
    dom: null,
    seg: { abre: '09:00', fecha: '19:00' },
    ter: { abre: '09:00', fecha: '19:00' },
    qua: { abre: '09:00', fecha: '19:00' },
    qui: { abre: '09:00', fecha: '19:00' },
    sex: { abre: '09:00', fecha: '20:00' },
    sab: { abre: '09:00', fecha: '17:00' },
  },
}

export const servicosDemo = [
  { id: 's1', nome: 'Corte de cabelo', duracaoMin: 45, preco: 60, ativo: true },
  { id: 's2', nome: 'Barba', duracaoMin: 20, preco: 35, ativo: true },
  { id: 's3', nome: 'Corte + barba', duracaoMin: 60, preco: 85, ativo: true },
  { id: 's4', nome: 'Sobrancelha', duracaoMin: 15, preco: 25, ativo: true },
]

// Dois profissionais fictícios com horários diferentes entre si e do negócio
// (ver ADR-0005) — mostra pra quem visita o /demo como a escolha de
// profissional muda a grade de horários disponíveis.
export const profissionaisDemo = [
  {
    id: 'p1',
    nome: 'Carlos',
    bio: 'Especialista em corte e barba clássica.',
    servicosIds: ['s1', 's2', 's3'],
    ativo: true,
    horarioTrabalho: {
      dom: null,
      seg: { abre: '09:00', fecha: '19:00' },
      ter: { abre: '09:00', fecha: '19:00' },
      qua: { abre: '09:00', fecha: '19:00' },
      qui: { abre: '09:00', fecha: '19:00' },
      sex: { abre: '09:00', fecha: '19:00' },
      sab: null,
    },
  },
  {
    id: 'p2',
    nome: 'Bella',
    bio: 'Atende cortes femininos e sobrancelha.',
    servicosIds: ['s1', 's4'],
    ativo: true,
    horarioTrabalho: {
      dom: null,
      seg: null,
      ter: { abre: '12:00', fecha: '20:00' },
      qua: { abre: '12:00', fecha: '20:00' },
      qui: { abre: '12:00', fecha: '20:00' },
      sex: { abre: '09:00', fecha: '20:00' },
      sab: { abre: '09:00', fecha: '17:00' },
    },
  },
]

// Alguns agendamentos fictícios já ocupados, pra provar que a grade de
// horários realmente exclui o que já está marcado.
export function ocupadosDemoDoDia(dataBase) {
  const dia = new Date(dataBase)
  dia.setHours(0, 0, 0, 0)
  const em = (h, m) => new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m)
  return [
    { inicio: em(10, 0), fim: em(10, 45) },
    { inicio: em(14, 30), fim: em(15, 30) },
  ]
}
