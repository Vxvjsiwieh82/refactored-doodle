import { cn } from '@/lib/utils';

export function OmniNinjaLogo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="omni-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0066FF" />
          <stop offset="0.5" stopColor="#00D1FF" />
          <stop offset="1" stopColor="#0066FF" />
        </linearGradient>
        <filter id="omni-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Fundo: quadrado arredondado deep space */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#050A15" stroke="url(#omni-grad)" strokeWidth="1.5" />
      {/* Logo: ninja estilizado em forma geométrica (inspirado Ninja AI) */}
      {/* Cabeça ninja com bandana */}
      <path
        d="M16 14 L32 14 L34 18 L34 28 L30 34 L24 36 L18 34 L14 28 L14 18 Z"
        fill="url(#omni-grad)"
        opacity="0.15"
      />
      {/* Bandana (faixa horizontal) */}
      <rect x="14" y="19" width="20" height="4" rx="1" fill="url(#omni-grad)" />
      {/* Olhos (cortes na bandana) */}
      <rect x="18" y="20" width="3" height="2" rx="0.5" fill="#050A15" />
      <rect x="27" y="20" width="3" height="2" rx="0.5" fill="#050A15" />
      {/* Gordas da bandana */}
      <path
        d="M34 19 L38 17 L36 21 L38 23 L34 22"
        stroke="url(#omni-grad)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Corpo ninja */}
      <path
        d="M20 24 L28 24 L28 28 L26 30 L22 30 L20 28 Z"
        fill="url(#omni-grad)"
        opacity="0.3"
      />
      {/* Espada diagonal (elemento ninja) */}
      <line x1="14" y1="34" x2="34" y2="14" stroke="url(#omni-grad)" strokeWidth="1" opacity="0.2" />
      {/* Glow ao redor */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="none" stroke="url(#omni-grad)" strokeWidth="0.5" opacity="0.3" filter="url(#omni-glow)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}>
      <OmniNinjaLogo size={26} />
      <span className="text-[15px]">
        Ommi<span className="text-electric">Ninja</span>
      </span>
    </span>
  );
}

export function ProviderGlyph({ id, size = 16, className }: { id: string; size?: number; className?: string }) {
  const colors: Record<string, string> = {
    claude: '#d97757', chatgpt: '#10a37f', glm: '#38bdf8', deepseek: '#4d6bfe',
    kimi: '#7c3aed', gemini: '#4285f4', grok: '#9ca3af', nemotron: '#76b900',
    minimax: '#ff6b6b', qwen: '#615ced',
  };
  const label: Record<string, string> = {
    claude: 'C', chatgpt: 'G', glm: 'Z', deepseek: 'D', kimi: 'K',
    gemini: 'Ge', grok: 'X', nemotron: 'N', minimax: 'M', qwen: 'Q',
  };
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-md font-mono font-bold text-[10px] leading-none', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: `${colors[id] ?? '#38bdf8'}22`,
        color: colors[id] ?? '#38bdf8',
        border: `1px solid ${colors[id] ?? '#38bdf8'}55`,
      }}
    >
      {label[id] ?? '?'}
    </span>
  );
}
