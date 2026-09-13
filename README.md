# AgendaZap

Agendamento online com lembrete automático no WhatsApp — SaaS multi-tenant para pequenos negócios (salões, barbearias, clínicas) que hoje perdem tempo e clientes com agenda de caderno ou grupo de WhatsApp.

**[Ver demonstração ao vivo](https://agendazap-app.web.app/demo)** · Fluxo completo com dados fictícios, sem precisar de conta. Um negócio real de exemplo: [agendazap-app.web.app/espaco-bella-vida](https://agendazap-app.web.app/espaco-bella-vida).

## O problema

Pequenos estabelecimentos de serviço costumam agendar por WhatsApp manual ou caderno: cliente esquece o horário, dono perde tempo confirmando um por um, e não há lembrete automático — o principal motivo de falta.

## O que o AgendaZap resolve

- **Página pública de agendamento** (`/{slug-do-negocio}`): o cliente escolhe o serviço, vê os horários realmente livres e confirma em menos de 1 minuto, sem precisar criar conta.
- **Painel do dono** (`/painel`): agenda do dia com dados do cliente e cancelamento, cadastro de serviços e horário de funcionamento.
- **Lembrete automático no WhatsApp** antes do horário (via WhatsApp Cloud API) — próxima etapa.
- **Multi-tenant de verdade**: uma única plataforma atende N negócios, cada um com seu próprio link e dados isolados.

## Stack

- React 19 + Vite + React Router 7
- Firebase (Auth + Firestore + Hosting)
- Cloudflare Worker (WhatsApp Cloud API — mantém o token fora do bundle do cliente) — a integrar

## Decisões de arquitetura

Ver [`CONTEXT.md`](./CONTEXT.md) para o glossário do domínio e [`docs/adr/`](./docs/adr/) para as decisões difíceis de reverter, entre elas:

- **[ADR-0001](./docs/adr/0001-horarios-livres-computados-nao-armazenados.md)** — horários livres são calculados na hora, nunca armazenados como entidade.
- **[ADR-0002](./docs/adr/0002-trava-de-concorrencia-para-evitar-agendamento-duplo.md)** — como dois clientes não conseguem reservar o mesmo horário ao mesmo tempo, usando trava por documentos no Firestore (o SDK Web não permite transação com query).
- **[ADR-0003](./docs/adr/0003-dados-do-cliente-isolados-da-consulta-publica-de-vagas.md)** — a consulta pública de horário livre nunca lê dado pessoal de cliente (nome/telefone ficam isolados numa coleção só o dono lê).
- **[ADR-0004](./docs/adr/0004-slug-reservado-via-colecao-dedicada.md)** — o link de cada negócio é reservado de forma atômica, sem risco de dois donos criarem o mesmo link ao mesmo tempo.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/demo` para o fluxo completo com dados fictícios, sem precisar configurar Firebase.

Para usar dados reais, copie `.env.example` para `.env` e preencha com as credenciais de um projeto Firebase próprio (Firestore + Auth por e-mail/senha ativados) e publique `firestore.rules`/`firestore.indexes.json` (`firebase deploy --only firestore`).

## Status

Em desenvolvimento ativo, já publicado. Feito até agora: página pública de agendamento de ponta a ponta, cadastro/login do dono, criação de negócio, CRUD de serviços, horário de funcionamento e agenda do dia com cancelamento — tudo testado contra o Firestore de produção real. Próximo: integração com a WhatsApp Cloud API.
