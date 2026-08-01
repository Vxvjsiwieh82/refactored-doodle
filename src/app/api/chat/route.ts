import ZAI from 'z-ai-web-dev-sdk';
import { getCurrentUser } from '@/lib/auth';
import { consumeCredits, CREDIT_COSTS } from '@/lib/credits';
import { db } from '@/lib/db';
import { classifyMessage } from '@/lib/orchestrator';
import { callLLM, getModelLabel } from '@/lib/llm-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Você é o OmniNinja, um agente de IA autônomo inspirado no Manus AI e no Ninja AI. Você pode responder diretamente (modo Chat) ou abrir o "Computador" com sandbox, terminal e navegador reais para executar tarefas (modo Agent / Agent MAX).

Características:
- Responda SEMPRE em português do Brasil, de forma clara e útil.
- Use Markdown (headings, listas, **negrito**, \`código inline\`, blocos de código com linguagem).
- Se o usuário pedir algo que exija execução real (criar site, pesquisar, rodar código), sugira mudar para o modo Agent.
- Seja conciso em perguntas simples, detalhado em tarefas complexas.
- Você tem acesso a 10 modelos de IA (Claude, GPT, GLM-5.2, Gemini, Kimi K3, etc.) mas está rodando como GLM-5.2 agora.`;

// POST /api/chat — streaming chat completion via z-ai-web-dev-sdk (GLM-5.2).
// Body: { messages: [{role, content}], model?: string }
// Returns: text/event-stream of tokens.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = await req.json().catch(() => ({} as any));
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const chatModel = body.model || 'grok';
  const lastUser = [...incoming].reverse().find((m: any) => m.role === 'user');
  if (!lastUser) {
    return new Response(JSON.stringify({ error: 'messages required' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }

  // Consume 1 credit per chat message
  const consume = await consumeCredits(user.id, CREDIT_COSTS.chat_message, 'chat_message');
  if (!consume.ok && consume.remaining === 0) {
    return new Response(JSON.stringify({ error: 'Créditos insuficientes' }), {
      status: 402, headers: { 'content-type': 'application/json' },
    });
  }

  // Persist user message
  const userMsg = await db.message.create({
    data: { userId: user.id, role: 'user', content: lastUser.content },
  });

  const messages = [
    { role: 'assistant' as const, content: SYSTEM_PROMPT },
    ...incoming.filter((m: any) => m.role === 'user' || m.role === 'assistant').slice(-12),
  ];

  const encoder = new TextEncoder();
  let fullText = '';

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      try {
        const modelLabel = chatModel || 'grok';
        send({ type: 'start', credits: consume.remaining, model: modelLabel });

        // Usa callLLM (Grok via OpenRouter, com fallback pra GLM)
        const result = await callLLM(chatModel || 'grok', messages);
        fullText = result.content;

        if (!fullText) {
          send({ type: 'error', error: 'Resposta vazia do modelo' });
        } else {
          const tokens = fullText.match(/\S+\s*/g) ?? [fullText];
          for (const tk of tokens) {
            send({ type: 'delta', text: tk });
            await new Promise((r) => setTimeout(r, 18));
          }
        }

        await db.message.create({
          data: { userId: user.id, role: 'assistant', content: fullText, model: result.model },
        });

        send({ type: 'done', credits: consume.remaining - 1, usage: { text: fullText.length } });
      } catch (err: any) {
        send({ type: 'error', error: err?.message ?? 'LLM error' });
      } finally {
        controller.enqueue(encoder.encode('event: end\ndata: {}\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}

// GET /api/chat — quick non-streaming completion (used by classify + simple replies)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  if (!q) return Response.json({ error: 'q required' }, { status: 400 });
  const zai = await ZAI.create();
  const r = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: 'Responda em português, em até 2 frases.' },
      { role: 'user', content: q },
    ],
    thinking: { type: 'disabled' },
  });
  return Response.json({ text: r.choices[0]?.message?.content, model: r.model });
}
