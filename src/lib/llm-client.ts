// OmniNinja — Multi-model LLM client
// Usa OpenRouter (Claude, GPT, Kimi, Grok, Gemini) ou GLM (fallback nativo)

import ZAI from 'z-ai-web-dev-sdk';

export type ModelId = 'claude' | 'chatgpt' | 'kimi' | 'grok' | 'gemini' | 'glm';

const OPENROUTER_MODELS: Record<string, { label: string; model: string; apiKeyEnv: string }> = {
  claude: { label: 'Claude', model: 'anthropic/claude-sonnet-4', apiKeyEnv: 'OPENROUTER_CLAUDE_API_KEY' },
  chatgpt: { label: 'ChatGPT', model: 'openai/gpt-4o', apiKeyEnv: 'OPENROUTER_CHATGPT_API_KEY' },
  kimi: { label: 'Kimi', model: 'moonshotai/kimi-k2', apiKeyEnv: 'OPENROUTER_KIMI_API_KEY' },
  grok: { label: 'Grok', model: 'x-ai/grok-2', apiKeyEnv: 'OPENROUTER_GROK_API_KEY' },
  gemini: { label: 'Gemini', model: 'google/gemini-2.5-pro', apiKeyEnv: 'OPENROUTER_GEMINI_API_KEY' },
};

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

  if (cfg && apiKey) {
    return callOpenRouter(cfg.model, apiKey, messages, options);
  }

  // GLM requested or no OpenRouter key — try OpenRouter fallback, then GLM SDK
  if (modelId === 'glm' || !cfg) {
    for (const [, c] of Object.entries(OPENROUTER_MODELS)) {
      const key = process.env[c.apiKeyEnv];
      if (key) {
        return callOpenRouter(c.model, key, messages, options);
      }
    }
  }

  // Last resort: GLM SDK (z-ai-web-dev-sdk)
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
  const content = data?.choices?.[0]?.message?.content ?? '';
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
