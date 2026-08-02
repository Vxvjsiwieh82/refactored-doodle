'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useOmni } from '@/lib/store';
import { FileCode, Folder, ChevronRight, Terminal as TerminalIcon, Globe, Eye, Code2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Monaco Editor carregado dinamicamente (não roda no SSR)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <Loader2 className="h-5 w-5 animate-spin text-brand" />
    </div>
  ),
});

type ViewMode = 'auto' | 'code' | 'terminal' | 'browser' | 'preview';

export function ComputerPanel() {
  const task = useOmni((s) => s.currentTask);
  const live = useOmni((s) => s.live);
  const screenshot = useOmni((s) => s.currentTask?.currentScreenshot);
  const computerOpen = useOmni((s) => s.computerOpen);
  const setComputerOpen = useOmni((s) => s.setComputerOpen);
  const computerFullscreen = useOmni((s) => s.computerFullscreen);
  const toggleFs = useOmni((s) => s.toggleComputerFullscreen);

  const [viewMode, setViewMode] = useState<ViewMode>('auto');

  // Auto-detecta qual view mostrar baseado no último evento
  const lastBrowserEvent = useMemo(
    () => [...(task?.events ?? [])].reverse().find((e) => e.type === 'BROWSER_ACTION'),
    [task?.events]
  );
  const lastTerminalEvent = useMemo(
    () => [...(task?.events ?? [])].reverse().find((e) => e.type === 'TERMINAL_OUTPUT'),
    [task?.events]
  );
  const lastFileEvent = useMemo(
    () => [...(task?.events ?? [])].reverse().find((e) => e.type === 'FILE_CHANGED'),
    [task?.events]
  );

  // No modo auto, mostra a view do último evento
  const activeView: ViewMode = viewMode === 'auto'
    ? (lastBrowserEvent ? 'browser' : lastTerminalEvent ? 'terminal' : lastFileEvent ? 'code' : 'code')
    : viewMode;

  // Status text (o que o agente está fazendo agora)
  const statusText = useMemo(() => {
    if (!task) return 'Aguardando tarefa...';
    if (task.status === 'completed') return 'Tarefa concluída ✓';
    if (task.status === 'failed') return 'Tarefa falhou';
    const lastEvent = task.events[task.events.length - 1];
    if (!lastEvent) return 'Iniciando...';
    if (lastEvent.type === 'BROWSER_ACTION') return `OmniNinja está navegando · ${lastBrowserEvent?.action ?? ''}`;
    if (lastEvent.type === 'TERMINAL_OUTPUT') return 'OmniNinja está usando o terminal';
    if (lastEvent.type === 'FILE_CHANGED') return `OmniNinja está editando · ${lastFileEvent?.path ?? ''}`;
    if (lastEvent.type === 'AGENT_THINKING') return `OmniNinja está pensando...`;
    if (lastEvent.type === 'STEP_STARTED') return `Executando passo ${task.stepsDone + 1}`;
    return 'Trabalhando...';
  }, [task, lastBrowserEvent, lastTerminalEvent, lastFileEvent]);

  // Arquivos virtuais baseados nos eventos FILE_CHANGED (antes do early return)
  const files = useMemo(() => {
    const fileMap = new Map<string, string>();
    const events = task?.events ?? [];
    for (const ev of events) {
      if (ev.type === 'FILE_CHANGED' && ev.path) {
        fileMap.set(ev.path, ev.diff || '');
      }
    }
    return Array.from(fileMap.entries()).map(([path, content]) => ({ path, content }));
  }, [task?.events]);

  // Linhas do terminal baseadas nos eventos TERMINAL_OUTPUT
  const terminalLines = useMemo(() => {
    const lines: { kind: 'cmd' | 'out' | 'err' | 'meta'; text: string }[] = [];
    lines.push({ kind: 'meta', text: 'OmniNinja Sandbox · Ubuntu 22.04 · /workspace' });
    for (const ev of task?.events ?? []) {
      if (ev.type === 'TERMINAL_OUTPUT') {
        lines.push({ kind: 'cmd', text: ev.cmd });
        if (ev.stdout) ev.stdout.split('\n').forEach((l) => l && lines.push({ kind: 'out', text: l }));
        if (ev.stderr) ev.stderr.split('\n').forEach((l) => l && lines.push({ kind: 'err', text: l }));
        if (ev.exitCode !== 0) lines.push({ kind: 'err', text: `exit ${ev.exitCode}` });
      }
    }
    return lines;
  }, [task?.events]);

  if (!computerOpen || !task) return null;

  return (
    <div className={cn(
      'flex flex-col bg-[#0d0d0f]',
      computerFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'
    )}>
      {/* === HEADER: "Computer do OmniNinja" === */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#0d0d0f] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-2 w-2 rounded-full',
            task.status === 'running' ? 'bg-blue-500 animate-pulse' :
            task.status === 'completed' ? 'bg-green-500' :
            'bg-zinc-600'
          )} />
          <span className="text-sm font-medium text-white">Computer do OmniNinja</span>
        </div>

        {/* Status text bem pequeno embaixo */}
        <span className="text-[10px] text-zinc-500 truncate">{statusText}</span>

        <div className="ml-auto flex items-center gap-1">
          {/* Tabs */}
          <TabButton active={activeView === 'code'} onClick={() => setViewMode('code')} icon={Code2} label="Editor" />
          <TabButton active={activeView === 'terminal'} onClick={() => setViewMode('terminal')} icon={TerminalIcon} label="Terminal" />
          <TabButton active={activeView === 'browser'} onClick={() => setViewMode('browser')} icon={Globe} label="Navegador" />
          <TabButton active={activeView === 'preview'} onClick={() => setViewMode('preview')} icon={Eye} label="Preview" />

          <div className="mx-1 h-4 w-px bg-white/10" />

          <button
            onClick={toggleFs}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            {computerFullscreen ? '⤓' : '⤢'}
          </button>
          <button
            onClick={() => setComputerOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* === CONTEÚDO === */}
      <div className="min-h-0 flex-1">
        {/* === EDITOR (Monaco / VS Code real) === */}
        {activeView === 'code' && (
          <div className="flex h-full">
            {/* Sidebar de arquivos */}
            <div className="w-48 flex-shrink-0 border-r border-white/5 bg-[#17171a]">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-600">Explorer</div>
              <div className="px-2">
                <div className="flex items-center gap-1 px-1 py-1 text-xs text-zinc-500">
                  <Folder className="h-3 w-3" /> workspace
                </div>
                <div className="ml-3 border-l border-white/5 pl-2">
                  {files.length === 0 ? (
                    <div className="px-1 py-1 text-[11px] text-zinc-700">Nenhum arquivo ainda</div>
                  ) : (
                    files.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-1 py-1 text-[11px] text-zinc-400 hover:text-white">
                        <FileCode className="h-3 w-3" />
                        <span className="truncate">{f.path.split('/').pop()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Todo.md */}
              {task.events.some(e => e.type === 'FILE_CHANGED' && e.path === 'todo.md') && (
                <div className="mt-4 px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-600">Checklist</div>
              )}
              {files.filter(f => f.path === 'todo.md').map((f, i) => (
                <div key={i} className="mx-2 rounded border border-white/5 bg-[#1f1f23] p-2">
                  <pre className="whitespace-pre-wrap text-[10px] text-zinc-400">{f.content}</pre>
                </div>
              ))}
            </div>

            {/* Monaco Editor */}
            <div className="min-w-0 flex-1">
              {files.length > 0 ? (
                <MonacoEditor
                  height="100%"
                  theme="vs-dark"
                  language={getLanguage(files[0]?.path || '')}
                  value={files[0]?.content || ''}
                  options={{
                    readOnly: true,
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    tabSize: 2,
                    lineNumbers: 'on',
                    folding: true,
                    renderLineHighlight: 'all',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    fontLigatures: true,
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  <div className="text-center">
                    <Code2 className="mx-auto h-8 w-8 opacity-30" />
                    <p className="mt-2 text-xs">Aguardando o agente criar arquivos...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === TERMINAL (Ubuntu real) === */}
        {activeView === 'terminal' && (
          <div className="h-full overflow-y-auto bg-[#0a0a0c] p-3 font-mono text-[12px] leading-relaxed">
            {terminalLines.map((l, i) => (
              <div
                key={i}
                className={cn(
                  'whitespace-pre-wrap break-words',
                  l.kind === 'cmd' && 'text-green-400',
                  l.kind === 'out' && 'text-zinc-400',
                  l.kind === 'err' && 'text-red-400',
                  l.kind === 'meta' && 'text-zinc-600 italic'
                )}
              >
                {l.kind === 'cmd' ? (
                  <><span className="text-blue-400">omnininja@ubuntu</span>:<span className="text-purple-400">~/workspace</span>$ {l.text}</>
                ) : l.text}
              </div>
            ))}
            {live && task.status === 'running' && (
              <div className="text-blue-400">
                omnininja@ubuntu:~/workspace$ <span className="animate-pulse">▊</span>
              </div>
            )}
          </div>
        )}

        {/* === NAVEGADOR (screenshot real) === */}
        {activeView === 'browser' && (
          <div className="flex h-full flex-col">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-[#17171a] px-3 py-2">
              <div className="flex gap-1">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded bg-[#0d0d0f] px-2 py-1 text-[10px] text-zinc-500">
                {live && <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
                <span className="truncate">{lastBrowserEvent?.url || 'about:blank'}</span>
              </div>
              {live && task.status === 'running' && (
                <Badge className="gap-1 bg-green-500/20 text-green-400 text-[9px]">
                  <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" /> Live
                </Badge>
              )}
            </div>

            {/* Screenshot real */}
            <div className="relative flex-1 overflow-hidden bg-white">
              {screenshot ? (
                <>
                  <img
                    src={`data:image/png;base64,${screenshot}`}
                    alt="Browser"
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[9px] text-green-400 backdrop-blur">
                    ● Screenshot real · Browserless
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-zinc-400">
                    <Globe className="mx-auto h-8 w-8 opacity-30" />
                    <p className="mt-2 text-xs">
                      {task.events.some(e => e.type === 'BROWSER_ACTION')
                        ? 'Carregando screenshot...'
                        : 'Aguardando o agente navegar...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === PREVIEW === */}
        {activeView === 'preview' && (
          <div className="flex h-full items-center justify-center bg-[#0a0a0c]">
            {task.status === 'completed' ? (
              <div className="h-full w-full bg-white p-8">
                <div className="mx-auto max-w-2xl">
                  <h1 className="font-serif text-2xl font-bold">Resultado da tarefa</h1>
                  <p className="mt-2 text-sm text-zinc-600">{task.summary}</p>
                  {task.artifacts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {task.artifacts.map((a, i) => (
                        <div key={i} className="rounded border border-zinc-200 p-2 text-xs">
                          📎 {a.name} ({(a.sizeBytes / 1024).toFixed(0)}KB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-600">
                <Eye className="mx-auto h-8 w-8 opacity-30" />
                <p className="mt-2 text-xs">Preview disponível após conclusão</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === FOOTER: Timeline de eventos === */}
      <div className="flex items-center gap-2 border-t border-white/5 bg-[#0d0d0f] px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          {task.events.slice(-5).map((ev, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                ev.type === 'BROWSER_ACTION' ? 'bg-blue-500' :
                ev.type === 'TERMINAL_OUTPUT' ? 'bg-green-500' :
                ev.type === 'FILE_CHANGED' ? 'bg-purple-500' :
                ev.type === 'STEP_COMPLETED' ? 'bg-zinc-600' :
                'bg-zinc-700'
              )}
              style={{ width: ev.type === 'STEP_COMPLETED' ? '24px' : '8px' }}
            />
          ))}
        </div>
        <span className="text-[9px] text-zinc-600">
          {task.stepsDone} passos · {task.events.length} eventos
        </span>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: typeof Code2;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium transition-colors',
        active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown',
    sh: 'shell', bash: 'shell', yml: 'yaml', yaml: 'yaml', sql: 'sql',
  };
  return map[ext || ''] || 'plaintext';
}

// ProgressWidget flutuante (quando o Computador está fechado)
export function ProgressWidget() {
  const task = useOmni((s) => s.currentTask);
  const setOpen = useOmni((s) => s.setComputerOpen);
  const open = useOmni((s) => s.computerOpen);
  const [expanded, setExpanded] = useState(true);

  if (!task || open) return null;
  const elapsed = task.finishedAt ? task.finishedAt - task.startedAt : Date.now() - task.startedAt;
  const statusText = task.status === 'running' ? 'Executando…' : task.status === 'completed' ? 'Concluído' : task.status;

  return (
    <div className="fixed bottom-24 right-4 z-40 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0f] shadow-2xl animate-fade-up">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
        <span className={cn('h-2 w-2 rounded-full', task.status === 'running' ? 'bg-blue-500 animate-pulse' : task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500')} />
        <span className="text-xs font-medium text-white">{statusText}</span>
        <span className="ml-auto text-[10px] text-zinc-500">{task.stepsDone} passos · {Math.round(elapsed / 1000)}s</span>
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-3 pb-3 pt-2">
          <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (task.stepsDone / 10) * 100)}%` }} />
          </div>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {task.events.filter(e => e.type === 'AGENT_THINKING').slice(-4).map((ev, i) => (
              ev.type === 'AGENT_THINKING' && (
                <div key={i} className="truncate text-[10px] text-zinc-500">
                  {ev.agent}: {ev.text}
                </div>
              )
            ))}
          </div>
          <button onClick={() => setOpen(true)} className="mt-2 w-full rounded border border-white/10 bg-white/5 py-1.5 text-[11px] text-white hover:bg-white/10">
            Abrir Computador
          </button>
        </div>
      )}
    </div>
  );
}
