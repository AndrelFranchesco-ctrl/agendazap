# AgendaZap

Agendamento online com lembrete automático no WhatsApp — SaaS multi-tenant para pequenos negócios (salões, barbearias, clínicas) que hoje perdem tempo e clientes com agenda de caderno ou grupo de WhatsApp.

**[Ver demonstração ao vivo](#)** _(link após o deploy)_ · Fluxo completo funciona em `/demo` sem precisar de dados reais.

## O problema

Pequenos estabelecimentos de serviço costumam agendar por WhatsApp manual ou caderno: cliente esquece o horário, dono perde tempo confirmando um por um, e não há lembrete automático — o principal motivo de falta.

## O que o AgendaZap resolve

- **Página pública de agendamento** (`/{slug-do-negocio}`): o cliente escolhe o serviço, vê os horários realmente livres e confirma em menos de 1 minuto, sem precisar criar conta.
- **Lembrete automático no WhatsApp** antes do horário (via WhatsApp Cloud API), reduzindo falta.
- **Painel do dono** (em construção): cadastro de serviços, horário de funcionamento e agenda do dia.
- **Multi-tenant de verdade**: uma única plataforma atende N negócios, cada um com seu próprio link e dados isolados.

## Stack

- React 19 + Vite + React Router 7
- Firebase (Auth + Firestore + Hosting)
- Cloudflare Worker (WhatsApp Cloud API — mantém o token fora do bundle do cliente)

## Decisões de arquitetura

Ver [`CONTEXT.md`](./CONTEXT.md) para o glossário do domínio e [`docs/adr/`](./docs/adr/) para as decisões difíceis de reverter, entre elas:

- **[ADR-0001](./docs/adr/0001-horarios-livres-computados-nao-armazenados.md)** — horários livres são calculados na hora, nunca armazenados como entidade.
- **[ADR-0002](./docs/adr/0002-trava-de-concorrencia-para-evitar-agendamento-duplo.md)** — como dois clientes não conseguem reservar o mesmo horário ao mesmo tempo, usando trava por documentos no Firestore (o SDK Web não permite transação com query).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/demo` para o fluxo completo com dados fictícios, sem precisar configurar Firebase.

Para usar dados reais, copie `.env.example` para `.env` e preencha com as credenciais de um projeto Firebase próprio (Firestore + Auth ativados).

## Status

🚧 Em desenvolvimento ativo. Feito até agora: tela pública de agendamento de ponta a ponta (seleção de serviço, dia/horário com checagem de conflito, dados do cliente, confirmação). Próximo: painel do dono do negócio.
