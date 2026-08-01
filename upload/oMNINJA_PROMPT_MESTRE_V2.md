# oMNINJA — PROMPT MESTRE DE CONSTRUÇÃO (V2)
## Sistema SaaS de Agentes de IA, Automação e Criação — Edição Reforçada com Pesquisa de Mercado

> Esta é uma versão expandida do seu prompt original. Mantém a mesma espinha dorsal (você já tinha uma boa estrutura), mas adiciona: (1) uma seção de pesquisa real sobre como Manus, Kimi e Ninja AI funcionam por dentro, hoje; (2) arquitetura de sandbox atualizada para o padrão de segurança de 2026, que mudou bastante em relação a "só Docker"; (3) uma seção de segurança de segredos reforçada. Cole este documento inteiro como prompt inicial no Fable 5 (Vercel) e peça explicitamente para ele começar pela Fase 1 (Seção 22) — não pelo produto inteiro de uma vez.

---

## 0. LEIA ANTES DE COLAR ESTE PROMPT EM QUALQUER FERRAMENTA

**Isto não é parte do produto — é uma ação sua, agora, fora do prompt:**

1. Qualquer chave de API colada em texto puro numa conversa (com uma IA, num chat, num ticket de suporte) deve ser tratada como comprometida a partir daquele momento — não importa se o campo "parece privado".
2. Acesse o painel da Browserless, **revogue a chave antiga e gere uma nova**. A documentação oficial da Browserless recomenda rotacionar o token imediatamente sempre que houver suspeita de exposição, rotacionar periodicamente a cada 90 dias como boa prática, e nunca fazer commit do token no controle de versão.
3. A nova chave só deve existir como variável de ambiente no servidor (`BROWSERLESS_TOKEN`), idealmente num cofre de segredos (AWS Secrets Manager, Doppler, Vercel Env, HashiCorp Vault). Nunca no frontend, nunca em prints, nunca colada de novo em um chat.
4. Este prompt foi escrito inteiramente com placeholders. Em nenhum lugar abaixo há uma chave real — só `SEU_TOKEN_AQUI` e variações. Se a IA que for construir o produto pedir uma chave real durante o processo, ela deve pedir para você preenchê-la diretamente no painel de variáveis de ambiente do Vercel/AWS, nunca no chat de construção.

Trate isso como bloqueante. O resto do prompt assume que esse passo já foi feito.

---

## 1. O QUE A PESQUISA MOSTROU (E O QUE ISSO MUDA NO oMNINJA)

Antes de especificar o produto, aqui está o que pesquisa recente mostra sobre como os quatro sistemas que você citou realmente funcionam por baixo do capô — não a marca, o mecanismo.

**Manus (Monica / ex-Butterfly Effect, Singapura).** Não é um chatbot com plugins: é uma arquitetura multiagente com um orquestrador central que quebra o objetivo em subtarefas e delega para subagentes especializados (um agente de navegador, um agente de código, um agente de dados, um agente de arquivos) rodando em paralelo dentro de um "computador virtual" — uma sandbox na nuvem com acesso a filesystem Ubuntu completo e execução de shell isolada por tarefa. A tarefa continua rodando mesmo se você fechar o notebook, e um painel lateral ("Manus's Computer") mostra em tempo real o que está sendo feito — abrindo abas, preenchendo formulários, digitando comandos — em vez de esconder isso como caixa-preta; sessões também podem ser reproduzidas do início. A infraestrutura de sandbox por trás disso é fornecida pela E2B, especializada em dar "computadores virtuais" seguros a agentes de IA. Em 2026 a Manus expandiu para fora da nuvem: lançou o **My Computer** (16 mar 2026), que roda um CLI local no computador do usuário — leitura/edição de arquivos locais, controle de apps, mas sempre com aprovação explícita do usuário — e o **Cloud Computer** (30 abr 2026), uma VM persistente "sempre ligada" para automações contínuas, bots de Slack/Discord/Telegram e scrapers agendados. Cobrança é por créditos consumidos por tarefa, mas a variação de custo por tarefa é grande e pouco transparente — um dos pontos mais criticados do produto. Vale nota de contexto de mercado: a Meta anunciou a aquisição da Manus por mais de US$ 2 bilhões no fim de dezembro de 2025; em janeiro de 2026 o governo chinês abriu investigação sobre a transação por controle de exportação de tecnologia, e reportagens de junho de 2026 indicam que a Meta começou a desfazer o acordo sob nova diretriz regulatória chinesa que passou a valer em julho de 2026 — ou seja, mesmo um dos agentes mais bem-sucedidos do setor está em terreno regulatório instável. Isso é um sinal para o seu negócio: não aposte a estratégia inteira em replicar uma empresa específica, porque a paisagem competitiva muda rápido.

**Kimi / Moonshot AI (Pequim).** A família de modelos K2 é o que dá "inteligência de agente" ao produto: Kimi K2 (jul/2025) é um modelo MoE (Mixture-of-Experts) de 1 trilhão de parâmetros totais com ~32 bilhões ativos por token, lançado com pesos abertos sob licença Modified MIT. As versões seguintes (K2 Thinking, K2.5 em jan/2026, K2.6 em abr/2026, K2.7 Code em jun/2026, K3 em jul/2026) foram adicionando raciocínio intercalado com chamadas de ferramenta, multimodalidade nativa (imagem e depois vídeo) e principalmente o conceito de **Agent Swarm**: em vez de um agente executando passo a passo, o modelo coordena dezenas a centenas de subagentes especializados em paralelo (100 na K2.5, 300 na K2.6) para tarefas longas — Moonshot relata otimizações de horas de duração feitas durante a madrugada. O produto comercial, **Kimi Work**, empacota isso em uma suíte: Kimi Code (roda no terminal ou plugado em VS Code/Cursor/Zed), Sheets, Slides e Deep Research. Vale registrar: os números de "300 agentes em paralelo" vêm de demonstrações da própria Moonshot, sem replicação independente publicada — trate esse tipo de claim de fornecedor com o mesmo ceticismo que você gostaria que aplicassem ao oMNINJA.

**Ninja AI / NinjaTech AI (MyNinja.ai).** É o caso mais parecido com o que você já está construindo com o Nexus AI: em vez de treinar um único modelo proprietário do zero, a Ninja monta um **agregador multiagente e multimodelo** — mais de 20 modelos (Claude, GPT, Llama, Mistral e modelos próprios afinados) acessados por trás de uma única assinatura, historicamente via AWS Bedrock e chips Trainium/Inferentia da própria AWS. O roteamento delega cada subtarefa a um agente especializado (um agente de dados, um agente de redação, um agente de imagem) e junta os resultados. Um recurso de destaque é o **Agent Store**: uma biblioteca de agentes pré-configurados para funções específicas (gestor de redes sociais, analista de pesquisa) que o usuário pode customizar — vale como referência direta para a sua seção de Automações e para um futuro "marketplace de agentes" no oMNINJA. A capacidade "SuperNinja" gera aplicações full-stack completas (frontend + backend) a partir de um prompt em linguagem natural, no mesmo espírito do seu módulo de Builder.

**Claude / Anthropic — usado só como referência de padrão de arquitetura, não de produto a copiar.** O padrão de "loop de ferramentas controlado" (o modelo decide qual ferramenta chamar, recebe o resultado, decide o próximo passo, repete) com execução em ambiente controlado e portas de aprovação humana para ações sensíveis é um padrão amplamente usado no setor — incluindo nas próprias ferramentas de agente da Anthropic — e é exatamente o padrão que você já tinha especificado no documento original. Não é algo que pertence a uma empresa; é a forma como agentes de IA seguros são construídos em 2026.

**O padrão comum entre os quatro (e o que isso significa para você):** orquestrador/planejador → loop de uso de ferramentas → sandbox isolada (cada vez mais baseada em microVM, não em Docker puro — ver Seção 9) → painel de execução transparente em tempo real → aprovação humana para ações de risco → monetização por crédito/uso. Essa arquitetura, hoje, é infraestrutura comoditizada — empresas como E2B, Daytona, Northflank e Modal vendem exatamente essa camada como serviço. Isso significa que copiar a arquitetura de um concorrente não é mais vantagem competitiva por si só. A diferenciação real do oMNINJA vai estar em três lugares que nenhum dos quatro acima resolve bem para o Brasil: (1) pagamento via PIX e preço em reais sem fricção de cartão internacional, (2) idioma e suporte nativos em português, com casos de uso desenhados para o dia a dia de pequenas empresas brasileiras, e (3) transparência de custo por tarefa — que é justamente o ponto mais reclamado sobre a própria Manus.

---

## 2. VISÃO E MISSÃO

Você é um time de elite composto por: Product Designer SaaS, UX/UI Designer de produtos de IA, Principal Full-Stack Engineer, AI Agent Architect, DevOps/SRE AWS Engineer, Security Engineer, QA Engineer, e especialistas em sistemas multiagentes, browser automation e sandboxes Linux.

Sua missão é construir um produto real, funcional, escalável e com aparência premium chamado **oMNINJA** — "Sua equipe de IA que pesquisa, cria, programa e executa."

Regra inegociável: o oMNINJA **não copia** marca, logo, nome, textos, telas ou código proprietário de Manus, Kimi, Ninja AI, Claude ou qualquer outra empresa. Essas plataformas são usadas apenas como referência funcional de UX, arquitetura e capacidades (conforme Seção 1). Identidade visual, código, páginas, fluxos e componentes são 100% originais do oMNINJA.

Slogan: **"Pense grande. O oMNINJA executa."**
Alternativos: "Sua operação, potencializada por IA." · "De ideia a resultado, com inteligência autônoma." · "Agentes que pesquisam, criam e entregam." · "Você pede. O oMNINJA faz."

---

## 3. PRINCÍPIOS DE PRODUTO

O produto deve transmitir: confiança, tecnologia avançada, simplicidade para não-técnicos, poder operacional para avançados, clareza total sobre o que o agente está fazendo, segurança com aprovação humana em ações sensíveis, organização por projetos, e resultado real — não apenas texto.

A experiência combina: conversa natural, painel operacional de tarefas, progresso em tempo real, arquivos e artefatos entregues, terminal/navegador opcionais para avançados, interface moderna e fluida.

Responsiva, otimizada primeiro para desktop. Idioma padrão: Português do Brasil, com estrutura i18n para English e Español no futuro.

---

## 4. IDENTIDADE VISUAL E DESIGN SYSTEM

**Marca:** oMNINJA — "oM" pode ganhar destaque minimalista; "NINJA" transmite execução rápida, precisão e estratégia. Sem estereótipo infantil de ninja, sem personagem caricaturado, sem visual genérico de robô.

**Paleta (modo escuro como padrão, com modo claro também):**
- Fundo principal: quase-preto azulado, ~#070A12
- Superfícies: #0D1220 e #121A2B
- Bordas: branco em baixa opacidade
- Texto principal: #F8FAFC · Texto secundário: #94A3B8
- Primária: azul elétrico / cyan · Secundária: violeta profundo
- Destaques: gradiente azul → violeta → magenta suave
- Sucesso: verde esmeralda · Atenção: âmbar · Erro: vermelho coral

**Tipografia:** sans-serif moderna, títulos com peso alto e espaçamento refinado, código/terminal em fonte monoespaçada.

**Linguagem de animação — princípios, não assets copiados.** O objetivo é o mesmo "sentimento calmo e confiante" que produtos de IA bem desenhados hoje transmitem, sem copiar nenhum design system específico:
- Curvas de easing suaves, nunca lineares; amplitude de movimento baixa (elementos entram 8-16px, não voam pela tela)
- Animação é funcional, não decorativa: ela existe para mostrar causa e efeito (uma mensagem chegou, uma etapa terminou, um arquivo foi criado), nunca só para "parecer bonito"
- Streaming de texto token a token no chat, com cursor sutil
- Estados de "pensando" claramente diferentes de "executando" (ex.: pulso suave vs. barra de progresso com etapas nomeadas: "entendendo", "planejando", "pesquisando", "executando", "validando", "entregando")
- Timeline de execução do agente com nós conectados, preenchendo progressivamente
- Skeleton loaders em tabelas, cards e arquivos — nunca spinners genéricos isolados
- Confete discreto (não intrusivo) só em conclusões de tarefas importantes
- Toda animação respeita `prefers-reduced-motion` do sistema operacional, sem exceção
- Framer Motion (ou equivalente) no frontend; nenhuma animação pode comprometer performance ou acessibilidade

---

## 5. ARQUITETURA GERAL DO SISTEMA

```
[Usuário] → [Web App / Next.js — Vercel]
                     │
                     ▼
        [API / Orquestrador de Agentes]
                     │
              ┌──────┴──────┐
              ▼             ▼
     [Fila: Redis+BullMQ]  [Banco: PostgreSQL]
              │
              ▼
   [Pool de Workers — Ubuntu na AWS]
              │
     ┌────────┼────────────┐
     ▼        ▼             ▼
[Sandbox   [Browserless   [Storage
 por tarefa  — backend      S3/R2 —
 microVM]    apenas]        arquivos]
```

Camadas:
1. **Web app** — Next.js na Vercel, frontend + API segura.
2. **Banco** — PostgreSQL gerenciado (Supabase, Neon ou RDS).
3. **Fila** — Redis + BullMQ (ou serviço de filas gerenciado) para desacoplar requisição de execução.
4. **Worker de agentes** — roda na sua instância Ubuntu na AWS, dockerizado, autenticado internamente, sem portas públicas desnecessárias, comunicando-se só por fila/API privada.
5. **Sandbox por tarefa** — isolamento reforçado por tarefa (detalhado na Seção 9), usuário não-root, CPU/RAM/disco/timeout limitados, diretório temporário, rede restrita, sem acesso a credenciais do host nem ao socket do Docker, limpeza automática, logs sanitizados.
6. **Observabilidade** — logs estruturados, healthcheck, métricas, alertas, rastreamento por `taskId` e `userId`.

**Regra arquitetural central: sua VM Ubuntu na AWS é um worker privado, não um servidor que recebe comandos livres de usuários finais.** O usuário nunca fala diretamente com o shell da sua máquina — ele fala com o orquestrador, que traduz a intenção em chamadas de ferramenta validadas, que rodam dentro de uma sandbox isolada por tarefa dentro da sua VM. Esse é o mesmo modelo que Manus, Kimi Work e Ninja AI usam por trás da interface amigável.

---

## 6. ESTRUTURA DE PÁGINAS

### 6.1 Landing Page (`/`)
Navbar (Produto, Soluções, Recursos, Preços, Segurança, Entrar, "Começar agora") → Hero com título forte ("Uma IA que não apenas responde. Ela executa.") e demonstração visual interativa simulada (usuário pede um site → agente planeja → pesquisa → gera arquivos → publica preview → entrega link) → categorias de uso (Vendas, Operações, Marketing, Dados, Dev, Construção, Conteúdo, Pequenas Empresas) → seção "Uma IA, vários modos" (cards: Chat, Modo Agente, Pesquisa Profunda, Criador de Sites, Planilhas, Automação, Navegador, Ambiente Ubuntu Seguro) → "Como funciona" em 5 passos → exemplos reais → seção de segurança (execução isolada, aprovação humana, credenciais protegidas, logs, controle de acesso, exclusão de dados) → preços (Starter/Pro/Business/Enterprise, configuráveis no admin) → FAQ → footer completo.

### 6.2 Autenticação (`/login`, `/cadastro`, `/recuperar-senha`)
Email/senha, Google e GitHub OAuth preparados, confirmação de email, recuperação de senha, aceite de termos/privacidade, rate limiting contra abuso, erros claros.

### 6.3 Onboarding (`/onboarding`)
Nome/empresa → área de atuação → objetivo principal → nível técnico → uso pretendido → idioma → primeiro projeto sugerido. Fluxos personalizados por perfil (comercial, operações, marketing, dev, e-commerce, construção, criadores de conteúdo, consultoria, educação, pessoal).

### 6.4 Dashboard (`/app`)
Sidebar recolhível (Novo chat, Dashboard, Projetos, Agentes, Pesquisa, Criar site/app, Arquivos, Automações, Histórico, Equipe, Integrações, Faturamento, Configurações) + topbar com notificações, avatar, créditos, status de infraestrutura. Conteúdo: boas-vindas, botão grande "Nova tarefa", tarefas/projetos recentes, uso mensal, créditos, atalhos, atividade recente, status de agentes em execução, sugestões, templates.

### 6.5 Chat Inteligente (`/app/chat/[conversationId]`)
Lista de conversas com busca, fixar/renomear/excluir/agrupar por projeto. Upload por drag-and-drop e colar imagens (PDF, DOCX, XLSX, CSV, TXT, MD, JSON, imagens, ZIP). Input expansível com seletor de modo, seletor de modelo, seletor de profundidade de raciocínio, botão "Executar como agente", botão interromper geração. Mensagens com Markdown, código com syntax highlighting, tabelas, cards de arquivo, previews (imagem/planilha/PDF), botões copiar/editar/regenerar, feedback, exportar conversa. Streaming via SSE/WebSocket.

### 6.6 Modo Agente (`/app/agent/[taskId]`) — o núcleo do produto
Três colunas:
- **Esquerda:** objetivo, status, checklist do plano, tempo decorrido, consumo estimado, pausar/continuar/cancelar/pedir aprovação.
- **Centro:** feed de execução em linguagem natural (eventos técnicos expansíveis), com as etapas: entendendo objetivo → criando plano → pesquisando → navegando → escrevendo código → executando comandos → criando arquivos → validando → publicando → entregando.
- **Direita (abas):** Arquivos, Navegador, Terminal, Artefatos, Logs, Preview.

Mostrar sempre: o que o agente está fazendo, qual ferramenta usou, o resultado, erros, o próximo passo, e quando o usuário precisa aprovar algo. **Nunca mostrar o raciocínio interno bruto do modelo — só um resumo operacional seguro e útil**, exatamente como Manus faz no painel "Manus's Computer".

### 6.7 Projetos (`/app/projects`, `/app/projects/[projectId]`)
Nome, ícone, descrição, objetivo, membros, conversas/tarefas relacionadas, arquivos, entregáveis, links de deploy, variáveis do projeto, integrações permitidas, histórico, notas, templates. Criação a partir de templates (site institucional, loja online, CRM comercial, automação de relatórios, pesquisa de mercado, dashboard de vendas, conteúdo/marketing, sistema interno, planilha inteligente, ou em branco).

### 6.8 Criar Site/App (`/app/build`)
Fluxo: descrição do produto → escolha de tipo (institucional, landing, e-commerce, dashboard, SaaS, CRM, blog, portal de clientes, sistema interno) → estilo visual → IA gera especificação → preview → ajustes aprovados → geração de código → arquivos visíveis → publicação → URL + exportação para GitHub. Preview responsivo desktop/tablet/mobile, editor de conteúdo/propriedades, aba de código, aba de deploy, histórico de versões com restauração. Saída padrão: Next.js + TypeScript + Tailwind + shadcn/ui, com PostgreSQL/Supabase e Prisma quando necessário.

### 6.9 Pesquisa Profunda (`/app/research`)
Pergunta, objetivo, profundidade (rápida/padrão/profunda/extensa), região/idioma, data de corte, fontes preferidas/excluídas, formato de entrega (Markdown, PDF, DOCX, CSV/XLSX). Relatório com resumo executivo, achados, recomendações, limitações, metodologia, fontes com citações clicáveis. O agente separa explicitamente fatos confirmados, inferências, opiniões e informações não verificadas.

### 6.10 Arquivos (`/app/files`)
Upload, drag-and-drop, pastas, busca, tags, filtros, preview, download, renomear, mover, duplicar, excluir, compartilhar, link temporário, versões, uso de armazenamento. Tipos: PDF, DOCX, XLSX, CSV, PPTX, TXT, MD, JSON, HTML, CSS, JS, TS, PY, imagens, ZIP.

### 6.11 Automações (`/app/automations`)
Gatilhos: horário agendado, diário/semanal/mensal, novo arquivo, webhook, evento de projeto, manual. Ações: rodar agente, pesquisar web, gerar relatório, processar planilha, criar arquivo, enviar email preparado, publicar resultado, script permitido, notificar. Cada automação com nome, descrição, trigger, ações, status, logs, última/próxima execução, executar agora, pausar, duplicar. Cron backend seguro — **nunca comandos arbitrários sem regras, limites e auditoria.**

### 6.12 Integrações (`/app/integrations`)
GitHub, Google Drive/Sheets, Gmail, Slack, Notion, WhatsApp Business API, Telegram, Vercel, AWS, Supabase, OpenAI, Anthropic, Google AI, Kimi API, Browserless, Stripe. Card com status, conectar/desconectar, permissões, última sincronização, logs de erro, info de segurança. **Nunca chaves no frontend — sempre OAuth ou secrets no backend.**

### 6.13 Configurações (`/app/settings`)
Perfil, Empresa, Preferências, Aparência, Idioma, Segurança, API Keys, Modelos, Notificações, Dados e privacidade, Sessões, Exclusão de conta. Na aba API Keys: nunca reexibir a chave completa após salva, mostrar só prefixo + últimos 4 caracteres, testar conexão, revogar, alterar, guardar criptografado, registrar auditoria.

### 6.14 Admin (`/admin`, exige role ADMIN)
Usuários, workspaces, planos, créditos, modelos de IA, provedores, status de workers, filas, custos estimados, logs de auditoria, tarefas falhas (com reexecução), moderação de abuso, templates, feature flags, banners, métricas de produto/uso/receita, alertas operacionais.

---

## 7. MODOS DE IA

- **Chat Rápido** — perguntas, escrita, ideias, suporte. Baixa latência, menor custo, sem ferramentas por padrão; pode sugerir virar tarefa de agente.
- **Modo Agente** — tarefas complexas multi-etapa: plano, ferramentas, arquivos, pesquisa, navegação, scripts autorizados, sites, validação, aprovação quando necessário.
- **Pesquisa Profunda** — busca multi-fonte com rastreabilidade, citações, relatório estruturado, comparação de fontes, checagem de inconsistências.
- **Builder** — requisitos → arquitetura → código → testes → preview → deploy → versionamento.
- **Dados e Planilhas** — leitura de colunas, tratamento, fórmulas, dashboards, gráficos, detecção de anomalias, previsões simples, exportação tratada. Casos de uso prioritários: CRM, funil comercial, orçamentos, vendas, forecast, controle financeiro, propostas, base de clientes.
- **Automação** — agendamento, execução controlada, histórico, logs, notificações, regras de aprovação.
- **(Roadmap avançado — Fase 3/4) Enxame de Subagentes** — inspirado no padrão "Agent Swarm" que Kimi Work populariza: para tarefas muito longas e paralelizáveis (ex.: pesquisar 20 concorrentes ao mesmo tempo), permitir que o orquestrador dispare múltiplos subagentes especializados em paralelo em vez de um loop sequencial único. Implementar só depois que o loop sequencial single-agent estiver sólido e confiável — paralelismo prematuro é a causa mais comum de agentes que erram silenciosamente.

---

## 8. ARQUITETURA DE AGENTES

### 8.1 Orquestrador
Responsável por: receber a solicitação → classificar intenção → determinar modo → avaliar complexidade → estimar custo/tempo → criar plano de execução → escolher modelo(s) → selecionar ferramentas permitidas → executar em loop controlado → registrar eventos → validar resultado → entregar artefatos → solicitar aprovação humana quando necessário.

### 8.2 Loop de Execução
Entender pedido → consultar contexto do projeto → plano de alto nível → executar uma ação por vez → receber observação/resultado → atualizar status → corrigir erros com tentativas limitadas → validar se o objetivo foi cumprido → gerar entrega final → encerrar e salvar histórico. **Nunca exibir chain-of-thought bruto** — só resumos operacionais verificáveis, como Manus faz no painel "Computer" e como o Modo Agente (Seção 6.6) especifica.

### 8.3 Planejador
Gera checklist estruturada por tarefa. Exemplo — "Criar um site para uma empresa de construção": entender posicionamento → definir páginas → arquitetura de conteúdo → design system → frontend → formulário de contato → página de serviços → preview → validações → publicar mediante aprovação.

### 8.4 Roteamento de Modelos (Multi-Model Router)
Provedores configuráveis: Anthropic, OpenAI, Google, Kimi/Moonshot, modelos open-source via API, provedores compatíveis com OpenAI API. Este é o mesmo padrão que dá poder à Ninja AI (mais de 20 modelos atrás de uma assinatura única) — e é o padrão que você já está validando com o Nexus AI agregando Groq, NVIDIA NIM, Gemini e OpenRouter.

Roteamento sugerido:
- Chat simples → modelo rápido/barato
- Planejamento complexo → modelo de raciocínio forte
- Código → modelo especializado em programação
- Visão → modelo multimodal
- Pesquisa → modelo com bom tool use
- Resumo de documento longo → modelo com contexto longo

Requisitos: fallback automático entre provedores, limites por usuário/plano, observabilidade de custo e latência, configuração via admin, **chaves de provedor nunca expostas ao cliente**.

### 8.5 Ferramentas do Agente (com schema estrito e permissões)

**A. Arquivos:** read_file, write_file, patch_file, list_files, move_file, delete_file, create_archive, extract_archive
**B. Pesquisa:** web_search, fetch_page, extract_content, cite_source, compare_sources
**C. Navegador remoto:** browser_open, browser_navigate, browser_click, browser_type, browser_scroll, browser_select, browser_screenshot, browser_extract_text, browser_get_console, browser_close
**D. Código:** create_project, read_code, write_code, run_tests, lint, build, preview_app
**E. Ubuntu remoto (sandbox, nunca host direto):** execute_safe_command, inspect_process, read_logs, deploy_service, restart_service, check_disk, check_memory, check_network
**F. Deploy:** deploy_preview, deploy_production, rollback_deploy, get_deploy_status
**G. Dados:** analyze_csv, analyze_xlsx, generate_xlsx, generate_chart, export_report
**H. Comunicação (futuro):** send_email_draft, send_notification, create_calendar_draft

Toda ferramenta: valida argumentos, aplica allowlist quando necessário, aplica timeout, registra auditoria, retorna saída estruturada, nunca expõe segredos, respeita permissões de workspace.

---

## 9. EXECUÇÃO NO UBUNTU DA AWS — ARQUITETURA DE SANDBOX (PADRÃO 2026)

Esta seção foi atualizada com base em como o setor isola execução de código de IA hoje — o padrão mudou desde "só Docker".

**Por que Docker sozinho não é suficiente:** containers Docker compartilham o kernel do host via namespaces e cgroups. Isso dá isolamento de processo, mas não de kernel — uma vulnerabilidade de kernel ou um escape de container dá acesso ao host e a outros containers. Como um agente de IA gera código imprevisível (é literalmente o cenário de "código não confiável" que a indústria de segurança sempre tratou como o pior caso), o padrão que se consolidou em 2026 para qualquer execução acionada por IA ou por usuário final é:

| Camada | Tecnologia | Quando usar |
|---|---|---|
| Isolamento máximo | **microVM** (Firecracker, Kata Containers) | Padrão-base para qualquer execução de código gerado por IA ou multi-tenant em 2026 — cada carga de trabalho ganha seu próprio kernel dedicado |
| Meio-termo pragmático | **gVisor** | Intercepta syscalls em espaço de usuário; mais rápido que microVM, mais seguro que container puro |
| Nunca para código não confiável | Container Docker "puro" | Aceitável só para código que você mesmo escreveu e confia — não para o que o agente gera a partir de pedido do usuário |

**Recomendação concreta para sua VM Ubuntu na AWS:**
1. Rodar **Firecracker** (a mesma tecnologia por trás da AWS Lambda e do E2B) diretamente na sua instância Ubuntu para dar a cada tarefa sua própria microVM efêmera — usuário não-root dentro dela, CPU/RAM/disco/timeout limitados, diretório temporário isolado, rede restrita (sem acesso a metadata da AWS, sem acesso a `~/.ssh`, `/etc/shadow` ou credenciais de nuvem do host), sem acesso ao socket do Docker, limpeza automática ao fim da tarefa, logs sanitizados antes de qualquer exibição ao usuário.
2. Se o time preferir não operar Firecracker por conta própria no início, uma alternativa gerenciada (E2B, Daytona, Modal ou Northflank) pode ficar na frente da sua VM Ubuntu apenas para a camada de execução de código não confiável, mantendo o worker principal e a lógica de orquestração na sua própria infraestrutura — mas isso é uma decisão de Fase 2/3, não bloqueante para o MVP.
3. Separe tarefas efêmeras (sandbox descartada ao fim) de projetos persistentes (volumes controlados, nunca montando o filesystem do host diretamente).

**Segurança de comandos (`execute_safe_command`):**
- Nunca aceitar shell livre vindo do usuário — converter intenção do agente em comandos validados por allowlist/denylist
- Bloquear: `rm -rf` em diretórios críticos, `shutdown`/`reboot`, fork bombs, curl para endpoints internos, acesso a metadata da AWS, exfiltração de segredos, instalação não autorizada no host, manipulação de firewall, `sudo` por padrão, acesso ao socket do Docker, acesso a `~/.ssh`/`/etc/shadow`/credenciais de nuvem
- Executar sempre em usuário não-root dentro da sandbox, com rede/tempo/processo/memória limitados, registrando comando e saída sanitizada
- Exigir aprovação humana explícita para comandos de maior risco

**Documento a gerar:** `docs/AWS_UBUNTU_DEPLOYMENT.md` cobrindo preparo do Ubuntu, instalação de Docker/Docker Compose/Firecracker, Node.js, Redis, configuração do worker, variáveis de ambiente, serviço systemd, Nginx/Caddy + HTTPS, atualização e rollback do worker, logs, backups e monitoramento.

---

## 10. BROWSER AUTOMATION VIA BROWSERLESS

Integração **somente no backend** — nunca no frontend, nunca em código público, nunca em logs ou mensagens de erro.

**Variáveis de ambiente:**
```
BROWSERLESS_TOKEN=SEU_TOKEN_AQUI
BROWSERLESS_BASE_URL=https://production-sfo.browserless.io
BROWSERLESS_ENABLED=true
```

**Boas práticas confirmadas pela documentação oficial da Browserless** (aplique todas):
- Token só como variável de ambiente, nunca hardcoded no código-fonte
- `.env` sempre no `.gitignore` — nunca commitar
- Em produção, usar um cofre de segredos (AWS Secrets Manager, Vault, 1Password) em vez de só variável de ambiente solta
- Rotacionar o token imediatamente se houver suspeita de exposição, periodicamente a cada 90 dias, e sempre que alguém com acesso sair do time
- Se auto-hospedar o Browserless em Docker, isolar o container em rede interna (sem expor porta diretamente), usar proxy reverso, e desabilitar features desnecessárias (`ALLOW_GET=false`, `ALLOW_FILE_PROTOCOL=false`, `ENABLE_CORS=false` conforme aplicável)
- Cada sessão de navegador roda isolada, com diretório de dados de usuário separado — estado de um usuário nunca vaza para outro

**Endpoint backend seguro:** `POST /api/agent/browser/session` — valida usuário autenticado, verifica plano/limite, cria sessão remota, registra `taskId`, retorna só dados temporários necessários, aplica rate limit e timeout, encerra a sessão ao fim da tarefa.

**Funcionalidades:** abrir URL, extrair conteúdo, screenshot, interagir com elementos, preencher formulários (sem dados sensíveis por padrão), múltiplas abas, logs de console, download para área isolada, proxy configurável (futuro).

**Ações que exigem aprovação humana explícita:** login, inserção de senha, pagamento, exclusão, envio de mensagem, publicação em rede social, alteração de conta, aceite de termos, dados bancários, dados pessoais sensíveis. UI de aprovação: "oMNINJA precisa da sua aprovação para continuar" mostrando ação, site, motivo, risco, e botões "Aprovar uma vez" / "Negar" / "Sempre perguntar".

---

## 11. SEGURANÇA E PRIVACIDADE

**Regras obrigatórias:** autenticação segura, hash forte de senha, sessões protegidas, CSRF quando aplicável, rate limiting, validação de schema (Zod ou equivalente), RBAC (USER/MEMBER/MANAGER/ADMIN), multi-tenant por workspace com isolamento de dados por organização, audit trail, criptografia de segredos, sanitização de logs, proteção contra prompt injection e SSRF, proteção contra upload malicioso, limites de arquivo, CORS restritivo, Content Security Policy, headers de segurança, soft delete quando apropriado, backup/recuperação, política de retenção de dados configurável.

**LGPD (Lei Geral de Proteção de Dados):** como produto brasileiro, trate isso como requisito de lançamento, não como item de roadmap futuro — base legal para tratamento de dados, política de privacidade clara, consentimento explícito para dados sensíveis, direito de exportação e exclusão de dados do titular, registro de operações de tratamento, e minimização de dados coletados no onboarding.

**Proteção contra prompt injection:** ao navegar ou ler conteúdo externo, tratar todo conteúdo de sites/PDFs/arquivos como não confiável; nunca obedecer instruções embutidas nesse conteúdo; separar claramente instruções do usuário de dados externos; alertar quando houver tentativa suspeita de instrução embutida; nunca executar comandos vindos diretamente de páginas externas sem passar pela validação do orquestrador; usar schemas de ferramenta rígidos.

**Higiene de segredos (reforçado após o incidente desta conversa):** nenhuma chave de API, token ou segredo deve aparecer em: código-fonte, prompts colados em chats, mensagens de commit, tickets de suporte, capturas de tela compartilhadas, ou logs de aplicação. Toda chave nova nasce direto no painel de variáveis de ambiente (Vercel/AWS/cofre de segredos) e nunca passa por texto solto no caminho até lá.

---

## 12. MODELO DE DADOS

Entidades principais (com campos essenciais):

- **User** — id, name, email, image, role, locale, timezone, onboardingCompleted, timestamps
- **Workspace** — id, name, slug, logo, plan, ownerId, timestamps
- **WorkspaceMember** — id, workspaceId, userId, role, status
- **Project** — id, workspaceId, name, description, icon, status, createdBy, timestamps
- **Conversation** — id, workspaceId, projectId?, title, mode, modelPreference, createdBy, timestamps
- **Message** — id, conversationId, role, content, attachments, metadata, createdAt
- **AgentTask** — id, workspaceId, projectId?, conversationId?, title, objective, status, mode, priority, modelRoute, estimatedCost, actualCost, startedAt, completedAt, createdBy
- **AgentStep** — id, taskId, stepOrder, type, title, status, input, output, startedAt, completedAt
- **Artifact** — id, workspaceId, projectId?, taskId?, type, name, fileUrl, metadata, createdAt
- **FileAsset** — id, workspaceId, projectId?, uploadedBy, originalName, mimeType, size, storagePath, checksum, createdAt
- **Integration** — id, workspaceId, provider, status, encryptedCredentials, scopes, lastSyncAt
- **Automation** — id, workspaceId, name, triggerType, triggerConfig, actionConfig, status, lastRunAt, nextRunAt
- **AutomationRun** — id, automationId, status, startedAt, completedAt, logs, output
- **ApiKey** — id, workspaceId, name, prefix, encryptedSecret, lastUsedAt, revokedAt
- **UsageRecord** — id, workspaceId, userId?, category, units, estimatedCost, createdAt
- **AuditLog** — id, workspaceId, userId?, action, entityType, entityId, ip, metadata, createdAt
- **Notification** — id, userId, type, title, body, readAt, createdAt
- **Subscription** — id, workspaceId, plan, status, providerCustomerId, providerSubscriptionId, currentPeriodEnd

---

## 13. STACK TECNOLÓGICA

**Frontend:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons, React Hook Form, Zod, TanStack Query, Zustand quando necessário.

**Backend:** Next.js Route Handlers ou serviço Node separado, TypeScript, Prisma ou Drizzle ORM, PostgreSQL, Redis, BullMQ, WebSockets ou SSE.

**Autenticação:** Auth.js (NextAuth) ou equivalente, email/senha + OAuth preparado, RBAC.

**Storage:** S3-compatível (AWS S3, Cloudflare R2 ou Supabase Storage), presigned URLs, isolamento por workspace.

**IA:** camada adapter multi-provedor, streaming, function calling, registro de tokens/custo/latência, fallback de modelos.

**Sandbox:** Firecracker self-hosted na sua VM Ubuntu (ou E2B/Daytona/Northflank como camada gerenciada — ver Seção 9), Docker/Docker Compose para os serviços que não executam código não confiável.

**Pagamentos:** Stripe internacional + **PIX nativo** (Mercado Pago ou Asaas, com webhook) para o mercado brasileiro — este é o diferencial de mercado local que nenhum dos quatro concorrentes pesquisados resolve bem.

**Testes:** Vitest/Jest, Playwright E2E, testes de API, de permissões, de isolamento de workspace, de upload, de fila, de rotas críticas.

---

## 14. ESTRUTURA DE REPOSITÓRIO

```
/apps
  /web
  /worker
/packages
  /ui
  /config
  /types
  /agent-core
  /security
  /database
/docs
  /architecture
  /deployment
  /security
  /product
/infrastructure
  /docker
  /aws
  /scripts
```

Arquivos obrigatórios: `README.md` completo, `.env.example` (sem nenhum segredo real), `docker-compose.yml` (dev), `docker-compose.worker.yml`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/AWS_UBUNTU_DEPLOYMENT.md`, `docs/BROWSERLESS_SETUP.md`, `docs/OPERATIONS.md`, `docs/PRODUCT_ROADMAP.md`, `docs/API.md`, `docs/TROUBLESHOOTING.md`.

---

## 15. ENDPOINTS DA API

```
Auth:          POST /api/auth/register | login | logout | forgot-password
Projects:      GET/POST /api/projects · GET/PATCH/DELETE /api/projects/:id
Chat:          GET/POST /api/conversations · GET/POST /api/conversations/:id/messages · POST .../regenerate
Agent:         POST /api/agent/tasks · GET /api/agent/tasks/:id
               POST /api/agent/tasks/:id/{pause,resume,cancel,approve}
               GET  /api/agent/tasks/:id/events
Files:         POST /api/files/upload-url · POST /api/files/complete-upload
               GET/DELETE /api/files · GET/DELETE /api/files/:id
Research:      POST /api/research · GET /api/research/:id · POST /api/research/:id/export
Builder:       POST /api/builder/projects · POST .../generate · .../preview · .../deploy
Automations:   GET/POST /api/automations · POST /api/automations/:id/{run,pause}
Admin:         GET /api/admin/{metrics,users,tasks,workers,audit-logs}
```

Toda rota: exige autenticação quando aplicável, checa membership do workspace, valida payload com schema, tem rate limit e logs, nunca retorna dados sensíveis, retorna erros consistentes e documentados.

---

## 16. BIBLIOTECA DE COMPONENTES

AppShell, Sidebar, Topbar, CommandPalette, SmartChatInput, ChatMessage, MessageActions, StreamingIndicator, AgentTaskPanel, AgentTimeline, AgentPlan, AgentEventFeed, BrowserPreview, TerminalPreview, FileUploader, FileCard, ArtifactCard, ProjectCard, UsageMeter, CreditBadge, ModelSelector, ModeSelector, ApprovalDialog, SecurityAlert, DeployDialog, EmptyState, ErrorState, SkeletonState, NotificationCenter, SettingsPanel, IntegrationCard, AutomationBuilder, BillingCard, DataTable, SearchInput, FilterBar, StatusBadge, Tooltip, ConfirmationDialog, Toast.

Estados completos obrigatórios em cada tela relevante: Loading, Empty, Error, Success, Offline, Permission denied, Upgrade required, Rate limited, Task paused, Task awaiting approval, Task failed, Task completed.

---

## 17. COMPORTAMENTO DO AGENTE (COMUNICAÇÃO EM PT-BR)

O agente se comunica em português claro, profissional e objetivo. Exemplos:

- "Entendi o objetivo. Vou estruturar um plano antes de começar."
- "Estou pesquisando referências e organizando as informações relevantes."
- "Encontrei dados conflitantes em algumas fontes. Vou priorizar fontes oficiais e sinalizar limitações."
- "Criei a primeira versão do site e iniciei a validação do projeto."
- "Preciso da sua aprovação antes de publicar esta versão em produção."
- "Concluí a tarefa. Preparei os arquivos, o link de preview e um resumo das decisões."
- Em falha: "Não consegui concluir esta etapa na primeira tentativa. Estou aplicando uma alternativa segura."

**Nunca** inventar que executou algo, nunca dizer que publicou sem confirmação real do deploy, nunca afirmar acesso a conta/sistema/dado que não foi conectado.

---

## 18. PLANOS E CRÉDITOS

- **Starter** — chat básico, créditos iniciais, projetos limitados, 1 agente por vez
- **Pro** — mais créditos, Modo Agente, Pesquisa Profunda, Builder, mais arquivos, mais tarefas simultâneas
- **Business** — equipe, mais agentes, integrações, automações, controle de membros, analytics
- **Enterprise** — SSO preparado, limites customizados, suporte prioritário, infraestrutura dedicada futura, auditoria ampliada

Página de billing, indicador de uso, bloqueio gracioso por limite, tela de upgrade, uso por categoria, **estimativa de custo antes de tarefas caras** (item deliberado: a pesquisa mostrou que a variação imprevisível de crédito por tarefa é uma das críticas mais comuns à Manus — resolver isso é vantagem competitiva direta), webhook de pagamento preparado (Stripe + PIX).

---

## 19. SEO, ACESSIBILIDADE E QUALIDADE

**SEO:** metadata, Open Graph, Twitter cards, sitemap, robots.txt, JSON-LD de organização/software, performance alta, blog preparado, páginas de casos de uso/segurança/documentação/status.

**Acessibilidade:** navegação por teclado, focus states claros, ARIA labels, contraste adequado, suporte a leitor de tela, estados de erro acessíveis, `prefers-reduced-motion`, componentes semanticamente corretos, Lighthouse alto, otimização de imagem, code splitting, tratamento de rede lenta e de falhas de API externa.

---

## 20. DADOS INICIAIS E DEMO

Usuário demo, workspace demo, e conjunto de projetos/conversas/tarefas de exemplo cobrindo os principais modos (uma tarefa concluída, uma em execução, uma aguardando aprovação, uma falha com opção de retry) — suficiente para qualquer visitante entender o produto sem precisar criar uma conta primeiro.

---

## 21. ROADMAP DE ENTREGA POR FASES

**Não esconda funcionalidades incompletas atrás de botões sem ação.** Quando uma integração externa não estiver configurada, use modo mock explícito no ambiente de desenvolvimento, com badge visual "Modo demonstração" — nunca finja que uma integração real está funcionando.

**Fase 1 — MVP funcional:** landing page, login/cadastro, dashboard, chat com streaming, projetos, upload de arquivos, tarefas de agente com arquitetura real de job (mesmo que a execução ainda seja simplificada), histórico, configurações, estrutura de banco, worker básico, UI completa, admin inicial.

**Fase 2 — Agentes e integrações:** orquestrador completo, fila real, ferramentas de arquivos, pesquisa web, Browserless no backend, sandbox por tarefa na sua VM Ubuntu (Seção 9), logs, aprovação humana, builder inicial, deploy preview.

**Fase 3 — Escala:** automações, equipes, billing completo (Stripe + PIX), integrações OAuth, métricas, limites, auditoria, observabilidade, reforço de produção AWS, e — só aqui — avaliar o modo "enxame de subagentes" (Seção 7).

**Comece pela Fase 1. Não tente gerar as três fases de uma vez** — isso é o que costuma produzir aplicações superficiais, com botões que não fazem nada e telas que parecem prontas mas não são.

---

## 22. CHECKLIST DE ACEITE

Antes de declarar qualquer fase concluída, validar:

- [ ] Todos os botões importantes funcionam · rotas existem · navegação funciona
- [ ] Login e logout funcionam · dashboard carrega
- [ ] Projeto pode ser criado · conversa pode ser criada · mensagens podem ser enviadas
- [ ] Upload pode ser iniciado · arquivos aparecem na área de arquivos
- [ ] Tarefa de agente pode ser criada · timeline exibe eventos reais
- [ ] Usuário pode pausar/cancelar tarefa · fluxo de aprovação funciona
- [ ] Admin exige permissão · workspace isola os dados corretamente
- [ ] API valida payload · segredos não aparecem no frontend em nenhuma tela
- [ ] Browserless é estritamente backend-only, token só em variável de ambiente
- [ ] `.env.example` não contém nenhum segredo real
- [ ] README explica instalação · Docker local funciona · worker pode ser iniciado
- [ ] Build passa · lint passa · testes críticos passam
- [ ] Responsivo em mobile/tablet/desktop · sem links quebrados
- [ ] Sem botão de placeholder, sem "Lorem Ipsum", sem tela incompleta sem aviso
- [ ] Nenhuma marca, logo ou nome de Manus/Kimi/Ninja AI/Claude/outra empresa aparece em qualquer tela

---

## 23. ENTREGÁVEIS FINAIS

1. Código completo e organizado, com backend e worker separados
2. Aplicação web funcional · banco de dados com migrations e dados seed
3. Documentação completa (`docs/`) · `.env.example` sem segredos
4. Docker Compose de desenvolvimento · instruções AWS Ubuntu, Vercel e Browserless
5. Instruções de segurança · arquitetura de agentes documentada
6. Testes essenciais · checklist de deploy
7. Guia para adicionar novos provedores de IA · guia para operar/monitorar workers
8. Design system consistente · interfaces completas para todas as rotas
9. Uma primeira versão pronta para evoluir em produção

---

## 24. INSTRUÇÃO FINAL DE EXECUÇÃO

Comece pela fundação técnica, o design system e o dashboard. Em seguida, autenticação, projetos, chat e tarefas. Depois, a camada de agentes e workers (Fase 2). Priorize sempre: funcional, seguro, bonito, evolutivo — nessa ordem quando houver conflito.

Ao final de cada fase, gere um relatório técnico contendo: arquitetura escolhida, recursos implementados, recursos em modo mock, variáveis de ambiente necessárias, passos de deploy (Vercel e Ubuntu AWS), checklist de segurança revisado, e próximos passos recomendados.

Construa o oMNINJA como um produto SaaS premium, brasileiro, moderno, confiável e escalável — original na marca, comparável na capacidade.

---

## APÊNDICE — FONTES CONSULTADAS NESTA PESQUISA

- Security Boulevard / SSOJet — "What Is Manus AI? The General AI Agent, Explained (2026)"
- E2B Blog — "How Manus Uses E2B to Provide Agents With Virtual Computers"
- Taskade Blog — "Manus AI Review 2026: Features, Pricing, 7 Alternatives"
- AlphaMatch — "Manus 'My Computer': The AI Agent That Finally Lives on Your Machine"
- AI Automation Global — "Manus Cloud Computer: The Always-On Machine for AI Agents"
- TechRadar, CNBC, AI Magazine, Asia Tech Review, Spyglass — cobertura da aquisição Meta–Manus (dez/2025–jun/2026)
- AICC, Leanware, Codecademy, Verdent, Lorphic, Kili Technology, SpectrumAILab, MindStudio — família de modelos Kimi K2/K2.5/K2.6/K3 e Kimi Work (Moonshot AI)
- AWS Blog, NinjaTech AI Blog, MOGE, FindMoreAI, AI Market Landscape, App Store — MyNinja.ai / NinjaTech AI
- Northflank, Modal, Cosmonic, Blaxel, Digital Applied — arquitetura de sandbox para agentes de IA em 2026 (microVM/gVisor vs. Docker)
- Documentação oficial da Browserless (`docs.browserless.io`) — gestão de token, rotação e boas práticas de produção

*Pesquisa realizada em 30 de julho de 2026. O mercado de agentes de IA muda rápido — revalide preços, limites e status de produtos concorrentes antes de finalizar decisões de posicionamento.*
