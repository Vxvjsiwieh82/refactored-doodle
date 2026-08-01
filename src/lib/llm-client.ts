// OmniNinja — Multi-model LLM client v3
// Correção: timeout + retry + SSE heartbeat + fallback automático

import ZAI from 'z-ai-web-dev-sdk';

export type ModelId = 'claude' | 'chatgpt' | 'kimi' | 'grok' | 'gemini' | 'glm';

const OPENROUTER_MODELS: Record<string, { label: string; model: string; apiKeyEnv: string }> = {
  grok: { label: 'Grok 4.5', model: 'x-ai/grok-4.5', apiKeyEnv: 'OPENROUTER_GROK_API_KEY' },
  kimi: { label: 'Kimi K3', model: 'moonshotai/kimi-k3', apiKeyEnv: 'OPENROUTER_KIMI_API_KEY' },
  claude: { label: 'Claude', model: 'anthropic/claude-sonnet-5', apiKeyEnv: 'OPENROUTER_CLAUDE_API_KEY' },
  chatgpt: { label: 'ChatGPT', model: 'openai/gpt-5.6-sol', apiKeyEnv: 'OPENROUTER_CHATGPT_API_KEY' },
  gemini: { label: 'Gemini', model: 'google/gemini-3.6-flash', apiKeyEnv: 'OPENROUTER_GEMINI_API_KEY' },
};

const FALLBACK_ORDER = ['grok', 'kimi', 'glm'];
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface LLMMessage { role: 'system' | 'user' | 'assistant'; content: string; }
export interface LLMResponse { content: string; model: string; }

export async function callLLM(
  modelId: string,
  messages: LLMMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const cfg = OPENROUTER_MODELS[modelId];
  const apiKey = cfg ? process.env[cfg.apiKeyEnv] : null;

  // Try the requested model first (with retry)
  if (cfg && apiKey) {
    try {
      return await callOpenRouterWithRetry(cfg.model, apiKey, messages, options);
    } catch (err: any) {
      // If 403 (region) or 402 (credits), skip to fallback
      if (!err.message.includes('403') && !err.message.includes('402')) {
        // For network errors, also try fallback
      }
    }
  }

  // Fallback chain: try each model in priority order
  for (const id of FALLBACK_ORDER) {
    if (id === modelId) continue;
    if (id === 'glm') {
      try { return await callGLM(messages, options); } catch { continue; }
    }
    const c = OPENROUTER_MODELS[id];
    if (c) {
      const key = process.env[c.apiKeyEnv];
      if (key) {
        try { return await callOpenRouterWithRetry(c.model, key, messages, options); } catch { continue; }
      }
    }
  }

  // Last resort: GLM SDK
  return callGLM(messages, options);
}

// NOVO: Retry com timeout e backoff exponencial
async function callOpenRouterWithRetry(
  model: string,
  apiKey: string,
  messages: LLMMessage[],
  options?: { temperature?: number; maxTokens?: number },
  retries = 2
): Promise<LLMResponse> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callOpenRouter(model, apiKey, messages, options);
    } catch (err: any) {
      const isLastAttempt = attempt === retries;
      const isNetworkError = err.message.includes('network') || err.message.includes('Failed to fetch') || err.message.includes('timeout') || err.message.includes('aborted');
      const is429 = err.message.includes('429');
      
      if (isLastAttempt || (!isNetworkError && !is429)) {
        throw err;
      }
      
      // Backoff exponencial: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

async function callOpenRouter(
  model: string,
  apiKey: string,
  messages: LLMMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const body: any = {
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    provider: { allow_fallbacks: true }, // Permite failover automático
  };
  if (options?.maxTokens) body.max_tokens = options.maxTokens;

  // Timeout de 60 segundos (antes era infinito → causava "network error")
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://omnininja.space-z.ai',
        'X-Title': 'OmniNinja',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      
      // Se for 429 (rate limit), ler header Retry-After
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        const delay = retryAfter ? Number(retryAfter) * 1000 : 2000;
        await new Promise(r => setTimeout(r, delay));
        throw new Error(`OpenRouter 429: rate limited, retrying after ${delay}ms`);
      }
      
      throw new Error(`OpenRouter ${model} HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const choice = data?.choices?.[0]?.message;
    const content = choice?.content ?? choice?.reasoning ?? '';
    return { content, model: data?.model ?? model };
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error(`OpenRouter ${model} timeout: 60s sem resposta`);
    }
    throw err;
  }
}

async function callGLM(
  messages: LLMMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const zai = await ZAI.create();
  const mapped = messages.map((m) => ({
    role: m.role === 'system' ? 'assistant' : m.role,
    content: m.content,
  }));
  const completion = await zai.chat.completions.create({
    messages: mapped as any,
    thinking: { type: 'disabled' },
  } as any);
  return {
    content: completion?.choices?.[0]?.message?.content ?? '',
    model: 'glm-4-plus',
  };
}

export function getConfiguredModels(): ModelId[] {
  const out: ModelId[] = ['glm'];
  for (const [id, cfg] of Object.entries(OPENROUTER_MODELS)) {
    if (process.env[cfg.apiKeyEnv]) out.push(id as ModelId);
  }
  return out;
}

export function getModelLabel(modelId: string): string {
  if (modelId === 'glm') return 'GLM-4 (Z.ai)';
  return OPENROUTER_MODELS[modelId]?.label ?? modelId;
}
