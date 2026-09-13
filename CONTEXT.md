# Glossário do domínio — AgendaZap

## Termos

**Negócio** (tenant)
O estabelecimento cliente da plataforma (salão, barbearia, clínica). Tem um `slug` único usado na URL pública (`agendazap.app/{slug}`), um número de WhatsApp para onde chegam as notificações internas, e um horário de funcionamento. Todo dado de agendamento pertence a exatamente um Negócio — não existe dado compartilhado entre negócios. O `slug` é reservado numa coleção própria no momento da criação — ver ADR-0004.

**Dono**
Usuário autenticado (Firebase Auth) vinculado a um Negócio via `usuarios/{uid}.negocioId`. É quem acessa o painel administrativo. Um dono pertence a exatamente um Negócio (v1 — sem multi-negócio por dono).

**Serviço**
Algo que um Negócio oferece e que pode ser agendado: tem nome, duração (em minutos) e preço. A duração do Serviço é o que define o tamanho do "bloco" ocupado na agenda quando um Agendamento é criado.

**Cliente**
A pessoa que agenda um horário na página pública. **Não é um usuário autenticado** — identificado apenas por nome e telefone (WhatsApp), informados no momento do agendamento. Não tem login, não tem conta, não tem histórico visível para ele mesmo (v1).

**Agendamento**
Um compromisso de um Cliente com um Negócio, para um Serviço específico, numa data/hora específica. Estados possíveis: `confirmado`, `cancelado`, `concluido`. Um Agendamento sempre ocupa um intervalo de tempo = `[dataHoraInicio, dataHoraInicio + servico.duracaoMin)`.

**Bloqueio**
Um intervalo de tempo em que o Negócio não aceita Agendamentos (folga, feriado, almoço). Não é a mesma coisa que "fora do horário de funcionamento" — horário de funcionamento é uma regra recorrente semanal; Bloqueio é uma exceção pontual.

**Horário livre / vaga**
**Não é uma entidade armazenada.** É um valor computado, no momento da consulta, a partir de: horário de funcionamento do dia da semana − Bloqueios do dia − intervalos já ocupados por Agendamentos `confirmado` no dia. Ver ADR-0001.

**Lembrete**
Mensagem automática de WhatsApp enviada X horas antes do horário do Agendamento. Rastreado pelo campo `lembreteEnviado` no próprio Agendamento — não é uma entidade própria.

## Decisões de nomenclatura

- Usamos os termos em **português** no modelo de dados (`negocio`, `servico`, `agendamento`) porque é um produto para o mercado brasileiro e o dono do produto (Andrel) pensa e conversa sobre o domínio em português. Não misturar com inglês nos nomes de campos/coleções.
- "Cliente" aqui NUNCA significa o dono do Negócio nem o usuário autenticado — sempre a pessoa final que agenda. Cuidado ao ler código antigo de outros projetos (ex: MICH.CO) onde "usuário" pode ter sentido diferente — são domínios não relacionados.
