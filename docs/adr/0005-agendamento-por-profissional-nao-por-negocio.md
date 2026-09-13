# ADR-0005: O recurso agendado é o Profissional, não o Negócio inteiro

## Status
Aceito — 2026-09-14

## Contexto
Até aqui, o AgendaZap tratava o Negócio inteiro como um único recurso agendável: só existia UMA agenda por negócio, com UMA trava de concorrência (ADR-0002) e UM cálculo de horário livre (ADR-0001) baseados no `horarioFuncionamento` do Negócio. Isso funciona para um autônomo que atende sozinho, mas não reflete como sistemas de barbearia/salão de verdade funcionam (Trinks, Fresha, Booksy pesquisados como referência): cada profissional (barbeiro, cabeleireiro) tem sua própria agenda e seu próprio horário de trabalho, e dois profissionais do mesmo negócio podem atender clientes diferentes no mesmo horário — o que o modelo anterior não permitia (a trava era compartilhada pelo negócio inteiro, então dois agendamentos simultâneos em profissionais diferentes colidiriam incorretamente).

## Decisão
Quando um Negócio tem Profissionais cadastrados, o recurso agendável passa a ser o **Profissional**, não o Negócio:
- `horarioTrabalho` do Profissional (não `horarioFuncionamento` do Negócio) define os horários possíveis.
- A trava de concorrência (ADR-0002) fica em `negocios/{id}/profissionais/{profissionalId}/agendaTravas/{chave}` — cada Profissional tem seu próprio espaço de travas, então dois profissionais podem ter o mesmo bloco ocupado ao mesmo tempo sem colidir entre si.
- `agendamentos` ganha `profissionalId`/`profissionalNome`.

**Modo de compatibilidade:** um Negócio sem nenhum Profissional cadastrado (`ativo:true`) continua funcionando exatamente como antes — o Negócio inteiro é o recurso, usando `horarioFuncionamento` e a trava antiga em `negocios/{id}/agendaTravas/{chave}`. Isso evita quebrar negócios já cadastrados (ex: "Espaço Bella Vida", criado antes desta ADR) e mantém a rota `/demo` funcionando sem mudança.

## Motivos
- Reflete a realidade de qualquer negócio com mais de uma pessoa atendendo — sem isso, a feature de "cada barbeiro com seu próprio horário" seria só cosmética (o barbeiro editaria um horário que nada usaria de verdade pra calcular disponibilidade).
- O modo de compatibilidade evita uma migração arriscada de dado existente — negócios antigos não precisam ser convertidos, e novos negócios que nunca cadastram um Profissional continuam no caminho mais simples.

## Consequências
- A tela pública de agendamento precisa de uma etapa a mais (escolher o Profissional) **só quando o Negócio tem Profissionais ativos** — precisa checar isso antes de decidir qual fluxo seguir.
- `Bloqueio` (folgas/feriados) continua só no nível do Negócio em v1, mesmo no modo com Profissionais — um Bloqueio afeta todos os Profissionais igualmente. Bloqueio por Profissional individual (ex: só um barbeiro de férias) fica para depois; documentado aqui pra não ser confundido com um bug.
- Qualquer relatório/exportação futura de agenda precisa decidir se agrega por Profissional ou por Negócio inteiro — não existe mais "a" agenda única de um negócio com Profissionais.
