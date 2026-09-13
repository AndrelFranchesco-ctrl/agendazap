// Funções puras de cálculo de horário — sem I/O, sem Firebase.
// Mantidas separadas da camada de dados (src/services) de propósito: são a parte
// mais fácil de testar e mais fácil de quebrar por engano (ver ADR-0001).

export const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

// Granularidade dos blocos de trava de concorrência (ver ADR-0002) — precisa ser
// a MESMA usada para oferecer horários em calcularHorariosLivres, senão dois
// agendamentos podem ficar desalinhados na grade e o bloco de colisão não bater.
export const INTERVALO_MIN = 15

/** ID determinístico do documento-trava de um bloco de horário (ver ADR-0002). */
export function chaveDoBloco(data) {
  const d = new Date(data)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Lista os horários de início de cada bloco de INTERVALO_MIN que um agendamento de `duracaoMin` a partir de `inicio` ocupa. */
export function blocosOcupados(inicio, duracaoMin, intervaloMin = INTERVALO_MIN) {
  const quantidade = Math.ceil(duracaoMin / intervaloMin)
  return Array.from({ length: quantidade }, (_, i) => new Date(inicio.getTime() + i * intervaloMin * 60000))
}

/** 'HH:MM' -> minutos desde 00:00 */
function paraMinutos(horaStr) {
  const [h, m] = horaStr.split(':').map(Number)
  return h * 60 + m
}

/** Combina uma data (só o dia importa) com minutos desde 00:00, no fuso local. */
function dataComMinutos(dataBase, minutos) {
  const d = new Date(dataBase)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(minutos)
  return d
}

/**
 * Calcula os horários de início disponíveis para um serviço, num dia específico.
 *
 * @param {Date} dataBase - qualquer horário dentro do dia desejado (só a data é usada)
 * @param {{abre: string, fecha: string} | null} horarioDoDia - ex. {abre:'09:00', fecha:'19:00'}; null = fechado
 * @param {{inicio: Date, fim: Date}[]} bloqueios - folgas/feriados que já colidem com esse dia
 * @param {{inicio: Date, fim: Date}[]} ocupados - agendamentos confirmados que já colidem com esse dia
 * @param {number} duracaoMin - duração do serviço sendo agendado
 * @param {number} intervaloMin - granularidade dos horários oferecidos (padrão 15min)
 * @param {Date} agora - momento atual (injetável para permitir testes determinísticos)
 * @returns {Date[]} lista de horários de início disponíveis, em ordem
 */
export function calcularHorariosLivres({
  dataBase,
  horarioDoDia,
  bloqueios = [],
  ocupados = [],
  duracaoMin,
  intervaloMin = INTERVALO_MIN,
  agora = new Date(),
}) {
  if (!horarioDoDia) return []

  const abreMin = paraMinutos(horarioDoDia.abre)
  const fechaMin = paraMinutos(horarioDoDia.fecha)
  const bloqueiosOcupacao = [...bloqueios, ...ocupados]

  const livres = []
  for (let inicioMin = abreMin; inicioMin + duracaoMin <= fechaMin; inicioMin += intervaloMin) {
    const inicio = dataComMinutos(dataBase, inicioMin)
    const fim = dataComMinutos(dataBase, inicioMin + duracaoMin)

    if (inicio < agora) continue

    const colide = bloqueiosOcupacao.some((b) => inicio < b.fim && fim > b.inicio)
    if (colide) continue

    livres.push(inicio)
  }
  return livres
}

/** Agrupa horários em períodos do dia, para exibição (Manhã/Tarde/Noite). */
export function agruparPorPeriodo(horarios) {
  const grupos = { manha: [], tarde: [], noite: [] }
  for (const h of horarios) {
    const hora = h.getHours()
    if (hora < 12) grupos.manha.push(h)
    else if (hora < 18) grupos.tarde.push(h)
    else grupos.noite.push(h)
  }
  return grupos
}

export function formatarHora(data) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatarDataCurta(data) {
  return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}
