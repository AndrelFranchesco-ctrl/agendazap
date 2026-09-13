# ADR-0004: Slug do negócio é reservado numa coleção dedicada, não numa query de unicidade

## Status
Aceito — 2026-09-13

## Contexto
Cada Negócio tem um `slug` que forma a URL pública (`/{slug}`) e precisa ser único no sistema inteiro. A forma ingênua de garantir isso — buscar `where('slug','==',novoSlug)` antes de criar — tem uma janela de corrida: dois donos podem cadastrar o mesmo slug ao mesmo tempo e passar pela checagem antes de qualquer um escrever (mesma classe de problema da ADR-0002, só que para nome de negócio em vez de horário).

## Decisão
Existe uma coleção `slugs/{slug}` onde o **próprio slug é o ID do documento**. Criar um Negócio é uma transação que:
1. `tx.get(slugs/{slug})` — se existir, aborta com `SlugIndisponivelError`.
2. `tx.set(slugs/{slug}, {negocioId})`, `tx.set(negocios/{negocioId}, {...})` e `tx.set(usuarios/{uid}, {negocioId})` — todos na mesma transação.

`negocioId` continua sendo um ID opaco (autoId do Firestore), não o slug — assim, se um dia existir uma feature de trocar o slug (rebranding), só se apaga o documento antigo em `slugs` e cria um novo, sem precisar migrar `negocios/{negocioId}` nem nenhuma subcoleção.

## Motivos
- Elimina a corrida por completo (mesma técnica de "documento como trava" da ADR-0002, aplicada a nome único em vez de horário).
- Buscar um negócio pelo slug fica mais barato: dois `get()` diretos por referência (`slugs/{slug}` → `negocios/{negocioId}`), sem precisar de índice nem de query.

## Consequências
- Toda criação de Negócio **precisa** passar pela função central `criarNegocio()` — nunca criar o documento em `negocios` direto.
- Trocar o slug de um negócio (não implementado em v1) exige apagar o doc antigo em `slugs` e criar um novo — ainda não há UI pra isso; a regra de segurança atual proíbe update/delete em `slugs` para manter v1 simples.
