# ADR-0004: Slug do negócio é reservado numa coleção dedicada, não numa query de unicidade

## Status
Aceito — 2026-09-13. Revisado — 2026-09-14 (criação passou de uma transação única pra duas etapas — ver seção "Revisão" abaixo; a ideia central, coleção dedicada com o slug como ID, continua a mesma).

## Contexto
Cada Negócio tem um `slug` que forma a URL pública (`/{slug}`) e precisa ser único no sistema inteiro. A forma ingênua de garantir isso — buscar `where('slug','==',novoSlug)` antes de criar — tem uma janela de corrida: dois donos podem cadastrar o mesmo slug ao mesmo tempo e passar pela checagem antes de qualquer um escrever (mesma classe de problema da ADR-0002, só que para nome de negócio em vez de horário).

## Decisão
Existe uma coleção `slugs/{slug}` onde o **próprio slug é o ID do documento**. A regra de segurança dessa coleção exige que quem cria a reserva seja o dono do `negocioId` referenciado (`ehDonoDoNegocio`).

`negocioId` continua sendo um ID opaco (autoId do Firestore), não o slug — assim, se um dia existir uma feature de trocar o slug (rebranding), só se apaga o documento antigo em `slugs` e cria um novo, sem precisar migrar `negocios/{negocioId}` nem nenhuma subcoleção.

## Motivos
- Elimina a corrida por completo (mesma técnica de "documento como trava" da ADR-0002, aplicada a nome único em vez de horário).
- Buscar um negócio pelo slug fica mais barato: dois `get()` diretos por referência (`slugs/{slug}` → `negocios/{negocioId}`), sem precisar de índice nem de query.
- Exigir `ehDonoDoNegocio` na regra fecha uma brecha real: sem isso, qualquer autenticado poderia reservar um slug apontando pro negócio de outra pessoa.

## Revisão 2026-09-14: criação em duas etapas
A versão original criava `negocios/{id}` e `slugs/{slug}` na MESMA transação. Isso quebrou ao adicionar a checagem `ehDonoDoNegocio` na regra de `slugs`: um `get()` dentro de uma regra de segurança do Firestore **não enxerga escritas irmãs da mesma transação** — ele vê o estado de antes dela começar. Como `negocios/{id}` ainda não existia nesse "antes", `ehDonoDoNegocio` sempre falhava, mesmo no caso legítimo. Testado e confirmado no navegador antes de assumir que funcionava.

`criarNegocio()` agora faz:
1. Cria `negocios/{id}` sozinho (sem `slug` ainda — a regra de create não exige mais esse campo).
2. Reserva `slugs/{slug}` (+ `codigosEquipe/{codigo}`, ver ADR-0006) numa transação separada, que agora pode checar `ehDonoDoNegocio` de verdade porque o negócio já existe. Essa mesma transação faz o **único** `update` permitido de `negocios/{id}.slug` (a regra bloqueia mudar depois de setado).

**Residual aceito:** se a etapa 2 falhar (slug já em uso por outro negócio — raro, mas possível), o documento da etapa 1 fica órfão (sem slug, inatingível por qualquer busca pública, já que nada aponta pra ele). É sujeira de dado, não um bug de comportamento — o dono só tenta de novo com outro slug. `negocios.delete` continua bloqueado (`if false`), então não há limpeza automática desses órfãos em v1.

## Consequências
- Toda criação de Negócio **precisa** passar pela função central `criarNegocio()` — nunca criar o documento em `negocios` direto, nem em uma etapa isolada.
- Trocar o slug de um negócio (não implementado em v1) exige apagar o doc antigo em `slugs` e criar um novo — ainda não há UI pra isso; a regra de segurança atual proíbe update/delete em `slugs` para manter v1 simples.
