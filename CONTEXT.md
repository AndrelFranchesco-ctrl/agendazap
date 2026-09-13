# Glossário do domínio — AgendaZap

## Termos

**Negócio** (tenant)
O estabelecimento cliente da plataforma (salão, barbearia, clínica). Tem um `slug` único usado na URL pública (`agendazap.app/{slug}`), um número de WhatsApp para onde chegam as notificações internas, e um horário de funcionamento. Todo dado de agendamento pertence a exatamente um Negócio — não existe dado compartilhado entre negócios. O `slug` é reservado numa coleção própria no momento da criação — ver ADR-0004.

**Dono**
Usuário autenticado (Firebase Auth) vinculado a um Negócio via `usuarios/{uid}.negocioId`. É quem acessa o painel administrativo. Um dono pertence a exatamente um Negócio (v1 — sem multi-negócio por dono).

**Serviço**
Algo que um Negócio oferece e que pode ser agendado: tem nome, duração (em minutos) e preço. A duração do Serviço é o que define o tamanho do "bloco" ocupado na agenda quando um Agendamento é criado. Cada Profissional atende um subconjunto dos Serviços do Negócio (`profissional.servicosIds`).

**Profissional**
A pessoa que de fato atende o Cliente (ex: o barbeiro, o cabeleireiro, o esteticista) — **o recurso que é agendado**, não o Negócio como um todo. Tem perfil próprio (nome, bio) e **horário de trabalho próprio**, que por padrão herda o horário de funcionamento do Negócio na criação mas é editável independentemente depois (um Profissional pode trabalhar terça e quinta enquanto o Negócio abre todo dia útil). Entra num Negócio já existente via **código de equipe** (ver ADR-0006) e começa `ativo:false` até o Dono aprovar. Ver ADR-0005 para por que o agendamento passou a ser por Profissional, não por Negócio.

Um Negócio pode não ter nenhum Profissional cadastrado (ex: o Dono é o único que atende, ou um negócio antigo de antes dessa funcionalidade existir) — nesse caso o Negócio inteiro continua sendo o recurso agendado, como era antes da ADR-0005.

**Dono** × **Profissional**
Ambos são `usuarios/{uid}` autenticados vinculados a um Negócio, mas com papéis diferentes (`usuarios/{uid}.tipo`). O Dono administra o Negócio inteiro (serviços, aprovação de Profissionais, todos os agendamentos). O Profissional só edita o próprio perfil e o próprio horário de trabalho, e (futuramente) só vê a própria agenda — nunca a de outro Profissional do mesmo Negócio.

**Cliente**
A pessoa que agenda um horário na página pública. **Não é um usuário autenticado** — identificado apenas por nome e telefone (WhatsApp), informados no momento do agendamento. Não tem login, não tem conta, não tem histórico visível para ele mesmo (v1).

**Agendamento**
Um compromisso de um Cliente com um Profissional (ou, na ausência de Profissionais cadastrados, com o Negócio inteiro — ver acima), para um Serviço específico, numa data/hora específica. Estados possíveis: `confirmado`, `cancelado`, `concluido`. Um Agendamento sempre ocupa um intervalo de tempo = `[dataHoraInicio, dataHoraInicio + servico.duracaoMin)` na agenda do Profissional (ou do Negócio, no modo sem Profissionais).

**Bloqueio**
Um intervalo de tempo em que o Negócio não aceita Agendamentos (folga, feriado, almoço). Não é a mesma coisa que "fora do horário de funcionamento" — horário de funcionamento é uma regra recorrente semanal; Bloqueio é uma exceção pontual. (v1: Bloqueio ainda é só do Negócio inteiro, não por Profissional — ver residual na ADR-0005.)

**Horário livre / vaga**
**Não é uma entidade armazenada.** É um valor computado, no momento da consulta, a partir de: horário de trabalho do Profissional (ou horário de funcionamento do Negócio, no modo sem Profissionais) no dia da semana − Bloqueios do Negócio no dia − intervalos já ocupados por Agendamentos `confirmado` daquele Profissional (ou Negócio) no dia. Ver ADR-0001 e ADR-0005.

**Lembrete**
Mensagem automática de WhatsApp enviada X horas antes do horário do Agendamento. Rastreado pelo campo `lembreteEnviado` no próprio Agendamento — não é uma entidade própria.

## Decisões de nomenclatura

- Usamos os termos em **português** no modelo de dados (`negocio`, `servico`, `agendamento`) porque é um produto para o mercado brasileiro e o dono do produto (Andrel) pensa e conversa sobre o domínio em português. Não misturar com inglês nos nomes de campos/coleções.
- "Cliente" aqui NUNCA significa o dono do Negócio nem o usuário autenticado — sempre a pessoa final que agenda. Cuidado ao ler código antigo de outros projetos (ex: MICH.CO) onde "usuário" pode ter sentido diferente — são domínios não relacionados.
