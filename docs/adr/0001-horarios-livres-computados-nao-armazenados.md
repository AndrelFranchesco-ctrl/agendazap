# ADR-0001: Horários livres são computados, nunca armazenados

## Status
Aceito — 2026-09-13

## Contexto
A página pública de agendamento precisa mostrar, para um dia escolhido, quais horários estão livres para um determinado Serviço. Havia duas abordagens possíveis:

1. **Armazenar** uma coleção de "vagas" (ex: um documento por slot de 15 min, por dia, por negócio), marcando cada uma como livre/ocupada.
2. **Computar** o horário livre em tempo real, cruzando `horarioFuncionamento` (regra semanal) − `bloqueios` do dia − `agendamentos` já confirmados no dia.

## Decisão
Optamos por **computar**, nunca armazenar vagas como entidade.

## Motivos
- Armazenar vagas exige recriar/atualizar milhares de documentos toda vez que o dono muda o horário de funcionamento, cadastra um novo serviço com duração diferente, ou adiciona um bloqueio — e cada serviço pode ter duração diferente, então "vaga" não é um conceito fixo, é relativo ao serviço escolhido.
- O volume de dados por negócio por dia é pequeno (um punhado de agendamentos), então computar no cliente ou numa Cloud Function é barato.
- Computar sob demanda elimina uma classe inteira de bugs de inconsistência (vaga marcada como livre mas com agendamento conflitante, ou vice-versa).

## Consequências
- A tela pública precisa buscar: `horarioFuncionamento` do negócio, `bloqueios` do dia selecionado, e `agendamentos` (status `confirmado`) do dia selecionado — três leituras, não uma.
- Qualquer mudança futura para "cache de vagas" (ex: se o volume crescer muito) é uma migração de modelo, não apenas uma feature nova — por isso este ADR existe: é caro reverter a decisão de não persistir vagas se um dia precisarmos de índice/busca sobre elas.
- Esta decisão está acoplada à ADR-0002 (trava de concorrência), que resolve o problema de dois clientes tentando reservar o mesmo horário computado ao mesmo tempo.
