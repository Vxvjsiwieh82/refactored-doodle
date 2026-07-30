# Manus AI — Dossiê Técnico Completo

*Compilado a partir de pesquisa profunda em dezenas de fontes (prompts vazados, documentação oficial, imprensa especializada, comunicados da AWS, Wikipedia, relatórios financeiros). Última atualização das fontes: julho de 2026. Onde a informação vem de engenharia reversa/vazamento (não confirmada oficialmente pela Manus), isso está sinalizado.*

---

## Resumo executivo

O **Manus** é um agente de IA autônomo e generalista, lançado em 6 de março de 2025 pela startup chinesa **Butterfly Effect** (蝴蝶效应). Ele não é um modelo de IA próprio — é uma **camada de orquestração** construída sobre modelos de terceiros (principalmente **Claude, da Anthropic**, mais versões da **Qwen, da Alibaba**, ajustadas via fine-tuning), acoplada a uma **máquina virtual Linux isolada** para cada tarefa, um conjunto de **29 ferramentas** (shell, arquivos, navegador, deploy, busca) e um **loop de agente** que decide sozinho os próximos passos até entregar o resultado. Roda sobre infraestrutura da **AWS**. Em 2025-2026 protagonizou uma novela corporativa: foi comprada pela Meta por ~US$ 2 bilhões, a China bloqueou o negócio por segurança nacional, e agora está sendo recomprada por investidores chineses (Tencent à frente).

---

## Índice
1. [O que é o Manus](#1-o-que-é-o-manus)
2. [Linha do tempo e história](#2-linha-do-tempo-e-história)
3. [Empresa e fundadores](#3-empresa-e-fundadores)
4. [Quais modelos de IA o Manus usa](#4-quais-modelos-de-ia-o-manus-usa)
5. [Arquitetura: como ele "pensa" e processa (Agent Loop)](#5-arquitetura-como-ele-pensa-e-processa-agent-loop)
6. [Regras internas de comportamento (system prompt)](#6-regras-internas-de-comportamento-system-prompt)
7. [As 29 ferramentas internas](#7-as-29-ferramentas-internas)
8. [Ambiente sandbox (o "computador" dele)](#8-ambiente-sandbox-o-computador-dele)
9. [Infraestrutura, VMs e nuvem — onde ele roda](#9-infraestrutura-vms-e-nuvem--onde-ele-roda)
10. [Automação de navegador](#10-automação-de-navegador)
11. [Benchmarks e desempenho](#11-benchmarks-e-desempenho)
12. [Preços e sistema de créditos (2026)](#12-preços-e-sistema-de-créditos-2026)
13. [Principais funcionalidades do produto](#13-principais-funcionalidades-do-produto)
14. [Linha do tempo de lançamentos de recursos](#14-linha-do-tempo-de-lançamentos-de-recursos)
15. [Projetos "clone" e open source relacionados](#15-projetos-clone-e-open-source-relacionados)
16. [A novela Meta × China × Tencent (2025-2026)](#16-a-novela-meta--china--tencent-2025-2026)
17. [Privacidade, segurança e críticas](#17-privacidade-segurança-e-críticas)
18. [Lições práticas para quem quer construir algo parecido](#18-lições-práticas-para-quem-quer-construir-algo-parecido)
19. [Fontes principais](#19-fontes-principais)

---

## 1. O que é o Manus

Manus se descreve como o "primeiro agente de IA de propósito geral do mundo". Diferente de um chatbot, ele não só responde: ele **planeja e executa** tarefas de múltiplas etapas sozinho — pesquisa, escreve código, analisa dados, cria sites/apps, preenche planilhas, navega na web — dentro de um computador virtual próprio, e entrega o resultado final (arquivo, site publicado, relatório) em vez de apenas texto.

O nome vem do latim *manus* ("mão"), inspirado no lema do MIT *"mens et manus"* ("mente e mão") — a ideia de que os modelos de linguagem já têm "mente" (inteligência), mas faltava a "mão" (capacidade de agir no mundo digital).

---

## 2. Linha do tempo e história

| Data | Evento |
|---|---|
| **2022** | Xiao Hong funda a **Butterfly Effect** em Pequim, dois meses antes do lançamento público do ChatGPT. Escritórios em Pequim e Wuhan, mirando mercados fora da China (América do Norte, Japão, Coreia do Sul). |
| **2023** | A empresa lança **Monica**, uma extensão de navegador que agregava vários LLMs comerciais (GPT-4o, Claude, etc.) para tradução, resumo e escrita — o produto "irmão mais velho" do Manus. |
| **2024** | A ByteDance oferece ~US$ 30 milhões para comprar a empresa; Xiao Hong recusa. |
| **Out/2024** | Início do desenvolvimento do Manus, inspirado em observações de como usuários não-programadores usavam o Cursor (só se importavam com o resultado, não com o código). |
| **6/mar/2025** | Lançamento público do Manus, em acesso por convite. Vídeo de demonstração viraliza (+1 milhão de visualizações em 20h); lista de espera passa de 2 milhões de pessoas em uma semana. Códigos de convite chegaram a ser revendidos por ¥50.000 (~US$ 7.000) no mercado paralelo chinês. |
| **12/mai/2025** | Fim da lista de espera — acesso livre com créditos gratuitos para todos. |
| **25/abr/2025** | Rodada Série B de US$ 75 milhões liderada pela Benchmark, avaliando a empresa em ~US$ 500 milhões (5× a avaliação anterior de US$ 100 milhões). |
| **31/jul/2025** | Lançamento do **Wide Research** (100+ agentes em paralelo). |
| **Set-Dez/2025** | Sede transferida oficialmente para **Singapura**. Lançamentos: Connectors, Manus 1.5, Browser Operator, templates de Slides. |
| **3/dez/2025** | Manus anuncia a **AWS** como provedora estratégica de nuvem. |
| **15/dez/2025** | Lançamento do **Manus 1.6** (com variante "1.6 Max"). |
| **29-30/dez/2025** | **Meta anuncia aquisição do Manus** por mais de US$ 2 bilhões. |
| **Jan/2026** | Ministério do Comércio da China abre investigação sobre o negócio; lançamento do app builder mobile e de "My Computer". Emitidas proibições de saída do país (*exit bans*) para executivos do Manus sob investigação. |
| **27-30/abr/2026** | A **NDRC** (Comissão Nacional de Desenvolvimento e Reforma da China) **ordena o desfazimento total do acordo**, citando segurança nacional — primeiro uso confirmado publicamente do mecanismo chinês de revisão de investimento estrangeiro para bloquear uma transação de IA transfronteiriça. |
| **11/jun/2026** | Meta conclui a "separação operacional": para de compartilhar dados, corta a equipe do Manus do acesso a sistemas internos da Meta e proíbe funcionários da Meta de usar ferramentas do Manus. |
| **10-11/jul/2026** | A **Tencent entra em negociações para se tornar a maior acionista** do Manus, junto com investidores originais (ZhenFund, HSG), num plano de recomprar a empresa da Meta por pelo menos US$ 2 bilhões. Situação ainda não resolvida na data desta pesquisa (29/jul/2026). |

---

## 3. Empresa e fundadores

- **Empresa controladora:** Butterfly Effect Technology (蝴蝶效应), sediada hoje em **Singapura** (antes em Pequim/Wuhan).
- **Xiao Hong** ("Red") — fundador e CEO. Nascido em 1992, formado pela Huazhong University of Science and Technology.
- **Ji Yichao** ("Peak") — cofundador e Chief Scientist do Manus. Nascido em 1992, criado entre o Colorado (EUA) e Pequim.
- **Zhang Tao** ("HIK"/"hidecloud") — cofundador, diretor de produto.
- Segundo uma apresentação técnica da própria equipe, os três têm décadas de experiência em programação, mas entraram na área de IA apenas cerca de dois anos antes do lançamento do Manus.
- **Funcionários:** estimativas de 2026 variam entre ~78 e ~105, distribuídos entre Singapura, Tóquio e São Francisco (a maior parte da equipe em Pequim foi desligada em meados de 2026 em meio à expansão global).
- **Receita:** run-rate de US$ 90 milhões alcançado ~4 meses após o lançamento do modelo de assinatura; ARR de ~US$ 100 milhões até dezembro/2025; receita anual reportada de ~US$ 125 milhões em 2026.
- **Investidores:** Tencent, ZhenFund, HSG (ex-Sequoia China), Benchmark (líder da rodada Série B), Etna Labs, Factorial Funds, Peregrine Ventures, Unicorn Capital Partners, e o anjo Wang Huiwen. Total levantado: ~US$ 85 milhões antes da aquisição pela Meta.

---

## 4. Quais modelos de IA o Manus usa

Ponto central: **o Manus não é um modelo próprio.** É uma camada de orquestração sobre modelos de terceiros. Isso foi confirmado publicamente pelo próprio cofundador Ji Yichao (Peak) após o vazamento do sandbox em março de 2025.

**Evolução confirmada:**
- **Lançamento (mar/2025):** Claude 3.5 Sonnet ("v1") como motor de raciocínio principal, complementado por versões da **Qwen** (Alibaba) com fine-tuning próprio para tarefas específicas (custo menor, latência menor para usuários asiáticos/chineses).
- Testes internos com **Claude 3.7 Sonnet** logo em seguida.
- Upgrade posterior para a geração **Claude 4**.
- Em meados de 2026, análises comparativas de mercado (não confirmadas oficialmente pela Manus) apontam o Manus operando com os modelos mais recentes da linha Claude disponíveis na época — a empresa não fixa publicamente uma única versão, e parece atualizar o "cérebro" conforme a Anthropic lança modelos novos.

**Por que Claude, segundo a própria equipe (motivos técnicos declarados em talk pública):**
1. **Planejamento de longo horizonte** — uma tarefa típica do Manus exige de 30 a 50 passos até o resultado final. Durante a fase de testes (out/2024–mar/2025), apenas o Claude Sonnet 3.5 conseguia "entender" que estava dentro de um loop agente longo; outros modelos testados encerravam prematuramente após 1-3 iterações, achando que já tinham informação suficiente.
2. **Uso de ferramentas (tool use / function calling)** — com dezenas de ferramentas disponíveis, a precisão na escolha de qual ferramenta usar e com quais parâmetros era crítica. Antes de o Claude ter "extended thinking" nativo, a equipe implementou um mecanismo próprio chamado **"thought injection"**: um "agente planejador" separado raciocinava sobre qual ferramenta usar antes de cada chamada, e esse raciocínio era injetado no contexto do agente principal antes da execução.
3. **Alinhamento para uso de computador/navegador** — a Anthropic investiu pesado em alinhamento específico para cenários de "computer use", o que favorece agentes como o Manus.

**Qwen (Alibaba):** usada via parceria estratégica anunciada publicamente, com foco em tarefas em chinês e redução de latência/custo em mercados asiáticos. Variantes citadas incluem Qwen2.5-Max (mixture-of-experts) e QwQ-32B (raciocínio).

**Roteamento multi-modelo:** relatos da imprensa descrevem "invocação dinâmica multi-modelo" — o sistema escolhe o modelo mais adequado por idioma, tipo de tarefa e outros fatores de contexto, em vez de depender de um único modelo fixo.

**Nota sobre infraestrutura de inferência:** a AWS é a nuvem confirmada oficialmente para toda a infraestrutura de *sandbox*/execução de agentes (ver seção 9). A inferência da Qwen provavelmente passa pela própria infraestrutura da Alibaba Cloud, dado que é modelo Alibaba — isso não foi confirmado explicitamente nas fontes pesquisadas, mas é a inferência mais razoável dado o parceiro.

---

## 5. Arquitetura: como ele "pensa" e processa (Agent Loop)

O prompt de sistema vazado do Manus (obtido por engenharia reversa em março de 2025 e nunca desmentido tecnicamente pela empresa — apenas classificado como "pouco ofuscado, de propósito") descreve um **loop de agente** de 6 passos, repetido até a tarefa terminar:

1. **Analisar eventos** — entender a necessidade do usuário e o estado atual através de um "event stream" (fluxo de eventos), focando nas mensagens mais recentes e nos resultados de execuções anteriores.
2. **Selecionar ferramenta** — escolher a próxima chamada de ferramenta com base no estado atual, no planejamento da tarefa e no conhecimento disponível.
3. **Aguardar execução** — a ação escolhida é executada pelo ambiente sandbox, e o resultado (observação) é adicionado de volta ao fluxo de eventos.
4. **Iterar** — apenas **uma** chamada de ferramenta por iteração; o ciclo se repete pacientemente até a tarefa estar completa.
5. **Entregar resultado** — envia a entrega final ao usuário via ferramentas de mensagem, anexando arquivos gerados.
6. **Entrar em espera (standby)** — quando todas as tarefas estão concluídas ou o usuário pede para parar.

**O "event stream" (fluxo de eventos)** é composto por: mensagens do usuário, ações (chamadas de ferramenta), observações (resultados dessas ações), atualizações de um módulo de **Planejamento** (planeja os passos em pseudocódigo numerado), eventos de um módulo de **Conhecimento** (boas práticas relevantes para a tarefa) e eventos de um módulo de **Datasource** (documentação de APIs de dados autorizadas, chamadas via Python, sem necessidade de login).

**Filosofia declarada — "less structure, more intelligence":** ao contrário de arquiteturas multiagente com papéis fixos (um "agente programador", um "agente pesquisador" etc.), a equipe do Manus afirma publicamente que o núcleo do sistema **não tem workflows pré-definidos**. Em vez de restringir o modelo a papéis específicos, eles dão contexto rico e deixam o modelo "improvisar" a decomposição do problema. Segundo a equipe, capacidades como pesquisa profunda "emergiram" dessa arquitetura simples conforme os modelos de base melhoravam, sem esforço de engenharia dedicado a esse caso de uso específico — ao contrário da abordagem de concorrentes, que treinariam meses especificamente para um recurso assim.

**Sistema pessoal de conhecimento:** o usuário pode "ensinar" preferências de comportamento em linguagem natural (ex.: "da próxima vez, confirme os detalhes comigo antes de começar a pesquisa"), e o Manus passa a aplicar essa preferência em interações futuras — mantendo a filosofia de codificar até preferências comportamentais como contexto, não como código fixo.

---

## 6. Regras internas de comportamento (system prompt)

Resumo (parafraseado, não literal) das principais regras encontradas no prompt de sistema vazado:

- **Idioma:** padrão é inglês, mas usa o idioma que o usuário especificar; todo raciocínio e argumentos de ferramentas devem seguir esse idioma de trabalho.
- **Shell:** evita comandos que pedem confirmação (usa flags tipo `-y`/`-f`), evita saídas excessivas (salva em arquivo), encadeia comandos com `&&`, usa `bc` ou Python para contas (nunca calcula "de cabeça").
- **Arquivos:** usa ferramentas de arquivo dedicadas (não o shell) para ler/escrever/editar, evitando problemas de escape de string; salva resultados intermediários em arquivos separados.
- **Navegador:** deve necessariamente abrir e ler qualquer URL fornecida pelo usuário ou vinda de busca; elementos interativos aparecem indexados na página; sugere ao usuário assumir o controle do navegador para operações sensíveis (login, pagamento).
- **Deploy:** serviços podem ser expostos temporariamente por porta; sites estáticos e certas aplicações suportam deploy permanente; sempre pergunta ao usuário se quer publicar em produção.
- **Escrita:** por padrão usa prosa corrida (evita bullet points, exceto na lista de tarefas); documentos longos devem ter no mínimo alguns milhares de palavras (a menos que o usuário peça o contrário) e citar fontes originais.
- **Mensagens ao usuário:** primeira resposta deve ser breve, só confirmando o recebimento; distingue entre "notify" (não bloqueia, sem necessidade de resposta) e "ask" (bloqueia, espera resposta) — usando "ask" o mínimo possível para não interromper o fluxo.
- **Todo list:** mantém um arquivo `todo.md` como checklist da tarefa, atualizado a cada item concluído.
- **Tratamento de erros:** ao falhar, primeiro verifica nome/argumentos da ferramenta, tenta corrigir com base na mensagem de erro, tenta abordagem alternativa e só then reporta a falha ao usuário.
- **Uso de ferramentas:** é obrigado a sempre responder com uma chamada de ferramenta (nunca só texto puro), nunca inventa ferramentas inexistentes e nunca menciona nomes técnicos de ferramentas nas mensagens ao usuário.

---

## 7. As 29 ferramentas internas

Lista completa confirmada por engenharia reversa (arquivo `tools.json` vazado, replicado em múltiplos repositórios públicos no GitHub), organizada por categoria. Descrições parafraseadas.

**Comunicação (2)**
| Ferramenta | Função |
|---|---|
| `message_notify_user` | Envia mensagem/atualização de progresso sem esperar resposta; pode anexar arquivos |
| `message_ask_user` | Pergunta ao usuário e aguarda resposta; pode sugerir que o usuário assuma o controle do navegador |

**Arquivos (5)**
| Ferramenta | Função |
|---|---|
| `file_read` | Lê conteúdo de um arquivo (com faixa de linhas opcional, `sudo` opcional) |
| `file_write` | Escreve, sobrescreve ou anexa conteúdo a um arquivo |
| `file_str_replace` | Substitui um trecho específico de texto dentro de um arquivo |
| `file_find_in_content` | Busca um padrão (regex) dentro do conteúdo de um arquivo |
| `file_find_by_name` | Encontra arquivos por padrão de nome (glob) num diretório |

**Shell / Terminal (5)**
| Ferramenta | Função |
|---|---|
| `shell_exec` | Executa um comando numa sessão de shell específica e diretório de trabalho |
| `shell_view` | Mostra a saída atual de uma sessão de shell |
| `shell_wait` | Espera um processo em execução terminar |
| `shell_write_to_process` | Envia entrada (input) para um processo interativo em execução |
| `shell_kill_process` | Encerra um processo em execução |

**Navegador (12)**
| Ferramenta | Função |
|---|---|
| `browser_view` | Mostra o estado atual da página aberta |
| `browser_navigate` | Vai para uma URL |
| `browser_restart` | Reinicia o navegador e navega para uma URL |
| `browser_click` | Clica num elemento (por índice ou coordenadas) |
| `browser_input` | Digita/sobrescreve texto num campo editável |
| `browser_move_mouse` | Move o cursor para uma posição |
| `browser_press_key` | Simula tecla ou combinação de teclas |
| `browser_select_option` | Seleciona uma opção num menu dropdown |
| `browser_scroll_up` / `browser_scroll_down` | Rola a página para cima/baixo |
| `browser_console_exec` | Executa JavaScript no console do navegador |
| `browser_console_view` | Mostra os logs do console |

**Busca (1)**
| Ferramenta | Função |
|---|---|
| `info_search_web` | Busca na web (estilo Google, com filtro de período: última hora/dia/semana/mês/ano) |

**Deploy (2)**
| Ferramenta | Função |
|---|---|
| `deploy_expose_port` | Expõe uma porta local para acesso público temporário |
| `deploy_apply_deployment` | Publica em produção (site estático ou Next.js) a partir de um diretório local |

**Outras (2)**
| Ferramenta | Função |
|---|---|
| `make_manus_page` | Gera uma "Manus Page" (página publicável) a partir de um arquivo MDX |
| `idle` | Ferramenta especial que sinaliza que todas as tarefas foram concluídas e o agente vai entrar em espera |

> Nota: uma apresentação técnica interna da própria equipe (2025) citou "27 ferramentas abstraídas dentro da VM" — número próximo, mas não idêntico ao do arquivo vazado; provavelmente reflete uma versão anterior ou uma forma diferente de agrupar/contar as mesmas capacidades.

---

## 8. Ambiente sandbox (o "computador" dele)

Cada tarefa do Manus roda numa máquina virtual isolada e dedicada, com as seguintes especificações confirmadas (via engenharia reversa):

- **Sistema:** Ubuntu 22.04 (linux/amd64), com acesso à internet.
- **Usuário:** `ubuntu`, com privilégios `sudo`.
- **Diretório home:** `/home/ubuntu`.
- **Python:** 3.10.12 (`python3`, `pip3`).
- **Node.js:** 20.18.0 (`node`, `npm`).
- **Calculadora:** `bc` (para contas simples; Python para as complexas).
- **APIs de dados autorizadas:** acessadas via Python importando de `/opt/.manus/.sandbox-runtime` (módulo `data_api`, classe `ApiClient`) — essas chamadas são pagas/gerenciadas pelo próprio sistema, sem exigir login do usuário.
- **Sleep/wake:** sandboxes inativos "dormem" automaticamente e "acordam" quando necessário; o comando `uptime` é usado para checar o status quando o usuário pede explicitamente.
- Navegador real **Chromium** (não headless) rodando dentro da VM, com renderização completa e execução de JavaScript.
- VS Code integrado, sistema de arquivos completo, terminal.

A equipe já sinalizou planos de expandir para ambientes **Windows** e **Android** virtuais além do Linux.

---

## 9. Infraestrutura, VMs e nuvem — onde ele roda

**Provedor de nuvem oficial: Amazon Web Services (AWS).** Anunciado formalmente pela própria AWS em 3 de dezembro de 2025 como parceria estratégica — o Manus usa a AWS desde o lançamento em março de 2025.

Dados técnicos divulgados pela AWS sobre a escala de operação:
- O Manus consegue gerenciar **dezenas de milhares de instâncias sandbox com apenas 3 pessoas** na equipe de operações.
- Cada instância de sandbox **inicializa em ~125 milissegundos** e consome **apenas ~5 MiB de memória**, permitindo que um único servidor físico rode milhares de instâncias simultâneas.
- Esses números (boot ultrarrápido, memória mínima) são característicos de tecnologia de **micro-VM** (o tipo usado por serviços como AWS Lambda/Fargate, baseados em Firecracker) — o Manus não confirma publicamente qual tecnologia exata usa por baixo, mas o perfil de desempenho é consistente com esse tipo de solução.
- Com isso, o Manus atingiu um run-rate de receita de US$ 90 milhões em apenas 4 meses após lançar o modelo de assinatura.

**Importante sobre "onde compram":** o Manus não compra servidores físicos — ele é **cliente de nuvem da AWS**, pagando por capacidade computacional sob demanda (o modelo padrão de qualquer empresa de SaaS/IA em 2025-2026). Não há evidência pública de hardware próprio.

**Produtos de infraestrutura construídos em cima disso:**
- **Manus Sandbox** (lançado 14/jan/2026): a VM temporária padrão, usada para tarefas pontuais — cria, "dorme" e é reciclada automaticamente; sistema de arquivos persiste durante o sono.
- **Manus Cloud Computer**: uma VM **persistente** (nunca desliga), pensada para bots de longa duração em Slack/Discord/Telegram/WhatsApp, bancos de dados vivos e jobs agendados (scraping noturno, relatórios semanais). Ainda sem certificações formais de compliance (SOC 2, ISO 27001, HIPAA) divulgadas publicamente.
- **Manus Desktop / "My Computer"** (lançado ~mar/2026): permite execução local no Mac/Windows do próprio usuário, controlando os arquivos locais dele (diferente do sandbox/cloud computer, que rodam nos servidores do Manus).

**Escritórios:** Singapura (sede), Tóquio e São Francisco — os três abertos em sequência rápida (poucas semanas de diferença) durante a expansão internacional no fim de 2025.

---

## 10. Automação de navegador

O Manus usa uma versão adaptada da biblioteca open source **`browser_use`** (licença MIT) — mas, segundo a própria equipe, eles aproveitaram **apenas a camada de protocolo de comunicação** com o navegador, não o framework de agente completo que a biblioteca oferece.

Quando precisa navegar, o Manus envia **três inputs multimodais simultâneos** ao modelo de base:
1. O **texto** visível na viewport atual (extraído e convertido para Markdown quando possível).
2. Uma **captura de tela** da viewport.
3. Uma **segunda captura de tela**, com caixas delimitadoras (*bounding boxes*) sobrepostas indicando os elementos clicáveis.

Essa combinação de extração de texto + contexto visual + affordances espaciais permite decisões de navegação mais precisas. O navegador é um **Chromium real** (não headless) rodando dentro da VM — com renderização e execução de JavaScript completas.

---

## 11. Benchmarks e desempenho

No **benchmark GAIA** (avaliação de assistentes gerais de IA em tarefas do mundo real, em 3 níveis de dificuldade), o Manus divulgou, no lançamento, resultados de estado-da-arte:

| Nível | Manus | OpenAI Deep Research (à época) |
|---|---|---|
| Nível 1 (básico) | **86,5%** | 74,3% |
| Nível 2 (intermediário) | **70,1%** | 69,1% |
| Nível 3 (avançado) | **57,7%** | 47,6% |

Esses números continuaram sendo citados como referência (versão "Manus 1.5") ao longo de 2026, mantendo o Manus perto do topo do ranking público em Nível 2 e 3, mesmo com a concorrência se aproximando no Nível 1.

**Ressalva importante:** uma auditoria da UC Berkeley RDI, publicada em abril de 2026, mostrou que benchmarks populares de agentes — incluindo o GAIA — podem ser "explorados" (gerar boa pontuação sem de fato resolver a tarefa subjacente) em praticamente todos os principais benchmarks do setor. Ou seja: números de benchmark divulgados por qualquer fornecedor (Manus incluído) devem ser vistos como direcionais, não como prova definitiva de capacidade.

---

## 12. Preços e sistema de créditos (2026)

O Manus usa um modelo baseado em **créditos**: cada ação (busca, geração de imagem, tarefa de pesquisa, slide) consome uma quantidade variável de créditos conforme a complexidade computacional.

| Plano | Preço | Créditos mensais | Observações |
|---|---|---|---|
| **Free** | US$ 0 | 300 créditos/dia (renovam diariamente) | + 1.000 créditos de boas-vindas (uso único); 1 tarefa simultânea |
| **Pro** | US$ 20/mês | 4.000 | |
| **Pro** | US$ 40/mês | 8.000 | |
| **Pro** | US$ 200/mês | 40.000 | Todos os planos pagos incluem 300 créditos/dia extras e até 20 tarefas simultâneas/agendadas |
| **Team** | a partir de US$ 20/assento/mês (mín. 2 assentos) | — | Inclui SSO, analytics, controles de acesso, templates de slides compartilhados |

- Cobrança anual: 17% de desconto.
- Créditos mensais **não acumulam** para o mês seguinte; créditos comprados avulsos só continuam válidos enquanto a assinatura paga estiver ativa.
- Como referência de consumo: uma busca simples consome ~10-20 créditos; uma tarefa de pesquisa multi-etapas com navegador e relatório formatado pode consumir 200-900 créditos.
- A nomenclatura antiga (Basic/Plus/Pro ou Free/Standard/Customizable/Extended) foi simplificada para **Free/Pro/Team** no início de 2026 — assinantes antigos mantêm o preço original até fazerem upgrade/downgrade.
- **Atenção:** a Manus recomenda checar a página oficial de preços antes de qualquer decisão de compra, pois os valores mudam com frequência.

---

## 13. Principais funcionalidades do produto

- **Wide Research** (jul/2025) — em vez de 1 agente pesquisando sequencialmente ("Deep Research", modelo usado por concorrentes), o Manus dispara **100+ subagentes em paralelo**, cada um numa VM própria, processando um item cada (ex.: comparar 100 tênis, gerar 50 designs de pôster). Os subagentes **não conversam entre si** (evita poluição de contexto e alucinação); um agente principal distribui as tarefas e consolida os resultados no final.
- **Web App Builder** — cria aplicações web full-stack (frontend + backend + banco de dados + autenticação) a partir de descrição em linguagem natural, com deploy incluso (sem precisar configurar AWS/Vercel/Netlify separadamente).
- **Mobile App Builder / App Publishing** (jan/2026) — gera apps nativos iOS/Android a partir de descrição, empacota o build (AAB para Android, upload para TestFlight no iOS) — o usuário ainda precisa de conta de desenvolvedor Apple/Google para publicar de fato nas lojas.
- **Manus Slides**, **AI Image Generator**, **AI Music Generator**, **Design View** (geração/edição interativa de imagem).
- **Manus API** — API REST para desenvolvedores integrarem as capacidades completas do agente (pesquisa, análise, criação de conteúdo, processamento de dados) em seus próprios produtos e workflows.
- **Connectors** (a partir de set/2025) — integrações com Gmail, Google Calendar, Notion, Slack, WhatsApp, Telegram e outros.
- **Scheduled Tasks** (com "2.0" em 2026) — tarefas recorrentes agendadas.
- **Browser Operator** (beta, nov/2025) — automação local no Chrome/Edge do próprio usuário.
- Suporte à criação de "Manus Pages" (páginas web publicáveis a partir de MDX).

---

## 14. Linha do tempo de lançamentos de recursos

| Data | Recurso |
|---|---|
| 31/jul/2025 | Wide Research (100+ agentes paralelos) |
| 15/set/2025 | Connectors |
| 17/out/2025 | Manus 1.5 — web app builder no-code, contexto "ilimitado" |
| 6/nov/2025 | Templates de PowerPoint para Slides |
| 19/nov/2025 | Browser Operator (beta) |
| 15/dez/2025 | Manus 1.6 / 1.6 Max — ganhos de desempenho, Design View |
| 20/jan/2026 | App publishing mobile (Google Play / TestFlight) |
| 16-18/fev/2026 | Agentes completos dentro do Telegram |
| 17/mar/2026 | "My Computer" — execução local em macOS/Windows |
| Mai/2026 | Scheduled Tasks 2.0, novos connectors (Gmail, Calendar, Notion) |

---

## 15. Projetos "clone" e open source relacionados

**Importante: nada disso é oficial da Manus.** São reconstruções feitas pela comunidade:

- **`manus-open`** (GitHub, usuário whit3rabbit) — o runtime do sandbox **reconstruído a partir de bytecode** (com ajuda do próprio Claude 3.7) após o vazamento de março/2025. Roda em Docker, expõe uma API na porta 8330, usa uma versão modificada da biblioteca `browser_use`.
- **OpenManus** (vários forks: `FoundationAgents/OpenManus`, feito por ex-membros do time do MetaGPT; `henryalps/OpenManus`) — tentativas open source de replicar as capacidades do Manus usando LangChain/Docker/Playwright.
- **`Simpleyyt/ai-manus`** — outra reimplementação open source, com sandbox Docker + Chrome, multi-idioma.
- **OpenSandbox** — plataforma genérica de sandbox para agentes de IA (não é clone do Manus, mas categoria similar de infraestrutura).

O próprio cofundador Ji Yichao declarou, na época do vazamento, que a Manus **usa código open source e planeja abrir mais código no futuro** — mas até o momento desta pesquisa, o produto principal (orquestração + prompts + infraestrutura de produção) continua fechado.

---

## 16. A novela Meta × China × Tencent (2025-2026)

Esta é a parte mais "quente" e ainda em andamento da história do Manus:

1. **29-30/dez/2025:** Meta anuncia a aquisição do Manus por mais de US$ 2 bilhões. No anúncio, a Manus divulgou números de escala: mais de **147 trilhões de tokens processados** e mais de **80 milhões de "computadores virtuais"** criados desde o lançamento. O plano era o Manus continuar operando a partir de Singapura, mas encerrando operações na China; a Meta prometeu integrar a tecnologia ao Meta AI.
2. **Jan/2026:** o Ministério do Comércio chinês abre uma "investigação avaliativa" sobre o negócio, para checar se ele viola regras chinesas de controle de exportação, transferência de tecnologia e investimento estrangeiro. Executivos do Manus sob escrutínio recebem proibição de deixar o país.
3. **27-30/abr/2026:** a NDRC (Comissão Nacional de Desenvolvimento e Reforma) **ordena o desfazimento total do negócio**, alegando segurança nacional. Reguladores chineses argumentaram que os algoritmos centrais do Manus foram desenvolvidos domesticamente e que a mudança para Singapura era uma forma de driblar controles de exportação de tecnologia. Foi o primeiro uso confirmado publicamente desse mecanismo de revisão para barrar uma transação de IA transfronteiriça.
4. **11/jun/2026:** a Meta conclui a "separação operacional" — para de compartilhar dados com o Manus, corta a equipe do Manus do acesso a sistemas internos da Meta e proíbe funcionários da Meta de usarem ferramentas do Manus internamente.
5. **10-11/jul/2026:** a **Tencent entra em negociações para se tornar a maior acionista externa** do Manus, junto com os investidores originais (ZhenFund, HSG), num plano de recomprar a empresa da Meta por, no mínimo, os mesmos US$ 2 bilhões pagos. Um possível desfecho cogitado é uma estrutura de joint venture com abertura de capital (IPO) em Hong Kong.

**Situação até a data desta pesquisa (29/jul/2026):** o desfecho final (quem vai ser dono do Manus) ainda não está fechado publicamente — é possível que já tenha havido novidades depois desta pesquisa, vale checar fontes atualizadas se isso for importante para você. Curiosamente, mesmo em meio a esse imbróglio, o rodapé do site oficial (manus.im) ainda exibia "© 2026 Meta" no momento da pesquisa, e o blog oficial do Manus ainda tinha como post fixo "Manus is joining Meta" — sinal de que a reversão pública/de marca ainda não tinha sido totalmente atualizada no site.

---

## 17. Privacidade, segurança e críticas

- Desde o lançamento (mar/2025), analistas levantaram preocupações de privacidade dado o histórico chinês da empresa, em comparações diretas com o caso DeepSeek.
- Pesquisadores de segurança relataram já ter rastreado tráfego de dados até servidores em Shenzhen, na China — em contraste com o discurso oficial de sede em Singapura.
- A política de privacidade da empresa foi criticada por parecer gerada por IA (seções genéricas do tipo "O que é o GDPR", pouco específicas sobre as práticas reais da empresa).
- A Manus afirma, em sua política, **não usar prompts privados nem resultados de tarefas dos usuários para treinar seus modelos-base**, podendo usar apenas dados agregados/anonimizados de uso.
- Pelo menos um órgão governamental (nos EUA) baniu o uso do Manus em redes governamentais, citando risco de acesso a dados sob as leis chinesas.
- O próprio bloqueio da aquisição pela Meta (seção 16) cita explicitamente riscos ligados a dados, tecnologia e fluxo de capital transfronteiriço como justificativa oficial.
- Contas de usuário podem ser suspensas automaticamente por sistemas de detecção de "comportamento de risco" (múltiplas contas gratuitas no mesmo IP, convites fraudulentos, abuso de API) — há relatos de suspensões que resultaram em perda de trabalho em andamento.
- Recomendação de bom senso: evitar enviar dados sensíveis/confidenciais ao Manus, tratando-o como um assistente de nuvem, não como armazenamento seguro.

---

## 18. Lições práticas para quem quer construir algo parecido

Com base no que a própria equipe do Manus divulgou publicamente sobre suas decisões de arquitetura:

1. **Escolha de modelo de base é sobre planejamento de longo horizonte, não só qualidade de resposta.** A equipe testou vários modelos antes de escolher o Claude especificamente porque ele "aguentava" loops de 30-50 passos sem encerrar prematuramente — isso é diferente de avaliar um modelo por benchmarks de resposta única.
2. **VM completa por tarefa > function calling isolado.** Dar ao agente um computador de verdade (sistema de arquivos, terminal, navegador renderizado) abre um espaço de tarefas muito maior do que uma lista fixa de ferramentas de API.
3. **"Thought injection" antes de cada chamada de ferramenta** (um mini-agente de raciocínio que roda antes de decidir qual tool usar) melhorou bastante a precisão de tool-calling, antes mesmo de os modelos terem "extended thinking" nativo — pode valer a pena implementar algo assim mesmo com modelos que já pensam nativamente.
4. **Menos estrutura, mais contexto.** Em vez de agentes especializados fixos (um "coder agent", um "search agent"), considere um agente único com acesso rico a ferramentas e contexto — segundo a equipe do Manus, isso permite que capacidades novas "emerjam" conforme os modelos de base melhoram, sem retrabalho de engenharia.
5. **Execução 100% em nuvem** (em vez de local) elimina a necessidade de pedir permissão a cada ação (já que não há risco de quebrar a máquina do usuário) e permite fluxo "dispare e esqueça".
6. **Wide Research (paralelismo) resolve limite de contexto** de forma mais simples do que tentar caber tudo numa janela de contexto gigante: cada item processado em paralelo, por um subagente com contexto próprio e "limpo", sem comunicação cruzada entre subagentes.
7. **Custo é um fator real desde o dia 1** — a Manus gastou cerca de US$ 1 milhão em chamadas de API da Claude nos primeiros 14 dias após o lançamento. Modelo de créditos/consumo variável é a forma como eles resolveram isso no lado da precificação.

---

## 19. Fontes principais

- Prompt de sistema vazado (gist original): `gist.github.com/jlia0/db0a9695b3ca7609c9b1a08dcbf872c9`
- Lista completa de ferramentas: repositório `x1xhlol/system-prompts-and-models-of-ai-tools` (pasta "Manus Agent Tools & Prompt"), GitHub
- Reconstrução do sandbox: `github.com/whit3rabbit/manus-open`
- Wikipedia (inglês): "Manus (AI agent)"
- Comunicado oficial da AWS (dez/2025) sobre a parceria de infraestrutura
- Case study técnico (ZenML LLMOps Database) sobre a arquitetura de VMs e escolha de modelo
- Reportagens: Bloomberg, Reuters, CGTN, Asia Times, SiliconANGLE, Sacra, Tracxn, PitchBook, sobre financiamento e a disputa Meta-China-Tencent
- Documentação oficial: manus.im/docs (preços, Wide Research, API, app publishing)
- Benchmark GAIA: divulgação oficial da Manus + relatório da UC Berkeley RDI sobre exploração de benchmarks (abr/2026)

---

*Este documento foi compilado a partir de fontes públicas — parte delas vazamentos/engenharia reversa não confirmados oficialmente, parte delas comunicados e documentação oficial. A situação societária do Manus (seção 16) está mudando rapidamente; trate a data de qualquer informação de "quem é dono" com cautela e reconfirme se isso for crítico para alguma decisão sua.*
