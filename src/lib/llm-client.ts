// OmniNinja — Multi-model LLM client
// Usa OpenRouter (Grok, Kimi) ou GLM (fallback nativo do Z.ai)
// Claude/GPT/Gemini bloqueados por região (403) — Grok e Kimi funcionam.

import ZAI from 'z-ai-web-dev-sdk';

export type ModelId = 'claude' | 'chatgpt' | 'kimi' | 'grok' | 'gemini' | 'glm';

const OPENROUTER_MODELS: Record<string, { label: string; model: string; apiKeyEnv: string }> = {
  grok: { label: 'Grok 4.5', model: 'x-ai/grok-4.5', apiKeyEnv: 'OPENROUTER_GROK_API_KEY' },
  kimi: { label: 'Kimi K3', model: 'moonshotai/kimi-k3', apiKeyEnv: 'OPENROUTER_KIMI_API_KEY' },
  claude: { label: 'Claude', model: 'anthropic/claude-sonnet-5', apiKeyEnv: 'OPENROUTER_CLAUDE_API_KEY' },
  chatgpt: { label: 'ChatGPT', model: 'openai/gpt-5.6-sol', apiKeyEnv: 'OPENROUTER_CHATGPT_API_KEY' },
  gemini: { label: 'Gemini', model: 'google/gemini-3.6-flash', apiKeyEnv: 'OPENROUTER_GEMINI_API_KEY' },
};

// Prioridade: Grok (funciona + rápido) > Kimi (funciona + créditos) > GLM (sempre funciona no Z.ai)
const FALLBACK_ORDER = ['grok', 'kimi', 'glm'];

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
}

export async function callLLM(
  modelId: string,
  messages: LLMMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const cfg = OPENROUTER_MODELS[modelId];
  const apiKey = cfg ? process.env[cfg.apiKeyEnv] : null;

  // Try the requested model first
  if (cfg && apiKey) {
    try {
      return await callOpenRouter(cfg.model, apiKey, messages, options);
    } catch (err: any) {
      // If it's a 403 (region blocked) or 402 (credits), try fallback
      if (err.message.includes('403') || err.message.includes('402')) {
        // Fall through to fallback logic
      } else {
        throw err;
      }
    }
  }

  // Fallback: try models in priority order
  for (const id of FALLBACK_ORDER) {
    if (id === modelId) continue; // already tried
    if (id === 'glm') {
      try {
        return await callGLM(messages, options);
      } catch { continue; }
    }
    const c = OPENROUTER_MODELS[id];
    if (c) {
      const key = process.env[c.apiKeyEnv];
      if (key) {
        try {
          return await callOpenRouter(c.model, key, messages, options);
        } catch { continue; }
      }
    }
  }

  // Last resort: GLM SDK
  return callGLM(messages, options);
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
  };
  if (options?.maxTokens) body.max_tokens = options.maxTokens;

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://omnininja.space-z.ai',
      'X-Title': 'OmniNinja',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`OpenRouter ${model} HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const choice = data?.choices?.[0]?.message;
  // Some models (Kimi, Grok) return reasoning separately — use content, fallback to reasoning
  const content = choice?.content ?? choice?.reasoning ?? '';
  return { content, model: data?.model ?? model };
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
