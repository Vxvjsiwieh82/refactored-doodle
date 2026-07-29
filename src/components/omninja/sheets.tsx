'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck, FileText, User, Activity, LogIn, Check, X, Zap, Coins,
  TrendingUp, Database, Globe, Bot, Crown, Settings, Bell, Monitor,
  Cpu, HardDrive, Wifi, Server, AlertCircle, CalendarClock, Plus, Trash2, Play, Pause,
} from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { OmniNinjaLogo, ProviderGlyph } from './brand';
import { useOmni } from '@/lib/store';
import { cn } from '@/lib/utils';

type SheetProps = { open: boolean; onOpenChange: (v: boolean) => void };

/* ============== Admin: Integration status ============== */
export function AdminSheet({ open, onOpenChange }: SheetProps) {
  const [data, setData] = useState<{ integrations: any[]; counts: any } | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    fetch('/api/integrations')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => { fetchedRef.current = false; });
  }, [open]);

  const loading = !data;

  const cats = ['llm', 'browser', 'search', 'infra', 'auth', 'billing'] as const;
  const catLabels: Record<string, string> = {
    llm: 'Modelos de IA', browser: 'Navegação', search: 'Busca',
    infra: 'Infraestrutura', auth: 'Autenticação', billing: 'Billing',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto omni-scroll border-border bg-card sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" /> Status das Integrações
          </SheetTitle>
          <SheetDescription>
            Mostra apenas configurado/ausente por serviço. Nenhum valor de chave é exibido.
          </SheetDescription>
        </SheetHeader>

        {loading && <div className="omni-shimmer mt-6 h-40 rounded-lg" />}

        {data && (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Configurados</div>
                <div className="mt-1 font-serif text-2xl font-semibold text-success">{data.counts.configured}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Total</div>
                <div className="mt-1 font-serif text-2xl font-semibold">{data.counts.total}</div>
              </div>
            </div>

            {cats.map((cat) => {
              const items = data.integrations.filter((i: any) => i.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {catLabels[cat]}
                  </h3>
                  <div className="space-y-1.5">
                    {items.map((i: any) => (
                      <div key={i.key} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-2.5">
                        {cat === 'llm' ? (
                          <ProviderGlyph id={i.key.replace('_API_KEY', '').toLowerCase()} size={24} />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
                            <CategoryIcon category={cat} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium">{i.label}</div>
                          <div className="truncate text-[10px] text-muted-foreground">{i.key}</div>
                        </div>
                        {i.configured ? (
                          <Badge variant="outline" className="gap-1 border-success/40 text-success">
                            <Check className="h-2.5 w-2.5" /> Configurado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-warning/40 text-warning">
                            <X className="h-2.5 w-2.5" /> Ausente
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-[11px] text-muted-foreground">
              <AlertCircle className="mb-1 inline h-3 w-3 text-warning" /> Configure as chaves no painel de
              secrets da plataforma de deploy. O seletor de modelo mostra apenas provedores configurados.
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const props = { className: 'h-3.5 w-3.5 text-muted-foreground' };
  if (category === 'browser') return <Globe {...props} />;
  if (category === 'search') return <Bot {...props} />;
  if (category === 'infra') return <Database {...props} />;
  if (category === 'auth') return <User {...props} />;
  if (category === 'billing') return <Coins {...props} />;
  return <Settings {...props} />;
}

/* ============== Docs ============== */
export function DocsSheet({ open, onOpenChange }: SheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto omni-scroll border-border bg-card sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand" /> Documentação
          </SheetTitle>
          <SheetDescription>Guia de início rápido e referência dos modos e ferramentas.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5 text-sm">
          <Section title="Início rápido">
            <ol className="ml-4 list-decimal space-y-1.5 text-muted-foreground">
              <li>Escolha o modo no seletor: <b className="text-foreground">Chat</b>, <b className="text-foreground">Agent</b> ou <b className="text-foreground">Agent MAX</b>.</li>
              <li>Selecione o modelo de IA no canto superior (apenas configurados aparecem).</li>
              <li>Descreva a tarefa no input e pressione Enter.</li>
              <li>Acompanhe a execução no painel <b className="text-foreground">Computador</b> à direita.</li>
              <li>Ao final, baixe os artefatos gerados.</li>
            </ol>
          </Section>
          <Section title="Modos de execução">
            <div className="space-y-2">
              <ModeDoc name="Chat" desc="Resposta direta do modelo, sem abrir sandbox. Use para perguntas rápidas e conversa." />
              <ModeDoc name="Agent" desc="Orquestrador + 1 sub-agente por vez. Executa tarefas reais com sandbox isolado." />
              <ModeDoc name="Agent MAX" desc="Orquestrador delega a múltiplos sub-agentes em paralelo. Pesquisa profunda." />
            </div>
          </Section>
          <Section title="Painel Computador">
            <p className="text-muted-foreground">O painel aparece dentro do chat — nunca em aba separada. Tem 4 abas:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
              <li><b className="text-foreground">Código</b>: editor com diffs e árvore de arquivos.</li>
              <li><b className="text-foreground">Pré-visualizar</b>: renderização do artefato gerado.</li>
              <li><b className="text-foreground">Navegador</b>: Chromium real com screenshots ao vivo.</li>
              <li><b className="text-foreground">Terminal</b>: bash, python, node, git em tempo real.</li>
            </ul>
          </Section>
          <Section title="Sub-agentes">
            <div className="grid grid-cols-2 gap-2">
              {[
                { a: 'Browser', d: 'Navegação web' },
                { a: 'Code', d: 'Terminal/sandbox' },
                { a: 'Research', d: 'Busca e fontes' },
                { a: 'Memory', d: 'Contexto/artefatos' },
                { a: 'Chat', d: 'Resposta final' },
              ].map((s) => (
                <div key={s.a} className="rounded-lg border border-border bg-background/40 p-2">
                  <div className="text-xs font-medium">{s.a}</div>
                  <div className="text-[10px] text-muted-foreground">{s.d}</div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="API (em breve)">
            <p className="text-muted-foreground">Reservado para <code className="rounded bg-accent px-1 text-brand">/docs/api</code>. A API REST para desenvolvedores será disponibilizada em uma fase futura.</p>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <div className="text-sm">{children}</div>
    </div>
  );
}
function ModeDoc({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2.5">
      <div className="text-xs font-medium">{name}</div>
      <div className="text-[11px] text-muted-foreground">{desc}</div>
    </div>
  );
}

/* ============== Account ============== */
export function AccountSheet({ open, onOpenChange }: SheetProps) {
  const user = useOmni((s) => s.user);
  const [txns, setTxns] = useState<any[]>([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (open) {
      fetch('/api/credits').then((r) => r.json()).then((d) => setTxns(d.transactions ?? [])).catch(() => {});
    }
  }, [open]);

  const total = user ? user.credits + user.bonusCredits : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto omni-scroll border-border bg-card sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-brand" /> Conta
          </SheetTitle>
          <SheetDescription>Uso de créditos, plano e preferências.</SheetDescription>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão</TabsTrigger>
            <TabsTrigger value="usage">Uso</TabsTrigger>
            <TabsTrigger value="prefs">Preferências</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-purple-500/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Plano atual</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-warning" />
                    <span className="font-serif text-xl font-semibold capitalize">{user?.tier ?? 'Pro'}</span>
                  </div>
                </div>
                <Button size="sm" className="gap-1"><TrendingUp className="h-3 w-3" /> Upgrade</Button>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Créditos disponíveis</span>
                  <span className="tabular-nums">{total.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(100, (total / 4000) * 100)} className="h-1.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground"><Coins className="h-3 w-3" /> Mensais</div>
                <div className="mt-1 font-serif text-xl font-semibold">{user?.credits?.toLocaleString() ?? 0}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground"><Zap className="h-3 w-3" /> Bônus</div>
                <div className="mt-1 font-serif text-xl font-semibold">{user?.bonusCredits?.toLocaleString() ?? 0}</div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Plano</h3>
              <div className="rounded-lg border border-border bg-background/40 p-3 text-xs text-muted-foreground">
                Pro · US$ 20/mês · 4.000 créditos/mês · 4 tarefas simultâneas.
                Créditos mensais não acumulam. Anual economiza 17%.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="mt-4">
            <div className="mb-3 text-xs text-muted-foreground">Histórico de transações de créditos</div>
            <div className="space-y-1.5">
              {txns.length === 0 && <div className="text-xs text-muted-foreground">Sem transações ainda.</div>}
              {txns.map((t: any) => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2.5">
                  <div className={cn('flex h-6 w-6 items-center justify-center rounded-full', t.delta < 0 ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success')}>
                    {t.delta < 0 ? '-' : '+'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{t.reason}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleString('pt-BR')}</div>
                  </div>
                  <span className={cn('text-xs font-medium tabular-nums', t.delta < 0 ? 'text-danger' : 'text-success')}>
                    {t.delta > 0 ? '+' : ''}{t.delta}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prefs" className="mt-4 space-y-3">
            <PrefRow icon={Bot} label="Modelo padrão" value="GLM-5.2" />
            <PrefRow icon={Bell} label="Notificações" value="E-mail" toggle />
            <PrefRow icon={Monitor} label="Tema" value="Dark" toggle />
            <PrefRow icon={Settings} label="Sessões conectadas" value="2 dispositivos" />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function PrefRow({ icon: Icon, label, value, toggle }: { icon: any; label: string; value: string; toggle?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground">{value}</div>
      </div>
      {toggle ? (
        <div className="flex h-5 w-9 items-center rounded-full bg-brand px-0.5">
          <span className="ml-auto h-4 w-4 rounded-full bg-white" />
        </div>
      ) : (
        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </div>
  );
}

/* ============== Status ============== */
export function StatusSheet({ open, onOpenChange }: SheetProps) {
  const services = [
    { name: 'API de IA (Orquestrador)', icon: Bot, status: 'operational' },
    { name: 'Browserless (navegação)', icon: Globe, status: 'operational' },
    { name: 'Banco de dados', icon: Database, status: 'operational' },
    { name: 'WebSocket (Event Stream)', icon: Wifi, status: 'operational' },
    { name: 'Sandbox (Docker)', icon: Server, status: 'degraded' },
    { name: 'Fila de jobs', icon: Cpu, status: 'operational' },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto omni-scroll border-border bg-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand" /> Status do sistema
          </SheetTitle>
          <SheetDescription>Saúde dos serviços do OmniNinja.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-center">
            <Badge variant="outline" className="gap-1 border-success/40 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-live-dot" /> Todos os sistemas operacionais
            </Badge>
          </div>
          {services.map((s) => (
            <div key={s.name} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-xs font-medium">{s.name}</span>
              {s.status === 'operational' ? (
                <Badge variant="outline" className="gap-1 border-success/40 text-success">
                  <Check className="h-2.5 w-2.5" /> Operacional
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-warning/40 text-warning">
                  <AlertCircle className="h-2.5 w-2.5" /> Degradado
                </Badge>
              )}
            </div>
          ))}
          <p className="text-center text-[10px] text-muted-foreground">Última verificação: agora · métricas reais em breve</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============== Login ============== */
export function LoginSheet({ open, onOpenChange }: SheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-border bg-card sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-brand" /> Entrar
          </SheetTitle>
          <SheetDescription>Acesse sua conta OmniNinja.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          <OmniNinjaLogo size={40} className="mx-auto" />
          <p className="text-center text-sm text-muted-foreground">Sessão demo ativa como Omni Ninja (Pro).</p>
          <Button variant="outline" className="w-full gap-2"><Globe /> Continuar com Google</Button>
          <Button variant="outline" className="w-full gap-2"><HardDrive /> Continuar com GitHub</Button>
          <Separator className="my-3" />
          <div className="space-y-2">
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="E-mail" />
            <input type="password" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Senha" />
            <Button className="w-full">Entrar com e-mail</Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground">OAuth requer GOOGLE_CLIENT_ID/SECRET no .env</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============== Scheduled Tasks (Agendado) ============== */
interface ScheduledTask {
  id: string; title: string; prompt: string; mode: string; model: string;
  schedule: string; enabled: boolean; lastRunAt: string | null; nextRunAt: string | null;
  runsCount: number;
}

export function ScheduledSheet({ open, onOpenChange }: SheetProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const fetchedRef = useRef(false);

  // form state
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [sched, setSched] = useState('daily 09:00');
  const [mode, setMode] = useState('agent');

  const load = () => {
    fetch('/api/scheduled').then((r) => r.json()).then((d) => {
      setTasks(d.tasks ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    load();
  }, [open]);

  const create = async () => {
    if (!prompt.trim()) return;
    const res = await fetch('/api/scheduled', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: title || undefined, prompt, mode, model: 'glm', schedule: sched }),
    });
    if (res.ok) {
      setPrompt(''); setTitle(''); setShowForm(false);
      load();
    }
  };

  const toggle = async (id: string, enabled: boolean) => {
    await fetch('/api/scheduled', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/scheduled?id=${id}`, { method: 'DELETE' });
    load();
  };

  const PRESETS = [
    { label: 'Diário 09:00', val: 'daily 09:00' },
    { label: 'Diário 18:00', val: 'daily 18:00' },
    { label: 'Segunda 10:00', val: 'weekly mon 10:00' },
    { label: 'A cada 2h', val: 'every 2h' },
    { label: 'A cada 30min', val: 'every 30m' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto omni-scroll border-border bg-card sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-brand" /> Tarefas Agendadas
          </SheetTitle>
          <SheetDescription>Programe tarefas recorrentes — até 20 simultâneas no plano Business.</SheetDescription>
        </SheetHeader>

        <div className="mt-5">
          <Button className="w-full gap-1.5" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? 'Cancelar' : 'Nova tarefa agendada'}
          </Button>
        </div>

        {showForm && (
          <div className="mt-3 space-y-3 rounded-lg border border-border bg-background/40 p-3 animate-fade-up">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Título (opcional)</label>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                placeholder="Relatório semanal de mercado"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Prompt da tarefa</label>
              <textarea
                value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}
                className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                placeholder="Pesquise notícias de IA da semana e gere um relatório…"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Agendamento</label>
              <input
                value={sched} onChange={(e) => setSched(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                placeholder="daily 09:00"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setSched(p.val)}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] transition-colors',
                      sched === p.val
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Formatos: <code className="rounded bg-accent px-1">daily HH:MM</code>,{' '}
                <code className="rounded bg-accent px-1">weekly &lt;dow&gt; HH:MM</code>,{' '}
                <code className="rounded bg-accent px-1">every Nh</code>,{' '}
                <code className="rounded bg-accent px-1">once YYYY-MM-DD HH:MM</code>
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Modo</span>
              {(['chat', 'agent', 'agent_max'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    mode === m ? 'bg-brand text-brand-foreground' : 'bg-accent text-muted-foreground'
                  )}
                >
                  {m === 'agent_max' ? 'Agent MAX' : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={create} disabled={!prompt.trim()}>Agendar tarefa</Button>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {loading && <div className="omni-shimmer h-16 rounded-lg" />}
          {!loading && tasks.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma tarefa agendada ainda.</p>
              <p className="text-[10px] text-muted-foreground/70">Crie uma para rodar automaticamente.</p>
            </div>
          )}
          {tasks.map((t) => (
            <div key={t.id} className={cn('rounded-lg border border-border bg-background/40 p-3', !t.enabled && 'opacity-60')}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium">{t.title}</span>
                    <Badge variant="outline" className="h-3.5 px-1 text-[9px] uppercase">{t.mode === 'agent_max' ? 'MAX' : t.mode}</Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{t.prompt}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono"><CalendarClock className="h-2.5 w-2.5" /> {t.schedule}</span>
                    {t.nextRunAt && (
                      <span className="flex items-center gap-1 text-brand">
                        <Play className="h-2.5 w-2.5" /> próxima: {new Date(t.nextRunAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {t.runsCount > 0 && <span>{t.runsCount}x executada</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => toggle(t.id, t.enabled)}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded transition-colors',
                      t.enabled ? 'bg-success/15 text-success hover:bg-success/25' : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                    title={t.enabled ? 'Pausar' : 'Ativar'}
                  >
                    {t.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-danger/15 hover:text-danger"
                    title="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
