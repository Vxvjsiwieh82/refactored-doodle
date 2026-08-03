# OMMININJA — DOCUMENTO MESTRE DE CONSTRUÇÃO v10.0
## A Plataforma Suprema de Agentes de IA Autônomos
## "Superior ao Manus AI. Soberana. Completa."

> **Este documento contém TODAS as especificações para construir a plataforma OmmiNinja do zero.**
> Cada linha foi pensada. Cada detalhe foi estudado. Cada componente está especificado.
> Uma IA construtora (como Manus) pode usar este documento para construir tudo.

---

## DADOS DA INFRAESTRUTURA OPENCLAW AWS

```
IP Público:     34.235.148.230
DNS Público:    ec2-34-235-148-230.compute-1.amazonaws.com
Tipo:           t3.xlarge (4 vCPUs, 16GB RAM)
Região:         us-east-1 (N. Virginia)
AMI:            openclaw-ubuntu-24.04-amd64-20260715042632
Usuário SSH:    ubuntu
Chave SSH:      omnininja.pem
Conta AWS:      038635648967
VPC:            vpc-0244b542b11b96e82
Subnet:         subnet-0782dc28484067f2f
```

### OpenClaw pré-instala:
- Ubuntu 24.04 LTS
- Docker + Docker Compose
- Chromium (navegador real)
- Python 3 + pip
- Node.js 20 + npm
- Playwright
- Git, curl, wget, jq, bc
- Terminal bash com sudo

### Acesso SSH:
```bash
ssh -i omnininja.pem ubuntu@34.235.148.230
```

---

## CHAVES DE API

```bash
# OpenRouter (5 modelos de IA)
OPENROUTER_CLAUDE_API_KEY=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
OPENROUTER_CHATGPT_API_KEY=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
OPENROUTER_KIMI_API_KEY=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
OPENROUTER_GROK_API_KEY=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
OPENROUTER_GEMINI_API_KEY=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

# Navegador real
BROWSERLESS_API_KEY=2UxDzc484bvSwHY594f6a03db1a56901ca6d90bd701a2a950
BROWSERLESS_REGION=production-sfo

# Sandbox OpenClaw
SANDBOX_URL=http://34.235.148.230:3005

# App
AUTH_SECRET=omnininja-secret-key-2026
DATABASE_URL=file:./prod.db
NEXT_PUBLIC_APP_URL=https://omnininja.space-z.ai
```

---

## SEÇÃO 1 — VISÃO GERAL

OmmiNinja é uma plataforma de agente de IA autônomo superior ao Manus AI. Combina:
- Sandbox Ubuntu real (OpenClaw AWS) com Chromium, terminal, filesystem
- 27 ferramentas (browser, shell, files, search, deploy, communication)
- Multi-modelo (Claude, GPT, GLM, Gemini, Kimi, Grok via OpenRouter)
- Painel "Computer do OmmiNinja" com Monaco Editor, terminal real, navegador com screenshots
- Agent loop fiel ao Manus (6 passos: Analyze → Select → Execute → Observe → Iterate → Deliver)
- Thought injection (planejador raciocina antes de cada tool call)
- Todo.md dinâmico
- Self-correction (detecta erros, tenta alternativa)
- Sistema de créditos (Free/Pro/Business/Enterprise)
- Auth real (email/senha + OAuth)
- Upload de arquivos, histórico, automações, projetos, skills marketplace

---

## SEÇÃO 2 — IDENTIDADE VISUAL

### Nome: OmmiNinja
### Slogan: "Pense grande. O OmmiNinja executa."
### Cores: Azul Elétrico (#0066FF) + Deep Space (#050A15) + Cyan Glow (#00D1FF)

### Paleta Completa:
```css
--background: #050A15;
--card: #0D1220;
--popover: #121A2B;
--primary: #0066FF;
--brand-glow: #00D1FF;
--text-primary: #f2f2f3;
--text-secondary: #94A3B8;
--text-muted: #64748B;
--border: rgba(255,255,255,0.06);
--success: #10B981;
--warning: #F59E0B;
--danger: #ef4444;
```

### Tipografia:
- Headlines: Inter (700-800)
- UI: Inter (400-600)
- Código: JetBrains Mono
- Display: Inter Black (900)

### Animações:
- ninja-glow (2s, pulso de brilho)
- orbital (3s, thinking indicator)
- glitch (0.3s, transições)
- cyan-pulse (2s, processamento)
- glass-premium (backdrop-blur 24px)
- text-electric (gradiente azul→cyan)
- msg-reveal (blur + fade + scale, 0.35s)
- streaming-caret (blink 0.9s)
- skeleton-premium (shimmer 1.4s)
- aurora-bg (blobs animados 18-22s)

---

## SEÇÃO 3 — DESIGN SYSTEM (TAILWIND + CSS)

### globals.css:
```css
:root {
  --radius: 0.75rem;
  --background: #050A15;
  --foreground: #f2f2f3;
  --card: #0D1220;
  --primary: #0066FF;
  --primary-foreground: #ffffff;
  --brand: #0066FF;
  --brand-glow: #00D1FF;
  --border: rgba(255,255,255,0.06);
  --muted-foreground: #94A3B8;
  --sidebar: #050A15;
  --sidebar-primary: #0066FF;
}

@keyframes ninja-glow {
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.8; filter: brightness(1.5); }
}

@keyframes orbital {
  from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
}

@keyframes cyan-pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(0,209,255,0.3); }
  50% { box-shadow: 0 0 25px rgba(0,209,255,0.6), 0 0 50px rgba(0,102,255,0.3); }
}

.glass-premium {
  background: rgba(13,18,32,0.55);
  backdrop-filter: blur(24px) saturate(180%);
  border: 0.5px solid rgba(255,255,255,0.08);
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
}

.text-electric {
  background: linear-gradient(135deg, #0066FF, #00D1FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-deep-space {
  background: radial-gradient(ellipse at top, #0D1220 0%, #050A15 60%, #020408 100%);
}
```

---

## SEÇÃO 4 — ARQUITETURA TÉCNICA

### Stack:
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4 + shadcn/ui (New York)
- Prisma ORM + SQLite (produção: PostgreSQL)
- Socket.IO (WebSocket gateway, porta 3003)
- SSE para streaming de chat e eventos
- Zustand (estado cliente) + TanStack Query (estado servidor)
- Framer Motion (animações)
- Monaco Editor (@monaco-editor/react)
- Playwright-core (Browserless)

### Estrutura de Diretórios:
```
src/
  app/
    page.tsx                    # Entry (landing ou workspace)
    layout.tsx                  # Root layout
    globals.css                 # Design system
    api/
      auth/{register,login,logout,me}/route.ts
      chat/route.ts             # SSE streaming chat
      agent/run/route.ts        # SSE streaming agente
      classify/route.ts         # Chat vs Task
      credits/route.ts
      integrations/route.ts
      messages/route.ts
      scheduled/route.ts
      tasks/{route.ts,history/route.ts}
      upload/route.ts
  components/
    omninja/
      landing.tsx               # Landing page completa
      workspace.tsx             # Workspace (sidebar + chat + computer)
      computer-panel-v2.tsx     # Painel Computer (Monaco + Terminal + Browser)
      messages.tsx              # Chat messages com streaming
      chat-input.tsx            # Input com modos, anexos, modelo
      model-selector.tsx        # Seletor de modelo
      brand.tsx                 # Logo OmmiNinja
      sheets.tsx                # Admin, Docs, Account, Status, Login, Scheduled, Library, Plugins
      command-palette.tsx       # Cmd+K palette
  lib/
    store.ts                    # Zustand store
    agent-loop.ts               # Agent loop (6 passos Manus)
    llm-client.ts               # Multi-model router (OpenRouter)
    browser-agent.ts            # Playwright + Browserless
    shell-agent.ts              # Shell local
    sandbox-client.ts           # Cliente sandbox EC2
    auth.ts                     # Auth (scrypt, sessions)
    credits.ts                  # Sistema de créditos
    orchestrator.ts             # Event types + classify
    providers.ts                # Config provedores
    integrations.ts             # Status integrações
    use-agent-runner.ts         # Hook que roda o agente
    use-event-stream.ts         # WebSocket hook
    use-keyboard-shortcuts.ts   # Atalhos
    use-chat-history.ts         # Persistência chat
  hooks/
    use-mobile.ts
    use-toast.ts
mini-services/
  event-stream/                 # Socket.IO gateway (porta 3003)
  sandbox-server/               # Sandbox Ubuntu API (porta 3005)
prisma/
  schema.prisma                 # Schema completo
scripts/
  install-ec2.sh                # Instalação EC2
  create-admin.ts               # Criar admin
```

---

## SEÇÃO 5 — SANDBOX UBUNTU (OPENCLAW)

### Dockerfile base (Ubuntu 22.04, igual Manus):
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    nodejs npm git curl wget unzip jq bc \
    build-essential chromium-browser \
    sqlite3 ca-certificates \
    fonts-liberation xdg-utils \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 \
    libgbm1 libpango-1.0-0 libcairo2 libasound2
RUN npm install -g pnpm typescript tsx serve
WORKDIR /workspace
RUN useradd -m -s /bin/bash sandboxuser && chown -R sandboxuser /workspace
USER sandboxuser
CMD ["/bin/bash"]
```

### Sandbox Server (porta 3005):
```typescript
// Endpoints:
// GET  /health          → status do sandbox
// POST /shell            → executar comando bash
// POST /file/write       → criar/editar arquivo
// POST /file/read        → ler arquivo
// POST /file/list        → listar diretório
// POST /file/str-replace → editar trecho
// POST /browser          → ação do navegador (navigate, click, type, scroll, screenshot)
// POST /cleanup          → limpar workspace
```

### Isolamento por sessão:
- Cada tarefa: /tmp/omninja-workspaces/{taskId}
- Inicializado com package.json vazio
- Arquivos persistem durante a sessão
- Limpeza automática após conclusão

---

## SEÇÃO 6 — AGENT LOOP (6 PASSOS)

```typescript
// Fiel ao prompt vazado do Manus
const SYSTEM_PROMPT = `Você é o OmmiNinja, um agente de IA criado pela equipe OmmiNinja.

<agent_loop>
1. Analyze Events: Entender necessidades via event stream
2. Select Tools: Escolher próxima ferramenta
3. Wait for Execution: Sandbox executa, resultado volta ao event stream
4. Iterate: UMA chamada por iteração, repetir até concluir
5. Submit Results: Entregar via message tools com anexos
6. Enter Standby: Idle quando concluído
</agent_loop>

<todo_rules>
- Criar todo.md como checklist
- Atualizar após cada item concluído
</todo_rules>

<message_rules>
- Primeira resposta: breve, confirmando recebimento
- notify (não bloqueia) vs ask (bloqueia)
</message_rules>

<browser_rules>
- Elementos visíveis: index[:]<tag>text</tag>
- Screenshot após cada ação
- Conteúdo extraído em Markdown
</browser_rules>

<shell_rules>
- Usar -y/-f para confirmações
- Encadear com &&
- Python para cálculos
</shell_rules>

<error_handling>
- Verificar nomes/args
- Tentar corrigir
- Tentar alternativa
- Reportar ao usuário como último recurso
</error_handling>

<sandbox_environment>
Ubuntu 22.04, usuário ubuntu, sudo
Python 3.10.12, Node.js 20.18.0, bc
</sandbox_environment>

<tool_use_rules>
- SEMPRE responder com chamada de ferramenta
- Nunca fabricar ferramentas
- Nunca mencionar nomes técnicos ao usuário
</tool_use_rules>`;
```

### Thought Injection:
```typescript
async function thoughtInjection(model, goal, history, todoItems) {
  // Mini-agente planejador raciocina ANTES de cada tool call
  const prompt = `Analise: ${goal}\nHistórico: ${history}\nTodo: ${todoItems}\nQual a próxima ação?`;
  const result = await callLLM(model, [
    { role: 'system', content: 'Planejador conciso. 2-3 frases.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.3 });
  return result.content;
}
```

---

## SEÇÃO 7 — AS 27 FERRAMENTAS

### Comunicação (2):
```json
{"tool":"message_notify_user","args":{"text":"progresso"}}
{"tool":"message_ask_user","args":{"text":"confirma?"}}
```

### Arquivos (5):
```json
{"tool":"file_read","args":{"path":"arquivo.txt"}}
{"tool":"file_write","args":{"path":"arquivo.txt","content":"conteúdo"}}
{"tool":"file_str_replace","args":{"path":"f.txt","oldStr":"a","newStr":"b"}}
{"tool":"file_find_in_content","args":{"path":"f.txt","regex":"padrão"}}
{"tool":"file_find_by_name","args":{"path":".","glob":"*.py"}}
```

### Shell (5):
```json
{"tool":"shell_exec","args":{"cmd":"ls -la"}}
{"tool":"shell_view","args":{"id":"session1"}}
{"tool":"shell_wait","args":{"id":"session1","seconds":10}}
{"tool":"shell_write_to_process","args":{"id":"session1","input":"yes"}}
{"tool":"shell_kill_process","args":{"id":"session1"}}
```

### Navegador (12):
```json
{"tool":"browser_view","args":{}}
{"tool":"browser_navigate","args":{"url":"https://..."}}
{"tool":"browser_restart","args":{"url":"https://..."}}
{"tool":"browser_click","args":{"index":3}}
{"tool":"browser_input","args":{"index":1,"text":"busca"}}
{"tool":"browser_move_mouse","args":{"coordinate_x":100,"coordinate_y":200}}
{"tool":"browser_press_key","args":{"key":"Enter"}}
{"tool":"browser_select_option","args":{"index":1,"option":"value"}}
{"tool":"browser_scroll_up","args":{"to_top":false}}
{"tool":"browser_scroll_down","args":{"to_bottom":false}}
{"tool":"browser_console_exec","args":{"javascript":"document.title"}}
{"tool":"browser_console_view","args":{"max_lines":50}}
```

### Busca (1):
```json
{"tool":"info_search_web","args":{"query":"termo","date_range":"past_week"}}
```

### Deploy (2):
```json
{"tool":"deploy_expose_port","args":{"port":3000}}
{"tool":"deploy_apply_deployment","args":{"type":"static","local_dir":"./site"}}
```

### Outras (2):
```json
{"tool":"make_manus_page","args":{"mdx_file_path":"page.mdx"}}
{"tool":"idle","args":{}}
```

---

## SEÇÃO 8 — MULTI-MODEL ROUTER

```typescript
const MODELS = {
  grok:    { model: 'x-ai/grok-4.5',         label: 'Grok 4.5' },
  kimi:    { model: 'moonshotai/kimi-k3',    label: 'Kimi K3' },
  claude:  { model: 'anthropic/claude-sonnet-5', label: 'Claude' },
  chatgpt: { model: 'openai/gpt-5.6-sol',    label: 'ChatGPT' },
  gemini:  { model: 'google/gemini-3.6-flash', label: 'Gemini' },
  glm:     { model: 'glm-5.2',               label: 'GLM (nativo)' },
};

// Fallback: Grok → Kimi → GLM
// Timeout: 60s com AbortController
// Retry: 2 tentativas com backoff exponencial
// Rate limit: lê Retry-After header
```

---

## SEÇÃO 9 — BROWSER AUTOMATION

### 3 Inputs Multimodais (igual Manus):
1. Texto da viewport (Markdown, 5000 chars)
2. Screenshot normal (base64 PNG)
3. Screenshot com bounding boxes (caixas vermelhas numeradas nos elementos clicáveis)

### Mouse Bézier Humanizado:
```typescript
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

### Regras:
- Screenshot antes E depois de cada ação
- Aguardar networkidle (8s timeout)
- Máximo 50 ações por navegação
- Nunca contornar CAPTCHA
- Nunca preencher pagamento sem aprovação

---

## SEÇÃO 10 — PAINEL "COMPUTER DO OMNININJA"

### Header:
- Título: "Computer do OmmiNinja"
- Status em tempo real: "OmmiNinja está usando terminal" / "navegando" / "editando arquivo.txt"
- Bolinha pulsante (azul = running, verde = completed, amarelo = warning)

### 4 Abas:
1. **Editor** — Monaco Editor (VS Code real) com syntax highlight, file sidebar, todo.md
2. **Terminal** — Saída real do Ubuntu (verde cmd, cinza out, vermelho err, cursor piscando)
3. **Navegador** — Screenshot real do Browserless com URL bar, Live badge, histórico de ações
4. **Preview** — Resultado final (artefatos, resumo)

### Auto-detect: Troca de aba automaticamente baseado no último evento

### Footer: Timeline visual (barras coloridas: azul=browser, verde=terminal, roxo=arquivo)

---

## SEÇÃO 11 — CHAT INTERFACE

### Features:
- Streaming token-a-token via SSE
- Markdown completo (headings, listas, bold, código)
- Syntax highlighting (Prism)
- Botão copiar em blocos de código
- Message actions (copiar, regenerar, thumbs up/down)
- Thinking dots (3 pontos azul pulsante)
- Streaming caret (▍ piscando)
- Modos: Chat (resposta direta) / Agent (executa tarefas) / Agent MAX (paralelo)
- Seletor de modelo (6 provedores)
- Upload de arquivos (drag & drop)
- Histórico persistente (sobrevive reload)
- Atalhos: Cmd+K (palette), Cmd+N (nova), Cmd+B (sidebar), 1/2/3 (modos)

---

## SEÇÃO 12 — SISTEMA DE CRÉDITOS

| Plano | Preço | Créditos | Tarefas simultâneas |
|---|---|---|---|
| Free | US$ 0 | 300/dia + 1.000 bônus | 1 |
| Pro | US$ 20/mês | 4.000/mês | 4 |
| Business | US$ 50/mês | 8.000/mês | 20 |
| Enterprise | US$ 200/mês | 40.000/mês | Ilimitado |

### Custos por ação:
- chat_message: 1 crédito
- agent_step: 5 créditos
- browser_action: 3 créditos
- terminal_command: 2 créditos
- file_write: 1 crédito
- search_query: 4 créditos
- deep_research_step: 12 créditos

### Admin: créditos infinitos (role=admin ignora checagem)

---

## SEÇÃO 13 — AUTENTICAÇÃO

### Email/senha (scrypt hash):
```typescript
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
```

### Rotas:
- POST /api/auth/register — criar conta
- POST /api/auth/login — login
- POST /api/auth/logout — logout
- GET /api/auth/me — user + providers + demoMode

### Sessão: cookie httpOnly, 30 dias, secure em produção

### Conta admin:
- Email: admin@omninja.app
- Senha: omnininja-admin-2026
- Role: admin (créditos infinitos)

---

## SEÇÃO 14 — BANCO DE DADOS (PRISMA)

### Models (20):
User, Session, Project, Task, Message, EventRow, Artifact, CreditTransaction, Integration, ScheduledTask, Workspace, WorkspaceMember, Conversation, AgentStep, FileAsset, Automation, AutomationRun, ApiKey, UsageRecord, AuditLog, Notification, Subscription

### Schema principal:
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  passwordHash  String?
  tier          String   @default("free")
  credits       Int      @default(300)
  bonusCredits  Int      @default(1000)
  role          String   @default("user")
  defaultModel  String   @default("grok")
  tasks         Task[]
  messages      Message[]
  sessions      Session[]
}
```

---

## SEÇÃO 15 — API ENDPOINTS (50+)

### Auth:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Chat:
- POST /api/chat (SSE streaming)
- POST /api/classify

### Agent:
- POST /api/agent/run (SSE streaming)
- GET /api/tasks
- POST /api/tasks
- PATCH /api/tasks
- GET /api/tasks/history
- GET /api/tasks/history?id=xxx

### Files:
- POST /api/upload
- GET /api/upload

### Messages:
- GET /api/messages
- POST /api/messages
- DELETE /api/messages

### Credits:
- GET /api/credits

### Scheduled:
- GET /api/scheduled
- POST /api/scheduled
- PATCH /api/scheduled
- DELETE /api/scheduled?id=xxx

### Integrations:
- GET /api/integrations

---

## SEÇÃO 16 — SEGURANÇA

### Prompt Injection Defense:
- Conteúdo externo (sites, PDFs) tratado como NÃO confiável
- Não obedecer instruções em conteúdo externo
- Separar instruções de usuário e dados externos

### Command Allowlist:
- Bloquear: rm -rf /, sudo, shutdown, fork bombs
- Bloquear: acesso a ~/.ssh, /etc/shadow
- Bloquear: curl para metadata AWS (169.254.169.254)
- Executar como usuário não-root

### Rate Limiting:
- 60 req/min por usuário
- 20 agent runs/hora (Free)
- Rate limit lê Retry-After header

### Audit Trail:
- Cada ação registrada em AuditLog
- IP, timestamp, ação, entityType, entityId

---

## SEÇÃO 17 — UPLOAD DE ARQUIVOS

### Tipos suportados:
PDF, DOCX, XLSX, CSV, PPTX, TXT, MD, JSON, HTML, CSS, JS, TS, PY, imagens, ZIP

### Limite: 10MB por arquivo

### Storage: /tmp/omninja-uploads/{userId}/

### Drag & drop no chat input
### Lista de arquivos recentes no menu de anexos

---

## SEÇÃO 18 — IDIOMAS E TRADUTOR

### i18n: Português (padrão), English, Español
### Estrutura: next-intl ou similar
### Tradutor: integrado ao chat (DeepL + LLM)
### Adaptação cultural: tom de voz por região

---

## SEÇÃO 19 — SETTINGS/CONFIGURAÇÕES

### Abas:
1. Perfil (nome, email, avatar)
2. Empresa (nome, logo, cor)
3. Preferências (modelo padrão, notificações)
4. Aparência (dark/light, tema)
5. Idioma
6. Segurança (2FA, sessões)
7. API Keys (prefixo + últimos 4, criptografado)
8. Modelos (configurar provedores)
9. Notificações (email, push)
10. Dados e privacidade (exportar, deletar)

---

## SEÇÃO 20 — SKILLS/MARKETPLACE

### Skills disponíveis:
- Navegador Chromium (ativo)
- Terminal Bash (ativo)
- Editor Monaco (ativo)
- Exa AI — Busca web (beta)
- Google Drive (em breve)
- Figma (em breve)
- GitHub (em breve)
- Slack (em breve)
- Notion (em breve)
- Gmail (em breve)
- WhatsApp Business (em breve)
- Telegram (em breve)

### Cada skill: card, status, toggle on/off, permissões

---

## SEÇÃO 21 — AUTOMAÇÕES

### Gatilhos:
- Horário agendado (cron)
- Todo dia/semana/mês
- Novo arquivo
- Webhook
- Manual

### Ações:
- Rodar agente
- Pesquisar web
- Gerar relatório
- Processar planilha
- Criar arquivo
- Notificar usuário

### Cada automação: nome, trigger, actions, status, logs, próxima execução

---

## SEÇÃO 22 — PROJETOS

### CRUD completo:
- Nome, ícone, descrição, objetivo
- Membros, conversas, tarefas, arquivos
- Entregáveis, links de deploy
- Templates: site, loja, CRM, dashboard, blog

---

## SEÇÃO 23 — LANDING PAGE

### Seções:
1. Navbar (logo, produto, preços, entrar, CTA)
2. Hero (headline, subheadline, CTAs, demo visual)
3. Categorias de uso (vendas, marketing, dev, etc)
4. "Uma IA, vários modos" (Chat, Agent, Pesquisa, Builder, Dados, Automação)
5. "Como funciona" (4 passos: descreve → planeja → executa → entrega)
6. Exemplos reais
7. Segurança
8. Preços (4 tiers)
9. FAQ
10. Footer (newsletter, links, status)

---

## SEÇÃO 24 — ADMIN PANEL

### Funções:
- Gerenciar usuários
- Gerenciar planos e créditos
- Status das integrações (8 provedores)
- Métricas (tarefas/dia, créditos, erros)
- Logs de auditoria
- Feature flags
- Workers status

---

## SEÇÃO 25 — DEPLOY

### Frontend (Z.ai ou Vercel):
```bash
npm run build
npm run start  # next start -p 3000 -H 0.0.0.0
```

### Sandbox (AWS EC2 OpenClaw):
```bash
# SSH na EC2
ssh -i omnininja.pem ubuntu@34.235.148.230

# Instalar
git clone https://github.com/Vxvjsiwieh82/refactored-doodle.git ~/omninja
cd ~/omninja && npm install
cd mini-services/sandbox-server && npm install

# Iniciar com PM2
pm2 start "npx tsx mini-services/sandbox-server/index.ts" --name omninja-sandbox
pm2 startup && pm2 save
```

### WebSocket (mini-service):
```bash
cd mini-services/event-stream
bun install
bun run dev  # porta 3003
```

### Nginx + SSL:
```nginx
server {
    listen 80;
    server_name omninja.duckdns.org;
    location / { proxy_pass http://127.0.0.1:3000; }
    location /socket.io/ { proxy_pass http://127.0.0.1:3003; }
}
```

---

## SEÇÃO 26 — ROADMAP (8 MESES)

### Mês 1: Fundação
- Next.js 16 + TypeScript + Tailwind + shadcn/ui
- Prisma schema (20 models)
- Auth (email/senha, OAuth)
- Landing page
- Dark mode (Azul Elétrico)

### Mês 2: Chat + Multi-Modelo
- /api/chat com SSE streaming
- OpenRouter (6 modelos)
- Seletor de modelo
- Fallback automático
- Chat persistente

### Mês 3: Sandbox Ubuntu
- sandbox-server (porta 3005)
- Shell real (bash/python/node)
- Arquivos (read/write/list/edit)
- Browser Chromium via Playwright
- Isolamento por sessão

### Mês 4: Agent Loop
- /api/agent/run (SSE)
- Thought injection
- Todo.md dinâmico
- 27 ferramentas
- Self-correction
- System prompt fiel ao Manus

### Mês 5: Painel Computer
- Monaco Editor (VS Code real)
- Terminal com saída real
- Navegador com screenshots reais
- Bounding boxes nos elementos
- Mouse Bézier humanizado
- Replay com scrubber

### Mês 6: Polish
- Command Palette (Cmd+K)
- Biblioteca (histórico + replay)
- Plugins marketplace
- Tarefas Agendadas (CRUD)
- Atalhos de teclado
- Theme toggle
- Message actions
- Upload de arquivos

### Mês 7: Features Avançadas
- Wide Research (100+ paralelo)
- Connectors (Gmail, Slack, Notion)
- Stripe billing
- OAuth (Google/GitHub)
- Docker isolado por sessão
- API para desenvolvedores

### Mês 8: Lançamento
- SEO completo
- Acessibilidade (WCAG 2.2)
- Testes E2E (Playwright)
- Monitoramento (Sentry)
- Documentação
- Blog + Changelog
- Status page

---

## SEÇÃO 27 — CHECKLIST DE ACEITE (50 ITENS)

- [ ] Chat responde com modelo escolhido (Grok/Kimi/GLM)
- [ ] Seletor mostra só modelos com chave configurada
- [ ] Browserless executa navigate/click/type/screenshot
- [ ] Painel Computer alterna minimizado/tela cheia
- [ ] Painel mostra fallback se backend offline
- [ ] Nenhuma chave no HTML/JS/Network
- [ ] Mobile e desktop sem overflow
- [ ] Landing, preços, docs, status, termos linkados no footer
- [ ] Tela Integrações reflete realidade
- [ ] Computador só abre quando ferramenta é usada
- [ ] Terminal mostra comandos reais do Ubuntu
- [ ] Event Stream registra todas as ações
- [ ] Replay funciona com scrubber
- [ ] Créditos debitam corretamente
- [ ] Login/Registro funcional
- [ ] Upload funciona
- [ ] Histórico persiste ao recarregar
- [ ] Thought injection ativo
- [ ] Todo.md atualizado
- [ ] Mouse Bézier humanizado
- [ ] Screenshot com bounding boxes
- [ ] Self-correction em erros
- [ ] 30 iterações máximas
- [ ] System prompt fiel ao Manus
- [ ] Monaco Editor com syntax highlight
- [ ] Glassmorphism premium (backdrop-blur 24px)
- [ ] Animações: ninja-glow, orbital, cyan-pulse
- [ ] Command Palette (Cmd+K)
- [ ] Atalhos de teclado (1/2/3, Cmd+N, Cmd+B)
- [ ] Tarefas Agendadas (CRUD)
- [ ] Biblioteca (histórico + replay)
- [ ] Plugins marketplace
- [ ] Admin panel com métricas
- [ ] Auth com scrypt hash
- [ ] Admin tem créditos infinitos
- [ ] Rate limiting por usuário
- [ ] Sandbox isolado por sessão
- [ ] Docker disponível no OpenClaw
- [ ] PM2 mantém tudo rodando
- [ ] SSL/HTTPS configurado
- [ ] SEO (metadata, OG, sitemap)
- [ ] Acessibilidade (ARIA, teclado)
- [ ] i18n (PT, EN, ES)
- [ ] Theme toggle (dark/light)
- [ ] Message actions (copy/regenerate/feedback)
- [ ] Streaming caret (▍ piscando)
- [ ] Skeleton shimmer em loading
- [ ] Aurora background no hero
- [ ] Deep space gradient no fundo

---

## SEÇÃO 28 — INTEGRAÇÃO OPENCLAW

### Conexão SSH:
```bash
ssh -i omnininja.pem ubuntu@34.235.148.230
```

### API do Sandbox (porta 3005):
```
POST http://34.235.148.230:3005/shell     → { taskId, cmd } → { stdout, stderr, exitCode }
POST http://34.235.148.230:3005/file/write → { taskId, path, content } → { path, bytes }
POST http://34.235.148.230:3005/file/read  → { taskId, path } → { content }
POST http://34.235.148.230:3005/browser    → { action, args } → { screenshot, url, title }
GET  http://34.235.148.230:3005/health     → { ok, os, hasChromium }
```

### Configuração no .env:
```bash
SANDBOX_URL=http://34.235.148.230:3005
# ou se rodar local na mesma VM:
SANDBOX_URL=http://localhost:3005
```

### Security Group AWS:
- Porta 22 (SSH) — 0.0.0.0/0
- Porta 80 (HTTP) — 0.0.0.0/0
- Porta 443 (HTTPS) — 0.0.0.0/0
- Porta 3000 (Site) — 0.0.0.0/0
- Porta 3005 (Sandbox) — 0.0.0.0/0
- Porta 3003 (WebSocket) — 0.0.0.0/0

---

## RESUMO EXECUTIVO

OmmiNinja é uma plataforma de agente de IA autônomo que combina:
- **Site** (Next.js 16) com chat, agent, landing, admin
- **Sandbox Ubuntu** (OpenClaw AWS EC2 t3.xlarge) com Chromium, terminal, filesystem
- **6 modelos de IA** (Grok, Kimi, Claude, GPT, Gemini, GLM via OpenRouter)
- **27 ferramentas** (browser, shell, files, search, deploy, communication)
- **Agent loop** fiel ao Manus (6 passos + thought injection + todo.md + self-correction)
- **Painel Computer** com Monaco Editor, terminal real, navegador com screenshots
- **Design Azul Elétrico** (#0066FF + #050A15 + #00D1FF) com glassmorphism premium
- **Auth real** (email/senha scrypt + OAuth)
- **Sistema de créditos** (Free/Pro/Business/Enterprise)
- **Upload, histórico, automações, projetos, skills, i18n**

**Status: 85% completo. Faltam: completar 7 ferramentas, Docker isolado, Stripe, OAuth, Wide Research.**

---

*Documento criado para a construção da plataforma OmmiNinja. Use este arquivo completo no Manus AI ou qualquer agente construtor para finalizar o projeto.*
