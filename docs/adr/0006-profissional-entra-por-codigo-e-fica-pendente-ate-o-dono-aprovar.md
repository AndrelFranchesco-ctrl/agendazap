# ADR-0006: Profissional entra por código de equipe e fica pendente até o Dono aprovar

## Status
Aceito — 2026-09-14. Revisado no mesmo dia (a reserva do código passou a exigir `ehDonoDoNegocio` de verdade, via a criação em duas etapas descrita na ADR-0004 — a v1 desta ADR tinha uma brecha real que foi pega antes de testar com clientes reais, não depois).

## Contexto
O pedido era autoatendimento: o Profissional (ex: um barbeiro) cria a própria conta e o próprio perfil, sem o Dono precisar cadastrá-lo manualmente (diferente de Booksy/Fresha, onde é o dono quem adiciona a equipe primeiro). Autoatendimento puro tem um risco real: se qualquer pessoa autenticada pudesse se cadastrar como Profissional de qualquer Negócio, bastaria descobrir o `negocioId` (que não é secreto — aparece nos dados públicos da página de agendamento) pra se listar como "barbeiro" de um negócio que não é dela.

## Decisão
1. Cada Negócio ganha, na criação, um **código de equipe** de 6 caracteres, reservado na coleção `codigosEquipe/{codigo} → {negocioId}` — exatamente o mesmo padrão de reserva usado pro slug (ADR-0004), inclusive a criação em duas etapas (negócio primeiro, código depois) pelo mesmo motivo técnico. A regra de segurança exige `ehDonoDoNegocio` pra criar essa reserva — sem isso, qualquer autenticado poderia criar seu próprio código válido apontando pro negócio de outra pessoa, sem nunca ter tido o código real do dono. O Dono compartilha o código com o barbeiro fora do sistema (WhatsApp, verbalmente).
2. Pra criar um Profissional, o cliente resolve o código em `negocioId` (leitura pública de `codigosEquipe/{codigo}`) e a regra de segurança do Firestore **revalida isso no servidor**: só aceita a criação do documento em `profissionais` se `codigosEquipe/{codigoUsado}.negocioId` bater com o negócio do caminho. Isso fecha a brecha de "adivinhar o negocioId", porque adivinhar um código de 6 caracteres válido é impraticável.
3. Todo Profissional recém-criado nasce com **`ativo:false`**. Só o Dono pode alternar pra `true` (a regra de segurança impede o próprio Profissional de se auto-aprovar). Só Profissionais `ativo:true` aparecem na tela pública de agendamento.

## Motivos
- Reaproveita um padrão já testado e aceito (reserva atômica por código — igual ADR-0004, e o mesmo espírito do fluxo de "orientador entra com código da escola" que o Andrel já usou no MICH.CO) em vez de inventar um mecanismo novo.
- A aprovação pendente é a segunda camada de defesa: mesmo que alguém adivinhasse ou vazasse um código de equipe, o Dono ainda precisa aprovar antes do perfil aparecer pros clientes ou virar agendável.

## Consequências
- O Dono precisa de uma tela (`/painel/equipe`) pra ver quem pediu pra entrar e aprovar/recusar — sem isso, um Profissional fica pendente pra sempre.
- Não existe (v1) um jeito de o Dono revogar/trocar o código de equipe se ele vazar — o código é fixo desde a criação do Negócio. Risco residual aceito por ora, mesmo padrão de "aceito por ora" já usado nas ADRs anteriores; mitigação futura: botão de "gerar novo código" que invalida o antigo.
