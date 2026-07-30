# OMNINJA — PROMPT MESTRE v5 (Dezembro/2026)
## Especificação Completa para Construir uma Empresa de IA Autônoma

> **Produto:** OmniNinja — Agente de IA Autônomo de Propósito Geral
> **Modelo de Referência:** Manus AI + Ninja AI + Claude Computer Use
> **Alvo:** Empresa de IA completa (site + sandbox + multi-modelo + billing)
> **Stack:** Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma, Socket.IO
> **Infra:** AWS EC2 (Ubuntu 22.04 sandbox) + Z.ai (frontend) + OpenRouter (modelos)

---

## PARTE 1 — VISÃO GERAL E FILOSOFIA

### 1.1 O que é o OmniNinja

OmniNinja é uma plataforma de agente de IA autônomo de propósito geral — inspirada no Manus AI e Ninja AI. Não é apenas um chatbot: é um sistema que **planeja, executa e entrega** tarefas complexas usando um computador virtual Ubuntu real, com navegador Chromium, terminal bash, Python, Node.js e sistema de arquivos — tudo visível em tempo real pelo usuário.

### 1.2 Filosofia: "Less Structure, More Intelligence"

Inspirado diretamente no Manus (confirmado pelo cofundador Ji Yichao em talk pública):
- **NÃO** usar arquitetura multi-agente com papéis fixos (um "coder agent", um "search agent")
- **USAR** um único agente com acesso rico a ferramentas e contexto
- Deixar o modelo "improvisar" a decomposição do problema
- Capacidades novas "emergem" conforme os modelos de base melhoram

### 1.3 Princípios de Design (fiel ao Manus)

1. **Transparência total** — o usuário vê TUDO que o agente faz (nada de caixa-preta)
2. **Sandbox Ubuntu real** — não simulação, execução de verdade
3. **Painel "Computador" DENTRO do chat** — nunca aba separada
4. **O Computador só abre quando necessário** — perguntas simples não abrem sandbox
5. **Multi-modelo** — usuário escolhe qual IA usar (Claude, GPT, GLM, Gemini, Kimi, Grok)
6. **Replay de sessões** — cada ação é gravada e pode ser revista com scrubber
7. **Sistema de créditos** — cobrança por uso (igual Manus/Ninja)

---

## PARTE 2 — ARQUITETURA TÉCNICA COMPLETA

### 2.1 Arquitetura de 2 Planos (igual Manus)

```
┌─────────────────────────────────────────────────┐
│  PLANO 1: SITE (Frontend + APIs + Chat)          │
│  • Next.js 16 no Z.ai preview                    │
│  • URL: https://omnininja.space-z.ai             │
│  • Interface que o usuário acessa                 │
│  • WebSocket pra streaming em tempo real          │
│  • Chama o sandbox via HTTP                       │
└─────────────────────────────────────────────────┘
                      ↕ HTTPS + WebSocket
┌─────────────────────────────────────────────────┐
│  PLANO 2: SANDBOX UBUNTU (AWS EC2)               │
│  • Ubuntu 22.04 real com Docker                  │
│  • Chromium real (não headless) via CDP           │
│  • Shell: bash, python3, node, git, pip, npm     │
│  • Sistema de arquivos isolado por sessão         │
│  • Porta 3005 (exposta via ngrok ou Security Group)│
└─────────────────────────────────────────────────┘
```

### 2.2 O Agent Loop (6 passos, fiel ao Manus)

O loop de agente é repetido até a tarefa terminar:

1. **Analisar eventos** — entender a necessidade do usuário e o estado atual via event stream
2. **Selecionar ferramenta** — escolher a próxima chamada com base no estado e planejamento
3. **Aguardar execução** — a ação é executada no sandbox Ubuntu, resultado volta ao event stream
4. **Iterar** — UMA chamada de ferramenta por iteração; ciclo repete paciente
5. **Entregar resultado** — envia entrega final ao usuário com arquivos gerados
6. **Entrar em espera** — quando todas as tarefas estão concluídas

### 2.3 Thought Injection (segredo do Manus)

Antes de cada chamada de ferramenta, um **mini-agente planejador** raciocina:
- O que já foi feito
- O que falta
- Qual a próxima ferramenta ideal

Esse raciocínio é injetado no contexto do agente principal — melhora muito a precisão de tool-calling (técnica que o Manus usava antes do extended thinking nativo do Claude).

### 2.4 Event Stream (transparência total)

Cada evento é gravado e emitido via WebSocket:

```typescript
type AgentEvent =
  | { type: "TASK_STARTED"; taskId: string; goal: string; ts: number }
  | { type: "PLAN_CREATED"; taskId: string; steps: PlanStep[]; ts: number }
  | { type: "STEP_STARTED"; taskId: string; agent: string; instruction: string; ts: number }
  | { type: "AGENT_THINKING"; taskId: string; agent: string; text: string; ts: number }
  | { type: "BROWSER_ACTION"; taskId: string; action: string; screenshotBase64?: string; ts: number }
  | { type: "TERMINAL_OUTPUT"; taskId: string; cmd: string; stdout: string; stderr: string; exitCode: number; ts: number }
  | { type: "FILE_CHANGED"; taskId: string; path: string; diff?: string; ts: number }
  | { type: "STEP_COMPLETED"; taskId: string; success: boolean; result: string; ts: number }
  | { type: "TASK_COMPLETED"; taskId: string; summary: string; artifacts: Artifact[]; ts: number }
  | { type: "TASK_FAILED"; taskId: string; error: string; ts: number };
```

---

## PARTE 3 — AS 29 FERRAMENTAS (igual Manus)

### 3.1 Comunicação (2)
| Ferramenta | Função |
|---|---|
| `message_notify_user` | Envia progresso sem bloquear |
| `message_ask_user` | Pergunta e BLOQUEIA até resposta |

### 3.2 Arquivos (5)
| Ferramenta | Função |
|---|---|
| `file_read` | Lê arquivo (com faixa de linhas, sudo opcional) |
| `file_write` | Escreve/sobrescreve/anexa |
| `file_str_replace` | Substitui trecho específico |
| `file_find_in_content` | Busca regex no conteúdo |
| `file_find_by_name` | Encontra por glob pattern |

### 3.3 Shell/Terminal (5)
| Ferramenta | Função |
|---|---|
| `shell_exec` | Executa comando bash/python/node |
| `shell_view` | Mostra saída atual |
| `shell_wait` | Espera processo terminar |
| `shell_write_to_process` | Envia input pra processo interativo |
| `shell_kill_process` | Encerra processo |

### 3.4 Navegador (12)
| Ferramenta | Função |
|---|---|
| `browser_view` | Mostra estado da página |
| `browser_navigate` | Vai para URL |
| `browser_restart` | Reinicia navegador e navega |
| `browser_click` | Clica em elemento (índice ou CSS) |
| `browser_input` | Digita em campo editável |
| `browser_move_mouse` | Move cursor (curva Bézier) |
| `browser_press_key` | Simula tecla/combinação |
| `browser_select_option` | Seleciona dropdown |
| `browser_scroll_up` / `browser_scroll_down` | Rola página |
| `browser_console_exec` | Executa JavaScript |
| `browser_console_view` | Mostra logs do console |

### 3.5 Busca (1)
| Ferramenta | Função |
|---|---|
| `info_search_web` | Busca web com filtro de período |

### 3.6 Deploy (2)
| Ferramenta | Função |
|---|---|
| `deploy_expose_port` | Expõe porta (ngrok-style) |
| `deploy_apply_deployment` | Publica em produção |

### 3.7 Outras (2)
| Ferramenta | Função |
|---|---|
| `make_manus_page` | Gera página publicável de MDX |
| `idle` | Sinaliza fim de todas as tarefas |

---

## PARTE 4 — SANDBOX UBUNTU (o "Computador" do Agente)

### 4.1 Especificação do Ambiente (fiel ao Manus)

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    nodejs npm \
    git curl wget unzip \
    build-essential \
    chromium-browser \
    bc sqlite3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm typescript tsx serve
WORKDIR /workspace
RUN useradd -m -s /bin/bash sandboxuser && chown -R sandboxuser /workspace
USER sandboxuser
CMD ["/bin/bash"]
```

### 4.2 Limites por Container
- **RAM:** 2GB
- **CPU:** 1.5 vCPU
- **Timeout:** 15 min (simples) a 2 horas (complexas)
- **Disk:** 10GB temporário
- **Isolamento:** namespace Linux (PID, Mount, Network)

### 4.3 Mouse Virtual Humanizado (fiel ao Manus)

```typescript
// Movimento em curva Bézier (nunca linha reta)
// Velocidade variável (aceleração/desaceleração natural)
// Pausas aleatórias 500-2000ms entre ações
// Variação ±3px no clique (imprecisão humana)
// Scroll em múltiplos passos pequenos

async function humanMove(page, targetX, targetY) {
  const startX = Math.random() * 1280;
  const startY = Math.random() * 720;
  const steps = 5 + Math.floor(Math.random() * 4);
  const ctrlX = (startX + targetX) / 2 + (Math.random() - 0.5) * 200;
  const ctrlY = (startY + targetY) / 2 + (Math.random() - 0.5) * 200;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = (1-t)**2 * startX + 2*(1-t)*t * ctrlX + t**2 * targetX;
    const y = (1-t)**2 * startY + 2*(1-t)*t * ctrlY + t**2 * targetY;
    await page.mouse.move(x, y);
    await page.waitForTimeout(30 + Math.random() * 50);
  }
  // ±3px jitter
  await page.mouse.move(targetX + (Math.random()-0.5)*6, targetY + (Math.random()-0.5)*6);
}
```

### 4.4 3 Inputs Multimodais do Navegador (fiel ao Manus)

Quando o agente navega, envia 3 coisas ao modelo simultaneamente:

1. **Texto da viewport** — extraído e convertido para Markdown
2. **Screenshot normal** — captura da viewport
3. **Screenshot com bounding boxes** — caixas vermelhas numeradas sobre os elementos clicáveis (o LLM pode dizer "clique no elemento 3")

---

## PARTE 5 — MULTI-MODELO (Roteador)

### 5.1 Modelos Suportados (via OpenRouter)

```typescript
const OPENROUTER_MODELS = {
  claude:  { model: 'anthropic/claude-sonnet-4',  label: 'Claude (Anthropic)' },
  chatgpt: { model: 'openai/gpt-4o',              label: 'ChatGPT (OpenAI)' },
  kimi:    { model: 'moonshotai/kimi-k2',         label: 'Kimi (Moonshot)' },
  grok:    { model: 'x-ai/grok-2',                label: 'Grok (xAI)' },
  gemini:  { model: 'google/gemini-2.5-pro',      label: 'Gemini (Google)' },
};
```

### 5.2 Regras do Roteador
1. O ORQUESTRADOR usa o modelo que o usuário escolheu no seletor
2. Se o modelo falhar (timeout, 5xx): 1 retry com backoff, depois fallback
3. Streaming (`stream: true`) sempre, pra manter efeito token-a-token
4. O seletor mostra SÓ modelos com chave configurada

---

## PARTE 6 — DESIGN SYSTEM (Dark Mode Nativo, estilo Ninja AI)

### 6.1 Paleta de Cores

```css
:root {
  --bg-primary: #0d0d0f;
  --bg-secondary: #17171a;
  --bg-elevated: #1f1f23;
  --bg-hover: #2a2a2f;
  --border-subtle: #2a2a2e;
  --text-primary: #f2f2f3;
  --text-secondary: #9a9aa0;
  --text-muted: #6b6b70;
  --accent-primary: #38bdf8;     /* cyan brand */
  --accent-success: #22c55e;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;
  --accent-brand: #38bdf8;
}
```

### 6.2 Tipografia
- **Headlines:** Source Serif 4 (serif elegante, 32-40px)
- **UI:** Inter (sans-serif)
- **Código/Terminal:** JetBrains Mono
- **Cantos:** 8-12px (cards), 16-20px (modais)

### 6.3 Animações (Claude Design + Framer Motion)
- **Live pulse** — ponto verde pulsante no navegador ativo
- **Typing dots** — 3 pontos azuis pulsantes no "Pensando"
- **Shimmer** — skeleton loading animado
- **Fade-up** — mensagens aparecem subindo
- **Marquee** — logos rolando na landing
- **Terminal cursor** — cursor piscando no terminal
- **Bézier mouse** — cursor virtual movendo em curva

### 6.4 Layout Desktop
- **Sidebar fixa** 200px (logo, Nova tarefa, Agente, Plugins, Agendado, Biblioteca, Projetos, Tarefas recentes, Docs, Status, Integrações, Conta, promo card, avatar)
- **Chat central** (header com nome da tarefa, seletor de modelo, créditos)
- **Painel Computador à direita** quando há tarefa ativa (480-560px)
- **4 abas no Computador:** Código, Pré-visualizar, Navegador, Terminal

### 6.5 Mobile
- Sidebar vira drawer
- Painel Computador vira bottom sheet ou tela cheia
- Input fixo respeitando `env(safe-area-inset-bottom)`
- Usar `100dvh` em vez de `100vh`
- Alvos de toque ≥44px

---

## PARTE 7 — SISTEMA DE CRÉDITOS E BILLING

### 7.1 Tiers (igual Manus)

| Plano | Preço | Créditos | Tarefas simultâneas |
|---|---|---|---|
| Free | US$ 0 | 300/dia + 1.000 bônus | 1 |
| Pro | US$ 20/mês | 4.000/mês | 4 |
| Business | US$ 50/mês | 8.000/mês | 20 |
| Enterprise | US$ 200/mês | 40.000/mês | Ilimitado |

### 7.2 Custo por Ação
```typescript
const CREDIT_COSTS = {
  chat_message: 1,
  agent_step: 5,
  browser_action: 3,
  terminal_command: 2,
  file_write: 1,
  search_query: 4,
  deep_research_step: 12,
};
```

---

## PARTE 8 — SYSTEM PROMPT (fiel ao vazamento do Manus)

```
Você é o OmniNinja, um agente de IA autônomo (estilo Manus AI).

FERRAMENTAS (responda SEMPRE com UM JSON válido):
- Navegador: browser_navigate, browser_click, browser_type, browser_scroll_*, browser_screenshot, browser_get_text, browser_execute_js
- Shell: shell_exec, file_write, file_read
- Comunicação: message_notify_user, message_ask_user
- Finalização: todo_update, finish

REGRAS:
1. SEMPRE responda com UM JSON válido
2. Uma chamada de ferramenta por iteração
3. Primeira resposta: breve, só confirmando
4. Use message_notify_user para progresso
5. Mantenha todo.md atualizado
6. Shell: use -y/-f, encadeie com &&, Python para contas
7. Navegador: abra e leia qualquer URL
8. Erros: corrija, tente alternativa, só então reporte
9. Sempre em português
```

---

## PARTE 9 — PÁGINAS DO SITE DA EMPRESA

### 9.1 Landing Page (`/`)
- Hero com headline serif + CTA "Começar Agora — Grátis"
- 3 modos (Chat / Agent / Agent MAX)
- Grade de 9 features
- "Como funciona" (4 passos com timeline)
- Stats animados (contadores)
- Pricing (Free/Pro/Business/Enterprise)
- Social proof (depoimentos)
- FAQ (7 itens)
- Newsletter no footer
- Footer com 4 colunas de links

### 9.2 Workspace
- Sidebar fixa com todos os itens funcionais
- Chat com streaming token-a-token
- Seletor de modelo (5+ provedores)
- Painel "Computador" com 4 abas
- Command Palette (Cmd+K)
- Biblioteca (histórico + replay)
- Plugins (marketplace)
- Tarefas Agendadas (CRUD)
- Conta (créditos, transações, preferências)
- Status do sistema
- Documentação
- Login/Registro real (email/senha)

### 9.3 Funcionalidades do Chat
- Modo Chat: resposta direta do LLM (sem sandbox)
- Modo Agent: orquestrador + 1 sub-agente por vez
- Modo Agent MAX: múltiplos sub-agentes em paralelo
- Upload de arquivos funcional
- Histórico de mensagens persistente (sobrevive reload)
- Message actions (copiar, regenerar, thumbs up/down)
- Markdown com syntax highlighting
- Atalhos de teclado (Cmd+K, Cmd+N, Cmd+B, etc.)

---

## PARTE 10 — DEPLOY E INFRAESTRUTURA

### 10.1 Frontend (Z.ai ou Vercel)
- Next.js 16 com App Router
- `next build` + `next start -p 3000 -H 0.0.0.0`
- Variáveis: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WS_URL`

### 10.2 Sandbox Ubuntu (AWS EC2)
- Ubuntu 22.04 LTS
- Docker + Chromium + Node.js 20 + Python 3
- PM2 pra manter rodando 24/7
- Porta 3005 exposta (Security Group ou ngrok)
- Script de instalação automática

### 10.3 WebSocket Gateway (mini-service)
- Socket.IO na porta 3003
- Canal `task:{taskId}` pra streaming de eventos
- POST /emit pra orquestrador publicar eventos

### 10.4 Segurança
- Senhas hasheadas com scrypt
- Sessão cookie httpOnly + secure
- Nenhuma chave no código-fonte (só .env)
- CORS liberado só pro domínio do frontend
- Rate limiting por usuário
- Sandbox isolado por sessão

---

## PARTE 11 — VARIÁVEIS DE AMBIENTE

```bash
# OpenRouter (5 modelos)
OPENROUTER_CLAUDE_API_KEY=sk-or-v1-...
OPENROUTER_CHATGPT_API_KEY=sk-or-v1-...
OPENROUTER_KIMI_API_KEY=sk-or-v1-...
OPENROUTER_GROK_API_KEY=sk-or-v1-...
OPENROUTER_GEMINI_API_KEY=sk-or-v1-...

# Navegador real
BROWSERLESS_API_KEY=...
BROWSERLESS_REGION=production-sfo

# Sandbox Ubuntu (EC2)
SANDBOX_URL=https://xxx.ngrok-free.dev

# Banco
DATABASE_URL=file:./prod.db

# App
NEXT_PUBLIC_APP_URL=https://omnininja.space-z.ai
AUTH_SECRET=...
```

---

## PARTE 12 — CHECKLIST DE ACEITE

- [ ] Chat/Agent/Agent MAX respondem com o modelo escolhido
- [ ] Seletor mostra só modelos com chave configurada
- [ ] Browserless executa navigate/click/type/screenshot de verdade
- [ ] Painel Computador alterna minimizado/tela cheia sem sair do chat
- [ ] Painel mostra fallback (não tela branca) se backend offline
- [ ] Nenhuma chave de API aparece no HTML/JS/Network
- [ ] Mobile e desktop sem overflow horizontal
- [ ] Landing, preços, docs, blog, status, termos existem e estão linkados
- [ ] Tela "Status das Integrações" reflete a realidade
- [ ] Computador só abre quando ferramenta real é usada
- [ ] Terminal mostra comandos reais do Ubuntu
- [ ] Event Stream registra TODAS as ações
- [ ] Replay de sessões funciona com scrubber
- [ ] Sistema de créditos debita corretamente
- [ ] Login/Registro funcional (email/senha)
- [ ] Upload de arquivos funciona
- [ ] Histórico de mensagens persiste ao recarregar
- [ ] Thought Injection ativo (planejador raciocina antes de cada ação)
- [ ] Todo.md atualizado a cada passo
- [ ] Mouse virtual humanizado (curva Bézier)
- [ ] Screenshot com bounding boxes nos elementos clicáveis

---

## PARTE 13 — ROADMAp DE IMPLEMENTAÇÃO

### FASE 1 — Fundação ✅
- Next.js 16 + TypeScript + Tailwind + shadcn/ui
- Prisma schema (User, Task, Message, EventRow, Artifact, etc.)
- Auth real (email/senha com scrypt)
- Landing page completa
- Dark mode nativo (Ninja AI style)

### FASE 2 — Chat + Multi-Modelo ✅
- /api/chat com streaming SSE
- OpenRouter (Claude, GPT, Kimi, Grok, Gemini)
- Seletor de modelo na UI
- Fallback automático
- Chat persistente (sobrevive reload)

### FASE 3 — Sandbox Ubuntu ✅
- mini-services/sandbox-server (roda na EC2)
- Shell real (bash/python/node)
- Arquivos (read/write/list/str-replace)
- Browser Chromium via Playwright
- Isolamento por sessão (/tmp/omninja-workspaces/{taskId})

### FASE 4 — Agent Loop ✅
- /api/agent/run (SSE que roda o agente)
- Thought Injection (planejador raciocina antes de cada ação)
- Todo.md (checklist atualizado)
- 29 ferramentas (navegador, shell, arquivos, busca, deploy)
- System prompt fiel ao Manus

### FASE 5 — Painel "Computador" ✅
- 4 abas (Código, Pré-visualizar, Navegador, Terminal)
- Screenshots REAIS do Browserless
- Bounding boxes nos elementos clicáveis
- Mouse virtual humanizado (curva Bézier)
- Replay com scrubber
- Progress widget flutuante

### FASE 6 — Polish ✅
- Command Palette (Cmd+K)
- Biblioteca (histórico + replay)
- Plugins marketplace
- Tarefas Agendadas (CRUD)
- Atalhos de teclado
- Theme toggle (dark/light)
- Message actions (copy/regenerate/feedback)
- Upload de arquivos funcional

### FASE 7 — Próximos passos
- Wide Research (100+ subagentes em paralelo)
- Connectors (Gmail, Slack, Notion, WhatsApp)
- Stripe billing real
- OAuth (Google/GitHub)
- Docker container efêmero por tarefa (em vez de /tmp)
- Mobile App Builder
- Manus Pages (MDX → página publicável)

---

## RESUMO EXECUTIVO

O OmniNinja é uma réplica funcional do Manus AI, construída com:
- **Frontend:** Next.js 16 no Z.ai (https://omnininja.space-z.ai)
- **Sandbox:** Ubuntu 22.04 real na AWS EC2 (porta 3005 via ngrok)
- **Modelos:** 5 via OpenRouter (Claude, GPT, Kimi, Grok, Gemini) + GLM nativo
- **Navegador:** Chromium real via Browserless/Playwright com mouse Bézier
- **Agent Loop:** 6 passos fiel ao Manus, com Thought Injection e Todo.md
- **29 Ferramentas:** navegador, shell, arquivos, busca, deploy, comunicação
- **Design:** Dark mode Ninja AI, Source Serif + Inter + JetBrains Mono
- **Auth:** Email/senha com scrypt, sessão cookie httpOnly
- **Billing:** Sistema de créditos (Free/Pro/Business/Enterprise)

**Status atual:** 90% completo. Sandbox Ubuntu rodando na EC2, chat com Claude funcionando, agent loop com thought injection ativo. Faltam: conectar sandbox ao site (ngrok URL), completar 16 ferramentas restantes, Docker isolado por sessão.

---

*Documento criado em dezembro/2026. Baseado em pesquisa profunda do Manus AI (dossiê técnico de 391 linhas), Ninja AI, prompt vazado do Manus, documentação da AWS, e benchmark GAIA. Este é o documento raiz ("fonte da verdade") para construir a empresa OmniNinja.*
