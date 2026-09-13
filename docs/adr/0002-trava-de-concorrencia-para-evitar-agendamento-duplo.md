# ADR-0002: Trava de concorrência via documentos-bloco para evitar agendamento duplo

## Status
Aceito — 2026-09-13. Revisado — 2026-09-13 (v1 usava `getDocs` de uma query dentro da transação; corrigido porque o SDK Web do Firestore só suporta `transaction.get(DocumentReference)`, não `transaction.get(Query)` — essa capacidade existe no Admin SDK, não no client. A versão anterior não era atômica de verdade.)

## Contexto
Como o horário livre é computado (ADR-0001) e não armazenado, existe uma janela real de corrida: dois Clientes podem ver o mesmo horário como livre e tentar confirmar ao mesmo tempo. Precisamos de uma forma de garantir atomicidade **usando apenas o SDK Web do Firestore** (sem depender de Cloud Functions/Admin SDK em v1, para manter a arquitetura simples — mesma decisão de "sem backend próprio" já tomada para o resto do produto).

A restrição chave: transações do SDK Web só leem/escrevem documentos endereçados por `DocumentReference` — não é possível rodar uma query de "todos os agendamentos que colidem com esse intervalo" dentro da transação.

## Decisão
Cada intervalo de tempo é dividido em blocos fixos de `INTERVALO_MIN` (15 min — mesma granularidade usada para oferecer horários, ver `src/lib/horarios.js`). Um Agendamento de duração D ocupa `ceil(D / 15)` blocos consecutivos a partir do horário de início.

Cada bloco vira um documento-trava com ID determinístico:
`negocios/{negocioId}/agendaTravas/{YYYY-MM-DDTHH:mm}`

A criação de um Agendamento roda numa transação que:
1. Faz `tx.get()` de **cada** documento-trava que o novo agendamento ocuparia (leituras individuais por referência — permitido).
2. Se **qualquer** um já existir, aborta com `HorarioIndisponivelError`.
3. Se nenhum existir, escreve o documento do Agendamento **e** todos os documentos-trava correspondentes, na mesma transação.

Como todo agendamento (independente da duração do serviço) reserva todo bloco de 15 min que toca, dois agendamentos com durações diferentes que se sobrepõem sempre vão disputar pelo menos um bloco em comum — o caso que a v1 desta decisão (com "slot único por horário de início") não cobria.

## Motivos
- Mantém tudo no SDK Web, sem precisar subir Cloud Functions/Admin SDK só para isto.
- `tx.get(DocumentReference)` + `tx.set(DocumentReference)` são operações de transação legítimas e atômicas no SDK Web — ao contrário de rodar uma `Query` dentro da transação.
- Granularidade de 15 min é pequena o suficiente para não desperdiçar horários (nenhum negócio real teria serviços com duração não-múltipla de 15 min de forma problemática).

## Consequências
- Cancelar um Agendamento **precisa** apagar os documentos-trava correspondentes na mesma operação — senão o horário fica "fantasma-ocupado" para sempre. Isso vai na função central `cancelarAgendamento()` (a ser implementada junto do painel do dono).
- Toda escrita de Agendamento continua obrigada a passar pela função central `criarAgendamento()` — nunca `addDoc` direto.
- Se um dia migrarmos para Cloud Functions (Admin SDK), essa trava por blocos pode ser simplificada para uma única query transacional — mas não há pressa: o padrão atual já é correto e é o recomendado pela própria documentação do Firestore para reserva de vagas concorrente.
