# ADR-0003: Dados do Cliente nunca são lidos pela consulta pública de horários

## Status
Aceito — 2026-09-13

## Contexto
A tela pública de agendamento precisa saber quais horários já estão ocupados para calcular o que está livre (ADR-0001). A forma mais direta seria a própria tela ler a coleção `agendamentos` do negócio, filtrando por dia — mas cada documento de Agendamento contém `clienteNome` e `clienteTelefone` do Cliente que reservou aquele horário. Se a regra de segurança permitisse leitura pública dessa coleção (necessário pro cálculo de horário livre funcionar sem login), **qualquer visitante da página pública passaria a conseguir ler nome e telefone de todos os outros clientes daquele negócio** — um vazamento de dado pessoal real, não hipotético.

## Decisão
O cálculo de horário livre nunca lê a coleção `agendamentos`. Em vez disso, lê a coleção `agendaTravas` (já criada pela ADR-0002 para a trava de concorrência), que guarda só `{agendamentoId}` por bloco de 15min — nenhum dado do Cliente. A consulta por dia usa range sobre o próprio ID do documento (que é a chave cronológica do bloco), sem precisar de outro índice.

`agendamentos` (com nome/telefone) fica com leitura restrita ao dono do negócio nas regras do Firestore; `agendaTravas` (sem dado pessoal) fica com leitura pública.

## Motivos
- Segurança por design: a coleção que a tela pública consulta **fisicamente não contém** o dado sensível — não depende de "confiar" que a regra de segurança nunca vai ter um bug de permissão liberando `agendamentos` demais.
- Reaproveita uma estrutura que já existia por outro motivo (ADR-0002), sem duplicar dado.

## Consequências
- Qualquer nova feature que precise saber "esse horário está ocupado" (ex: exportação de agenda, notificação) deve decidir explicitamente se lê `agendaTravas` (rápido, sem PII, mas só diz "ocupado", não por quem) ou `agendamentos` (com PII, exige estar autenticado como dono).
- Cancelar um Agendamento precisa apagar os documentos-trava correspondentes (já previsto na ADR-0002) — se isso falhar, o horário fica bloqueado para sempre mesmo aparecendo livre no painel do dono. Vale um teste específico para isso quando o cancelamento for implementado.
