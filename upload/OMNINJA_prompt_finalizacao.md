# OMNINJA — Prompt de Finalização Rápida (para Claude Code, no repositório existente)

## ⚠️ Leia isto antes de qualquer coisa

Este documento **não é para colar num gerador de site do zero** (v0, Fable 5 solto na Vercel, bolt.new etc). Fazer isso criaria um projeto novo e descartaria a landing page, o workspace, o sistema de créditos, a autenticação e as 9 APIs que **já existem e já funcionam** no seu repositório.

O caminho mais rápido para lançar é **terminar o repositório atual**, não recomeçar. Use este documento como instrução para o **Claude Code** (ou o Z.ai Code, se preferir continuar nele) rodando dentro da pasta do projeto, com acesso ao terminal e à sua instância AWS.

**Risco de segurança ativo — resolva primeiro:** o branch `prod-ubuntu` liga o site a um servidor de sandbox na sua EC2 (`SANDBOX_URL` no `.env`) que expõe execução de shell **sem autenticação**. Enquanto isso estiver assim, qualquer pessoa que descubra esse endereço pode rodar comandos na sua máquina. Um token de autenticação vem antes de qualquer outra coisa nesse branch — está na Prioridade 2.

---

## Estado real do projeto (não refazer o que já existe)

**Stack:** Next.js 16 (App Router) · Bun · Prisma + SQLite · Tailwind v4 + shadcn/ui · Zustand · socket.io (mini-service `event-stream`) · Caddy como gateway · rodando hoje em preview Ubuntu.

**Já funcionando de verdade (confirmado no worklog do projeto):**
- Landing completa: hero, 3 modos (Chat / Agent / Agent MAX), features, pricing (Free/Pro/Business), FAQ, stats animados
- Workspace: sidebar, chat, painel "Computador" (abas Código / Pré-visualizar / Navegador / Terminal), command palette (⌘K), biblioteca com replay de sessões, agendamento de tarefas, marketplace de plugins (UI), tema claro/escuro
- Auth real (registro/login/logout com hash scrypt), upload de arquivos funcional, chat persistente
- Chat com LLM real via GLM-5.2 (z-ai-web-dev-sdk), streaming token a token
- Sistema de créditos (tiers Free/Pro/Business), 9 APIs internas

**Ainda simulado ou incompleto:**
- O "Agent" (execução de shell/navegador) hoje é um **timeline scriptado no cliente** (`src/lib/orchestrator.ts`), não execução real — é isso que faz os botões parecerem reais sem fazer nada de fato
- 7 de 18 integrações configuradas (faltam chaves no `.env`)
- Sandbox real na EC2 iniciado no branch `prod-ubuntu` (`mini-services/sandbox-server`, `src/lib/sandbox-client.ts`), mas sem merge pra `main`, sem autenticação, não testado ponta a ponta
- Browserless: a chave já está prevista no `.env`, mas `browser-agent.ts` ainda não a usa para automação real
- OAuth (Google/GitHub) e Stripe continuam como stubs

---

## Prioridade 1 — Multi-modelo real (minutos, sem mexer em código)

1. Preencher no `.env`: no mínimo `OPENROUTER_CLAUDE_API_KEY` (ou uma chave direta da Anthropic). Isso sozinho já tira o Chat do modo demonstração.
2. Reiniciar o servidor — o Prisma client fica em cache (`globalForPrisma`), reinício manual costuma ser necessário após mudanças assim.
3. Testar: pedir algo no Chat com um modelo diferente de GLM e confirmar que a resposta é real, não canned.

Baixo risco, reversível — comece por aqui hoje mesmo.

---

## Prioridade 2 — Sandbox real e seguro (o núcleo do produto)

Duas rotas possíveis. Escolha uma, ou combine:

**A) Continuar o caminho próprio (EC2 + `sandbox-server`)**
- Adicionar autenticação obrigatória em **todos** os endpoints do `sandbox-server`: um bearer token fixo via variável de ambiente (ex.: `SANDBOX_AUTH_TOKEN`), verificado antes de qualquer `shell_exec`, ação de navegador ou leitura/escrita de arquivo. `sandbox-client.ts` no Next.js envia esse token em cada chamada.
- Restringir o Security Group da EC2 para aceitar a porta do sandbox **apenas** a partir do IP do seu backend Next.js — nunca `0.0.0.0/0`.
- Endpoints mínimos, no padrão que o próprio Manus usa: `POST /shell/exec`, `POST /browser/action`, `GET/POST /files`, `GET /health`.
- O navegador do usuário final nunca fala direto com a EC2 — só o backend.
- Trocar o timeline scriptado do `orchestrator.ts` por consumo de eventos reais desse sandbox, via o serviço `event-stream` (socket.io) que você já tem rodando.

**B) Caminho mais rápido: usar infraestrutura pronta da Anthropic em vez de reinventar**
- **Claude Agent SDK** (`npm install @anthropic-ai/claude-agent-sdk`, ou `pip install claude-agent-sdk`) já entrega loop de agente, acesso a shell/arquivos e sub-agentes prontos — rodando na sua própria EC2, substitui boa parte do código customizado do `sandbox-server` e do `agent-loop.ts`.
- **Claude Managed Agents API**: sessão de agente hospedada pela própria Anthropic, cobrada por hora ativa de sessão — opção se você não quiser manter a EC2 na mão a longo prazo.
- Qualquer uma das duas ainda pode usar o Browserless para a parte de navegador.

Teste ponta a ponta com uma tarefa real ("crie um arquivo de teste e liste o diretório") antes de seguir para a próxima prioridade.

---

## Prioridade 3 — Completar as integrações

- Conectar o Browserless de verdade em `browser-agent.ts`, lendo `BROWSERLESS_API_KEY` do `.env` — nunca escrever a chave direto no código (ou em qualquer prompt/documento). A chave que você compartilhou aqui no chat: troque-a antes de ir pra produção, já que ficou visível nesta conversa.
- Preencher as chaves restantes do OpenRouter (GPT, Kimi, Grok, Gemini) conforme a prioridade dos seus usuários.
- Corrigir a pequena inconsistência de copy no card do plano Business na landing (aparece "20 tarefas simultâneas" numa seção e "ilimitadas" noutra).

---

## Prioridade 4 — Publicar

- Frontend Next.js: pode ir pra Vercel normalmente (isso é só o app Next.js — não o sandbox) **ou** continuar no Ubuntu + Caddy que já está no ar. Os dois funcionam; escolha pelo que for mais rápido pra você hoje.
- Checklist mínimo antes de abrir pro público: rate limit por usuário/IP nas rotas de agente, HTTPS em tudo, `.env` fora do git, token do sandbox rotacionável.

---

## Bloco pronto para colar no Claude Code

```
Você está trabalhando no repositório do OmniNinja (Next.js 16 + Bun + Prisma +
Caddy). Landing, workspace, auth, créditos e 9 APIs já funcionam — não recrie
nada disso. Sua tarefa, nesta ordem:

1. Adicione autenticação por bearer token em mini-services/sandbox-server
   (todos os endpoints), lendo o token de uma variável de ambiente
   SANDBOX_AUTH_TOKEN. Atualize sandbox-client.ts para enviar esse token
   em cada chamada.
2. Restrinja o Security Group da instância EC2 para aceitar a porta do
   sandbox apenas do IP do backend — documente o comando/passo a passo.
3. Substitua a simulação em src/lib/orchestrator.ts por consumo de eventos
   reais vindos do sandbox via o serviço event-stream (socket.io) já
   existente.
4. Garanta que agent-loop.ts use o sandbox real (via SANDBOX_URL) quando
   configurado, com fallback claro para modo demo quando não estiver.
5. Conecte browser-agent.ts ao Browserless real usando BROWSERLESS_API_KEY
   do .env.
6. Rode bun run lint e teste uma tarefa real de ponta a ponta antes de
   finalizar.

Não altere o design system, a landing page ou os componentes de UI que já
existem. Priorize funcionar de verdade sobre cobrir 100% dos 18 plugins.
```

---

## Referência rápida — padrões que valem copiar (Manus, Kimi, SuperNinja)

- Um computador de verdade por tarefa vale mais que uma lista fixa de ferramentas de API — é a decisão de arquitetura mais citada pela própria equipe do Manus, e o motivo real de escolherem Claude (sustentar loops de 30-50 passos sem parar cedo demais).
- Uma chamada de ferramenta por iteração, sempre — nunca deixar o agente "pensar em texto puro" sem agir.
- Manter um `todo.md` por tarefa como checklist — já está no espírito do seu `worklog.md`.
- "Agent MAX" (sub-agentes em paralelo, ao estilo Wide Research do Manus ou Agent Swarm do Kimi) só compensa depois que o modo "Agent" single-thread estiver 100% real — foi a ordem que os três seguiram.
