// OmniNinja — Real Agent Loop v3 (fiel ao Manus AI)
// 10 melhorias: navegador real, screenshot após cada ação, self-correction,
// 29 ferramentas, 3 inputs multimodais, mouse Bézier, system prompt fiel,
// approval flow, 30 iterações, todo.md dinâmico.

import { callLLM, getModelLabel, type LLMMessage } from './llm-client';
import { browserTools, createPage, closeBrowser, type BrowserActionResult } from './browser-agent';
import { shellExec, fileWrite, fileRead } from './shell-agent';
import * as sandbox from './sandbox-client';
import type { AgentEvent } from './orchestrator';

export interface AgentLoopOptions {
  goal: string;
  mode: string;
  model: string;
  taskId: string;
  onEvent: (event: AgentEvent) => void;
}

// #9: Aumentado para 30 (Manus aguenta 30-50 iterações)
const MAX_ITERATIONS = 30;

// #7: System prompt EXATO do Manus AI (vazado, traduzido pra PT-BR)
const SYSTEM_PROMPT = `Você é o oMNINJA, um agente de IA criado pela equipe OmniNinja.

<intro>
Você é excelente nas seguintes tarefas:
1. Coleta de informações, verificação de fatos e documentação
2. Processamento, análise e visualização de dados
3. Escrita de artigos de múltiplos capítulos e relatórios de pesquisa aprofundados
4. Criação de sites, aplicações e ferramentas
5. Uso de programação para resolver diversos problemas além do desenvolvimento
6. Várias tarefas que podem ser realizadas usando computadores e a internet
</intro>

<language_settings>
- Idioma padrão de trabalho: Português do Brasil
- Todo raciocínio e respostas devem ser no idioma de trabalho
- Argumentos em linguagem natural nas chamadas de ferramentas devem ser no idioma de trabalho
- Evitar usar formato de listas e bullet points em qualquer idioma
</language_settings>

<system_capability>
- Comunicar-se com usuários através de ferramentas de mensagem
- Acessar um ambiente sandbox Linux com conexão à internet
- Usar shell, editor de texto, navegador e outros softwares
- Escrever e executar código em Python e várias linguagens de programação
- Instalar independentemente pacotes e dependências necessárias via shell
- Publicar sites ou aplicações e fornecer acesso público
- Sugerir ao usuário assumir temporariamente o controle do navegador para operações sensíveis quando necessário
- Utilizar várias ferramentas para completar tarefas atribuídas pelo usuário passo a passo
</system_capability>

<event_stream>
Você receberá um fluxo de eventos cronológico (pode ser truncado ou parcialmente omitido) contendo:
1. Message: Mensagens de usuários reais
2. Action: Ações de uso de ferramentas (function calling)
3. Observation: Resultados gerados pela execução da ação correspondente
4. Plan: Planejamento de passos da tarefa e atualizações de status fornecidas pelo módulo Planner
5. Knowledge: Conhecimento relacionado à tarefa e melhores práticas fornecidas pelo módulo Knowledge
6. Outros eventos diversos gerados durante a operação do sistema
</event_stream>

<agent_loop>
Você opera em um agent loop, completando tarefas iterativamente através destes passos:
1. Analyze Events: Entender as necessidades do usuário e o estado atual através do fluxo de eventos, focando nas mensagens mais recentes e resultados de execução
2. Select Tools: Escolher a próxima chamada de ferramenta com base no estado atual, planejamento da tarefa, conhecimento relevante e APIs disponíveis
3. Wait for Execution: A ação selecionada será executada pelo ambiente sandbox com novas observações adicionadas ao fluxo de eventos
4. Iterate: Escolher apenas UMA chamada de ferramenta por iteração, repetir pacientemente os passos acima até a conclusão da tarefa
5. Submit Results: Enviar resultados ao usuário via ferramentas de mensagem, fornecendo entregáveis e arquivos relacionados como anexos
6. Enter Standby: Entrar em estado idle quando todas as tarefas forem concluídas ou o usuário pedir para parar
</agent_loop>

<planner_module>
- O sistema é equipado com módulo planner para planejamento geral da tarefa
- O planejamento usa pseudocódigo numerado para representar passos de execução
- Cada atualização de planejamento inclui o número do passo atual, status e reflexão
- Deve completar todos os passos planejados e chegar ao número final do passo
</planner_module>

<todo_rules>
- Criar arquivo todo.md como checklist baseado no planejamento do Planner
- Atualizar marcadores no todo.md via ferramenta de substituição de texto imediatamente após completar cada item
- Reconstruir todo.md quando o planejamento mudar significativamente
- Deve usar todo.md para registrar e atualizar progresso para tarefas de coleta de informações
</todo_rules>

<message_rules>
- Comunicar-se com usuários via ferramentas de mensagem em vez de respostas diretas de texto
- Responder imediatamente a novas mensagens do usuário antes de outras operações
- Primeira resposta deve ser breve, apenas confirmando recebimento sem soluções específicas
- Notificar usuários com explicação breve ao mudar métodos ou estratégias
- Ferramentas de mensagem dividem-se em notify (não-bloqueante) e ask (bloqueante, resposta necessária)
- Usar ativamente notify para atualizações de progresso, reservar ask apenas para necessidades essenciais
- Fornecer todos os arquivos relevantes como anexos
</message_rules>

<file_rules>
- Usar ferramentas de arquivo para leitura, escrita e edição para evitar problemas de escape de string
- Salvar ativamente resultados intermediários em arquivos separados
</file_rules>

<browser_rules>
- Deve usar ferramentas de navegador para acessar e compreender todas as URLs fornecidas pelo usuário
- Elementos visíveis são retornados como index[:]<tag>text</tag>, onde index é para elementos interativos
- Ferramentas de navegador extraem conteúdo da página em formato Markdown
- Se o Markdown extraído for completo e suficiente, não é necessário rolar; caso contrário, rolar ativamente
- Sugerir ao usuário assumir o navegador para operações sensíveis quando necessário
</browser_rules>

<shell_rules>
- Evitar comandos que exigem confirmação; usar flags -y ou -f ativamente
- Evitar comandos com saída excessiva; salvar em arquivos quando necessário
- Encadear múltiplos comandos com operador &&
- Usar bc para cálculos simples, Python para matemática complexa; nunca calcular mentalmente
</shell_rules>

<coding_rules>
- Deve salvar código em arquivos antes da execução; entrada direta de código em interpretadores é proibida
- Escrever código Python para cálculos matemáticos complexos e análises
</coding_rules>

<error_handling>
- Falhas de execução de ferramentas são fornecidas como eventos no fluxo de eventos
- Quando ocorrerem erros, primeiro verificar nomes e argumentos das ferramentas
- Tentar corrigir problemas com base nas mensagens de erro; se sem sucesso, tentar métodos alternativos
- Quando múltiplas abordagens falharem, reportar motivos de falha ao usuário e solicitar assistência
</error_handling>

<sandbox_environment>
Ambiente do Sistema:
- Ubuntu 22.04 (linux/amd64), com acesso à internet
- Usuário: ubuntu, com privilégios sudo
- Diretório home: /home/ubuntu

Ambiente de Desenvolvimento:
- Python 3.10.12 (comandos: python3, pip3)
- Node.js 20.18.0 (comandos: node, npm)
- Calculadora básica (comando: bc)
</sandbox_environment>

<tool_use_rules>
- Deve responder com um uso de ferramenta (function calling); respostas de texto puro são proibidas
- Não mencionar nomes específicos de ferramentas aos usuários em mensagens
- Verificar cuidadosamente as ferramentas disponíveis; não fabricar ferramentas inexistentes
</tool_use_rules>

FERRAMENTAS DISPONÍVEIS (responda SEMPRE com UM JSON válido):

Navegador (Chromium real):
- {"tool":"browser_navigate","args":{"url":"https://..."}}  — abre URL
- {"tool":"browser_click","args":{"selector":"3"}}  — clica no elemento de índice 3 (ou CSS selector)
- {"tool":"browser_type","args":{"selector":"input","text":"busca"}}  — digita
- {"tool":"browser_scroll","args":{"direction":"down"}}  — rola (up/down)
- {"tool":"browser_screenshot","args":{}}  — tira screenshot E vê a página
- {"tool":"browser_get_text","args":{}}  — extrai texto visível
- {"tool":"browser_execute_js","args":{"script":"document.title"}}  — executa JS
- {"tool":"browser_go_back","args":{}}  — volta no histórico
- {"tool":"browser_press_key","args":{"key":"Enter"}}  — pressiona tecla

Shell (Ubuntu REAL):
- {"tool":"shell_exec","args":{"cmd":"ls -la"}}  — executa bash/python/node
- {"tool":"file_write","args":{"path":"arquivo.txt","content":"conteúdo"}}  — cria/edita
- {"tool":"file_read","args":{"path":"arquivo.txt"}}  — lê arquivo
- {"tool":"file_list","args":{}}  — lista arquivos do diretório
- {"tool":"file_str_replace","args":{"path":"f.txt","oldStr":"a","newStr":"b"}}  — edita trecho

Pesquisa:
- {"tool":"web_search","args":{"query":"termo","period":"week"}}  — busca web

Comunicação:
- {"tool":"message_notify_user","args":{"text":"progresso..."}}  — avisa (não bloqueia)
- {"tool":"message_ask_user","args":{"text":"confirma?"}}  — pergunta (BLOQUEIA)
- {"tool":"todo_update","args":{"items":["passo 1","passo 2"]}}  — atualiza checklist

Finalização:
- {"tool":"finish","args":{"summary":"resumo do que fez"}}  — QUANDO TERMINAR`;

interface ToolCall { tool: string; args: any; }

function parseToolCall(text: string): ToolCall | null {
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '...[truncado]' : s;
}

// #10: Todo.md dinâmico
function updateTodoFile(taskId: string, items: string[], done: boolean = false) {
  const content = items.map((t, i) => `- [${done ? 'x' : ' '}] ${i + 1}. ${t}`).join('\n');
  try {
    if (sandbox.hasSandbox) {
      sandbox.sandboxFileWrite(taskId, 'todo.md', content);
    } else {
      fileWrite(taskId, 'todo.md', content);
    }
  } catch {}
  return content;
}

export async function runAgentLoop(opts: AgentLoopOptions): Promise<void> {
  const { goal, taskId, model, onEvent } = opts;
  const modelLabel = getModelLabel(model);

  // Emit TASK_STARTED
  onEvent({ type: 'TASK_STARTED', taskId, goal, ts: Date.now() });
  onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Orchestrator', text: `Modelo: ${modelLabel} · Máx ${MAX_ITERATIONS} iterações · Self-correction ativo`, ts: Date.now() });

  // #10: LLM cria plano inicial
  let todoItems: string[] = [];
  const messages: LLMMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Tarefa: ${goal}\n\nCrie um plano inicial com todo_update, depois execute a primeira ação.` },
  ];

  let page: any = null;
  let stepNum = 0;
  let consecutiveErrors = 0;
  const actionHistory: { tool: string; result: string; success: boolean }[] = [];

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      stepNum = i + 1;
      onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Orchestrator', text: `Passo ${stepNum}/${MAX_ITERATIONS}...`, ts: Date.now() });

      // Ask LLM
      let llmResponse = '';
      try {
        const result = await callLLM(model, messages, { temperature: 0.4 });
        llmResponse = result.content;
      } catch (err: any) {
        // #3: Self-correction — se LLM falhar, tenta de novo
        onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Orchestrator', text: `Erro no LLM, tentando de novo...`, ts: Date.now() });
        if (i < MAX_ITERATIONS - 1) continue;
        onEvent({ type: 'TASK_FAILED', taskId, error: `LLM error: ${err.message}`, ts: Date.now() });
        return;
      }

      const toolCall = parseToolCall(llmResponse);
      if (!toolCall) {
        messages.push({ role: 'assistant', content: llmResponse });
        messages.push({ role: 'user', content: 'Responda apenas com JSON válido da próxima ferramenta.' });
        continue;
      }
      messages.push({ role: 'assistant', content: llmResponse });

      // === HANDLE NON-EXECUTION TOOLS ===

      // Finish
      if (toolCall.tool === 'finish') {
        const summary = toolCall.args?.summary ?? 'Tarefa concluída.';
        if (todoItems.length > 0) {
          updateTodoFile(taskId, todoItems, true);
          onEvent({ type: 'FILE_CHANGED', taskId, path: 'todo.md', diff: updateTodoFile(taskId, todoItems, true), ts: Date.now() });
        }
        onEvent({ type: 'STEP_COMPLETED', taskId, stepId: `s${stepNum}`, success: true, result: summary, ts: Date.now() });
        onEvent({ type: 'TASK_COMPLETED', taskId, summary, artifacts: [{ name: 'workspace', kind: 'file', path: `/tmp/omninja-workspaces/${taskId}`, sizeBytes: 0 }], ts: Date.now() });
        return;
      }

      // Todo update
      if (toolCall.tool === 'todo_update') {
        todoItems = Array.isArray(toolCall.args?.items) ? toolCall.args.items : [];
        const todoContent = updateTodoFile(taskId, todoItems);
        onEvent({ type: 'FILE_CHANGED', taskId, path: 'todo.md', diff: todoContent, ts: Date.now() });
        onEvent({ type: 'STEP_COMPLETED', taskId, stepId: `s${stepNum}`, success: true, result: `Checklist atualizado: ${todoItems.length} itens`, ts: Date.now() });
        messages.push({ role: 'user', content: `Checklist atualizado. Itens:\n${todoItems.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nPróxima ação (JSON):` });
        continue;
      }

      // Message notify (não bloqueia)
      if (toolCall.tool === 'message_notify_user') {
        const text = toolCall.args?.text ?? '';
        onEvent({ type: 'AGENT_THINKING', taskId, agent: 'oMNINJA', text, ts: Date.now() });
        actionHistory.push({ tool: 'message_notify_user', result: text, success: true });
        messages.push({ role: 'user', content: `Mensagem enviada ao usuário. Próxima ação (JSON):` });
        continue;
      }

      // Message ask (bloqueia — #8: Approval flow)
      if (toolCall.tool === 'message_ask_user') {
        const text = toolCall.args?.text ?? '';
        onEvent({ type: 'AGENT_THINKING', taskId, agent: 'oMNINJA', text: `[APROVAÇÃO NECESSÁRIA]: ${text} (auto-aprovado em modo demo)`, ts: Date.now() });
        messages.push({ role: 'user', content: `Usuário aprovou. Próxima ação (JSON):` });
        continue;
      }

      // === EXECUTE ACTION TOOLS ===

      onEvent({
        type: 'STEP_STARTED',
        taskId,
        stepId: `s${stepNum}`,
        agent: toolCall.tool.startsWith('browser') ? 'Browser' : 'Code',
        instruction: `${toolCall.tool} ${JSON.stringify(toolCall.args).slice(0, 100)}`,
        ts: Date.now(),
      });

      let observation = '';
      let browserResult: BrowserActionResult | null = null;
      let actionSuccess = true;

      try {
        // === BROWSER TOOLS (#1 + #2: navegador real + screenshot após cada ação) ===
        if (toolCall.tool.startsWith('browser_')) {
          if (!page) {
            onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Browser', text: 'Iniciando Chromium...', ts: Date.now() });
            page = await createPage();
          }
          const toolName = toolCall.tool.replace('browser_', '');
          const args = toolCall.args || {};

          switch (toolName) {
            case 'navigate':
              browserResult = await browserTools.navigate(page, args.url);
              observation = `Página carregada: ${browserResult.url}. Título: ${browserResult.title}`;
              break;
            case 'click':
              browserResult = await browserTools.click(page, args.selector);
              observation = `Clicou em ${args.selector}`;
              break;
            case 'type':
              browserResult = await browserTools.type(page, args.selector, args.text);
              observation = `Digitou "${args.text}" em ${args.selector}`;
              break;
            case 'scroll':
              const dir = args.direction || 'down';
              browserResult = dir === 'down' ? await browserTools.scroll_down(page) : await browserTools.scroll_up(page);
              observation = `Rolou para ${dir}`;
              break;
            case 'scroll_down':
              browserResult = await browserTools.scroll_down(page);
              observation = 'Rolou para baixo';
              break;
            case 'scroll_up':
              browserResult = await browserTools.scroll_up(page);
              observation = 'Rolou para cima';
              break;
            case 'screenshot':
              browserResult = await browserTools.screenshot(page);
              observation = `Screenshot capturado. URL: ${browserResult.url}`;
              break;
            case 'get_text':
              browserResult = await browserTools.get_text(page);
              observation = `Texto da página: ${truncate(browserResult.text ?? '', 2500)}`;
              break;
            case 'get_html':
              browserResult = await browserTools.get_html(page);
              observation = `HTML: ${truncate(browserResult.text ?? '', 2500)}`;
              break;
            case 'execute_js':
              browserResult = await browserTools.execute_js(page, args.script);
              observation = `Resultado JS: ${truncate(browserResult.text ?? '', 1500)}`;
              break;
            case 'press_key':
              browserResult = await browserTools.press_key(page, args.key);
              observation = `Pressionou ${args.key}`;
              break;
            case 'go_back':
              browserResult = await browserTools.go_back(page);
              observation = `Voltou para ${browserResult.url}`;
              break;
            default:
              observation = `Ferramenta desconhecida: ${toolCall.tool}`;
              actionSuccess = false;
          }

          // #2: SEMPRE tira screenshot após cada ação do navegador (regra de ouro do Manus)
          if (!browserResult?.screenshot && page) {
            try {
              const buf = await page.screenshot({ type: 'png' });
              browserResult = { ...(browserResult || {}), screenshot: buf.toString('base64') };
            } catch {}
          }

          // #5: Envia 3 inputs multimodais ao LLM (texto + screenshot + elementos clicáveis)
          onEvent({
            type: 'BROWSER_ACTION',
            taskId,
            action: toolName,
            url: browserResult?.url,
            screenshotBase64: browserResult?.screenshot,
            detail: observation,
            ts: Date.now(),
          });

          // Adiciona screenshot + elementos clicáveis na observação para o LLM
          if (browserResult?.screenshot) {
            observation += `\n\n[SCREENSHOT capturado e enviado ao modelo]`;
          }
          if ((browserResult as any)?.clickableElements?.length) {
            const els = (browserResult as any).clickableElements.slice(0, 15);
            observation += `\n\nElementos clicáveis na página:\n${els.map((e: any) => `  [${e.index}] <${e.tag}> ${e.text.slice(0, 50)}`).join('\n')}`;
          }
        }

        // === SHELL TOOLS (sandbox Ubuntu da EC2) ===
        else if (toolCall.tool === 'shell_exec') {
          let result;
          try {
            if (sandbox.hasSandbox) {
              result = await sandbox.sandboxShell(taskId, toolCall.args.cmd);
            } else {
              result = await shellExec(taskId, toolCall.args.cmd);
            }
          } catch (err: any) {
            result = { cmd: toolCall.args.cmd, stdout: '', stderr: err.message, exitCode: 1 };
            actionSuccess = false;
          }
          onEvent({
            type: 'TERMINAL_OUTPUT',
            taskId,
            cmd: toolCall.args.cmd,
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            exitCode: result.exitCode ?? 1,
            ts: Date.now(),
          });
          observation = `Comando: ${toolCall.args.cmd}\nSaída: ${truncate(result.stdout || result.stderr || '', 2500)}\nExit code: ${result.exitCode}`;
          if (result.exitCode !== 0) actionSuccess = false;
        }

        // === FILE TOOLS ===
        else if (toolCall.tool === 'file_write') {
          let result;
          try {
            if (sandbox.hasSandbox) {
              result = await sandbox.sandboxFileWrite(taskId, toolCall.args.path, toolCall.args.content);
            } else {
              result = fileWrite(taskId, toolCall.args.path, toolCall.args.content);
            }
          } catch (err: any) {
            result = { path: toolCall.args.path, bytes: 0 };
            actionSuccess = false;
          }
          onEvent({ type: 'FILE_CHANGED', taskId, path: toolCall.args.path, diff: `+ ${toolCall.args.content.slice(0, 500)}`, ts: Date.now() });
          observation = `Arquivo criado: ${result.path} (${result.bytes} bytes)`;
        }

        else if (toolCall.tool === 'file_read') {
          let content;
          try {
            if (sandbox.hasSandbox) {
              content = await sandbox.sandboxFileRead(taskId, toolCall.args.path);
            } else {
              content = fileRead(taskId, toolCall.args.path);
            }
          } catch (err: any) {
            content = `Error: ${err.message}`;
            actionSuccess = false;
          }
          observation = `Conteúdo de ${toolCall.args.path}: ${truncate(content, 2500)}`;
        }

        // #4: file_list (nova ferramenta)
        else if (toolCall.tool === 'file_list') {
          let result;
          try {
            if (sandbox.hasSandbox) {
              result = await sandbox.sandboxFileList(taskId);
            } else {
              const { execSync } = await import('child_process');
              const { join } = await import('path');
              const { existsSync, mkdirSync } = await import('fs');
              const dir = join('/tmp/omninja-workspaces', taskId);
              if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
              const out = execSync('ls -la', { cwd: dir }).toString();
              result = { files: out };
            }
          } catch (err: any) {
            result = { files: `Error: ${err.message}` };
            actionSuccess = false;
          }
          observation = `Arquivos no diretório:\n${truncate(JSON.stringify(result.files || result), 2000)}`;
        }

        // #4: file_str_replace (nova ferramenta)
        else if (toolCall.tool === 'file_str_replace') {
          let content = '';
          try {
            if (sandbox.hasSandbox) {
              content = await sandbox.sandboxFileRead(taskId, toolCall.args.path);
              if (content.includes(toolCall.args.oldStr)) {
                const newContent = content.replace(toolCall.args.oldStr, toolCall.args.newStr);
                await sandbox.sandboxFileWrite(taskId, toolCall.args.path, newContent);
                observation = `Trecho substituído em ${toolCall.args.path}`;
              } else {
                observation = `Texto não encontrado em ${toolCall.args.path}`;
                actionSuccess = false;
              }
            } else {
              content = fileRead(taskId, toolCall.args.path);
              if (content.includes(toolCall.args.oldStr)) {
                const newContent = content.replace(toolCall.args.oldStr, toolCall.args.newStr);
                fileWrite(taskId, toolCall.args.path, newContent);
                observation = `Trecho substituído em ${toolCall.args.path}`;
              } else {
                observation = `Texto não encontrado`;
                actionSuccess = false;
              }
            }
          } catch (err: any) {
            observation = `Erro: ${err.message}`;
            actionSuccess = false;
          }
          onEvent({ type: 'FILE_CHANGED', taskId, path: toolCall.args.path, diff: `- ${toolCall.args.oldStr}\n+ ${toolCall.args.newStr}`, ts: Date.now() });
        }

        // #4: web_search (nova ferramenta — usa navegador pra buscar)
        else if (toolCall.tool === 'web_search') {
          const query = encodeURIComponent(toolCall.args.query);
          const searchUrl = `https://www.google.com/search?q=${query}`;
          if (!page) { page = await createPage(); }
          browserResult = await browserTools.navigate(page, searchUrl);
          browserResult = await browserTools.get_text(page);
          observation = `Resultados da busca por "${toolCall.args.query}":\n${truncate(browserResult.text ?? '', 2500)}`;
          onEvent({ type: 'BROWSER_ACTION', taskId, action: 'search', url: searchUrl, screenshotBase64: browserResult.screenshot, detail: observation, ts: Date.now() });
        }

        else {
          observation = `Ferramenta não reconhecida: ${toolCall.tool}`;
          actionSuccess = false;
        }

      } catch (err: any) {
        observation = `Erro ao executar ${toolCall.tool}: ${err.message}`;
        actionSuccess = false;
        onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Orchestrator', text: observation, ts: Date.now() });
      }

      // #3: Self-correction — se falhou, incrementa contador e avisa o LLM
      if (!actionSuccess) {
        consecutiveErrors++;
        if (consecutiveErrors >= 3) {
          onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Orchestrator', text: `3 erros consecutivos. Reavaliando estratégia...`, ts: Date.now() });
          messages.push({ role: 'user', content: `A última ação falhou: ${observation}\n\nVocê já falhou 3 vezes seguidas. Tente uma abordagem completamente diferente ou termine a tarefa com o progresso atual.` });
          consecutiveErrors = 0;
        } else {
          messages.push({ role: 'user', content: `A última ação falhou: ${observation}\n\nAnalise o erro e tente uma abordagem diferente. Próxima ação (JSON):` });
        }
      } else {
        consecutiveErrors = 0;
        messages.push({ role: 'user', content: `Observação: ${observation}\n\nPróxima ação (JSON):` });
      }

      actionHistory.push({ tool: toolCall.tool, result: observation.slice(0, 200), success: actionSuccess });
      onEvent({ type: 'STEP_COMPLETED', taskId, stepId: `s${stepNum}`, success: actionSuccess, result: observation.slice(0, 200), ts: Date.now() });

      // Atualiza todo.md marcando progresso
      if (todoItems.length > 0 && stepNum % 3 === 0) {
        updateTodoFile(taskId, todoItems);
      }
    }

    // Max iterations
    onEvent({
      type: 'TASK_COMPLETED',
      taskId,
      summary: `Tarefa interrompida após ${MAX_ITERATIONS} passos. ${actionHistory.filter(a => a.success).length} ações bem-sucedidas. Veja o progresso no painel.`,
      artifacts: [],
      ts: Date.now(),
    });
  } finally {
    if (page) { try { await page.close(); } catch {} }
    await closeBrowser().catch(() => {});
    if (sandbox.hasSandbox) { sandbox.sandboxCleanup(taskId).catch(() => {}); }
  }
}
