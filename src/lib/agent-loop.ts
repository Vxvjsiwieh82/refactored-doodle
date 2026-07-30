// OmniNinja — Real Agent Loop (Seção 3)
// The Orchestrator: uses LLM to decide which tool to call, executes it,
// feeds the observation back, repeats until task is done.
// This is the REAL Manus-style agent loop (analyze → select tool → execute → iterate).

import ZAI from 'z-ai-web-dev-sdk';
import { browserTools, createPage, closeBrowser, type BrowserActionResult } from './browser-agent';
import { shellExec, fileWrite, fileRead } from './shell-agent';
import type { AgentEvent } from './orchestrator';

export interface AgentLoopOptions {
  goal: string;
  mode: string; // chat | agent | agent_max
  model: string;
  taskId: string;
  onEvent: (event: AgentEvent) => void;
}

const MAX_ITERATIONS = 12;

const SYSTEM_PROMPT = `Você é o OmniNinja, um orquestrador de agentes de IA autônomo (estilo Manus AI). Você recebe uma tarefa e decide qual ferramenta usar a cada passo.

FERRAMENTAS DISPONÍVEIS (responda SEMPRE em JSON válido):

1. {"tool":"browser_navigate","args":{"url":"https://..."}}  — abre uma URL no navegador real
2. {"tool":"browser_click","args":{"selector":"button.submit"}}  — clica num elemento CSS
3. {"tool":"browser_type","args":{"selector":"input[name=q]","text":"busca"}}  — digita num campo
4. {"tool":"browser_scroll_down","args":{}}  — rola a página pra baixo
5. {"tool":"browser_screenshot","args":{}}  — tira screenshot e vê a página
6. {"tool":"browser_get_text","args":{}}  — extrai texto visível da página
7. {"tool":"browser_execute_js","args":{"script":"document.title"}}  — executa JavaScript
8. {"tool":"shell_exec","args":{"cmd":"ls -la"}}  — executa comando bash/python/node REAL
9. {"tool":"file_write","args":{"path":"arquivo.txt","content":"conteúdo"}}  — cria arquivo
10. {"tool":"file_read","args":{"path":"arquivo.txt"}}  — lê arquivo
11. {"tool":"finish","args":{"summary":"resumo do que fez"}}  — QUANDO TERMINAR a tarefa

REGRAS:
- Responda SEMPRE com UM JSON válido, nada mais (sem markdown, sem explicação fora do JSON).
- Após cada ação, você recebe a observação (resultado). Decida a próxima.
- Máximo ${MAX_ITERATIONS} ações. Se não conseguir terminar, use "finish" com o progresso.
- Seja eficiente: não navegue sem propósito, não rode comandos desnecessários.
- Para criar sites/código: use file_write com o código completo.
- Para pesquisar: use browser_navigate em sites relevantes, depois browser_get_text.
- Sempre em português nos resumos.`;

interface ToolCall {
  tool: string;
  args: any;
}

function parseToolCall(text: string): ToolCall | null {
  // LLMs sometimes wrap JSON in code blocks or add prose. Extract the JSON.
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  // find the first { and last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  const jsonStr = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '...[truncado]' : s;
}

export async function runAgentLoop(opts: AgentLoopOptions): Promise<void> {
  const { goal, taskId, onEvent } = opts;
  const zai = await ZAI.create();

  // Emit TASK_STARTED + PLAN_CREATED
  onEvent({ type: 'TASK_STARTED', taskId, goal, ts: Date.now() });
  const planSteps = [
    { id: 's1', title: 'Analisar objetivo', agent: 'Chat' as const, instruction: goal },
    { id: 's2', title: 'Executar ações', agent: 'Code' as const, instruction: 'Usar ferramentas' },
    { id: 's3', title: 'Entregar resultado', agent: 'Memory' as const, instruction: 'Resumir' },
  ];
  onEvent({ type: 'PLAN_CREATED', taskId, steps: planSteps, ts: Date.now() });

  // Conversation history for the LLM
  const messages: any[] = [
    { role: 'assistant', content: SYSTEM_PROMPT },
    { role: 'user', content: `Tarefa: ${goal}\n\nDecida a primeira ação (responda em JSON):` },
  ];

  let page: any = null;
  let stepNum = 0;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      stepNum = i + 1;

      // Ask LLM what to do next
      onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Orchestrator', text: `Decidindo ação ${stepNum}...`, ts: Date.now() });

      let llmResponse = '';
      try {
        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: 'disabled' },
        } as any);
        llmResponse = completion?.choices?.[0]?.message?.content ?? '';
      } catch (err: any) {
        onEvent({ type: 'TASK_FAILED', taskId, error: `LLM error: ${err.message}`, ts: Date.now() });
        return;
      }

      const toolCall = parseToolCall(llmResponse);
      if (!toolCall) {
        // LLM didn't return valid JSON, ask again
        messages.push({ role: 'assistant', content: llmResponse });
        messages.push({ role: 'user', content: 'Responda apenas com JSON válido da próxima ferramenta.' });
        continue;
      }

      messages.push({ role: 'assistant', content: llmResponse });

      // Check if finished
      if (toolCall.tool === 'finish') {
        const summary = toolCall.args?.summary ?? 'Tarefa concluída.';
        onEvent({ type: 'STEP_COMPLETED', taskId, stepId: `s${stepNum}`, success: true, result: summary, ts: Date.now() });
        onEvent({
          type: 'TASK_COMPLETED',
          taskId,
          summary,
          artifacts: [{ name: 'workspace', kind: 'file', path: `/tmp/omninja-workspaces/${taskId}`, sizeBytes: 0 }],
          ts: Date.now(),
        });
        return;
      }

      onEvent({
        type: 'STEP_STARTED',
        taskId,
        stepId: `s${stepNum}`,
        agent: toolCall.tool.startsWith('browser') ? 'Browser' : toolCall.tool.startsWith('shell') ? 'Code' : 'Code',
        instruction: `${toolCall.tool} ${JSON.stringify(toolCall.args).slice(0, 100)}`,
        ts: Date.now(),
      });

      // Execute the tool
      let observation = '';
      let browserResult: BrowserActionResult | null = null;

      try {
        if (toolCall.tool.startsWith('browser_')) {
          if (!page) {
            onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Browser', text: 'Conectando ao Browserless...', ts: Date.now() });
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
              observation = `Texto da página: ${truncate(browserResult.text ?? '', 2000)}`;
              break;
            case 'get_html':
              browserResult = await browserTools.get_html(page);
              observation = `HTML: ${truncate(browserResult.text ?? '', 2000)}`;
              break;
            case 'execute_js':
              browserResult = await browserTools.execute_js(page, args.script);
              observation = `Resultado JS: ${truncate(browserResult.text ?? '', 1000)}`;
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
          }

          // Emit BROWSER_ACTION with screenshot
          onEvent({
            type: 'BROWSER_ACTION',
            taskId,
            action: toolName,
            url: browserResult.url,
            screenshotBase64: browserResult.screenshot,
            detail: observation,
            ts: Date.now(),
          });
        } else if (toolCall.tool === 'shell_exec') {
          const result = await shellExec(taskId, toolCall.args.cmd);
          onEvent({
            type: 'TERMINAL_OUTPUT',
            taskId,
            cmd: toolCall.args.cmd,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            ts: Date.now(),
          });
          observation = `Comando: ${toolCall.args.cmd}\nSaída: ${truncate(result.stdout || result.stderr, 2000)}\nExit code: ${result.exitCode}`;
        } else if (toolCall.tool === 'file_write') {
          const result = fileWrite(taskId, toolCall.args.path, toolCall.args.content);
          onEvent({
            type: 'FILE_CHANGED',
            taskId,
            path: toolCall.args.path,
            diff: `+ ${toolCall.args.content.slice(0, 500)}`,
            ts: Date.now(),
          });
          observation = `Arquivo criado: ${result.path} (${result.bytes} bytes)`;
        } else if (toolCall.tool === 'file_read') {
          const content = fileRead(taskId, toolCall.args.path);
          observation = `Conteúdo de ${toolCall.args.path}: ${truncate(content, 2000)}`;
        } else {
          observation = `Ferramenta não reconhecida: ${toolCall.tool}`;
        }
      } catch (err: any) {
        observation = `Erro ao executar ${toolCall.tool}: ${err.message}`;
        onEvent({ type: 'AGENT_THINKING', taskId, agent: 'Orchestrator', text: observation, ts: Date.now() });
      }

      onEvent({ type: 'STEP_COMPLETED', taskId, stepId: `s${stepNum}`, success: true, result: observation.slice(0, 200), ts: Date.now() });

      // Feed observation back to LLM
      messages.push({ role: 'user', content: `Observação: ${observation}\n\nPróxima ação (JSON):` });
    }

    // Max iterations reached
    onEvent({
      type: 'TASK_COMPLETED',
      taskId,
      summary: `Tarefa interrompida após ${MAX_ITERATIONS} ações. Veja o progresso no painel.`,
      artifacts: [],
      ts: Date.now(),
    });
  } finally {
    if (page) {
      try { await page.close(); } catch {}
    }
    await closeBrowser().catch(() => {});
  }
}
