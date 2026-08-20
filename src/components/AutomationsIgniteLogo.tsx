import React from 'react';

interface AutomationsIgniteLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'icon' | 'full' | 'compact' | 'badge';
  withGlow?: boolean;
}

export const AutomationsIgniteLogo: React.FC<AutomationsIgniteLogoProps> = ({
  className = '',
  size = 40,
  variant = 'icon',
  withGlow = true
}) => {
  const pixelSize = typeof size === 'number' ? size : 40;

  // Vector emblem matching the Automations Ignite flame, gear, and circuit "A"
  const renderEmblem = () => (
    <svg
      viewBox="0 0 240 240"
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 select-none ${withGlow ? 'drop-shadow-[0_0_12px_rgba(255,106,0,0.45)]' : ''} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Fiery radial & linear gradients */}
        <linearGradient id="ignite-flame-main" x1="20%" y1="100%" x2="70%" y2="0%">
          <stop offset="0%" stopColor="#E63900" />
          <stop offset="35%" stopColor="#FF5500" />
          <stop offset="70%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FFC72C" />
        </linearGradient>

        <linearGradient id="ignite-flame-inner" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4500" />
          <stop offset="50%" stopColor="#FF7700" />
          <stop offset="100%" stopColor="#FFD000" />
        </linearGradient>

        <linearGradient id="ignite-circuit-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="50%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#E63900" />
        </linearGradient>

        <linearGradient id="ignite-gear-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8A00" />
          <stop offset="70%" stopColor="#FF5500" />
          <stop offset="100%" stopColor="#CC2E00" />
        </linearGradient>

        <radialGradient id="ignite-glow-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </radialGradient>

        <filter id="ignite-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient background glow ring */}
      <circle cx="120" cy="120" r="110" fill="url(#ignite-glow-ambient)" />

      {/* --- BACK FLAME CREST --- */}
      <path
        d="M120 16 C122 38 132 55 145 70 C162 55 166 42 165 38 C174 58 178 82 170 102 C166 112 159 119 152 125 C178 128 200 152 198 180 C198 182 195 186 193 189 C190 178 186 168 178 160 C182 145 175 130 162 122 C168 114 170 102 167 92 C160 104 148 112 136 116 C144 95 136 72 122 55 C118 68 114 80 116 95 C110 88 106 78 106 67 C100 80 97 96 100 112 C90 102 85 88 86 74 C72 92 65 116 68 140 C56 128 50 112 51 96 C42 118 42 146 54 170 C48 158 46 142 50 128 C42 148 44 175 60 196 C72 212 92 222 114 224 C90 220 70 205 62 184 C56 168 58 148 68 134 C64 154 70 176 86 190 C78 174 80 154 90 140 C88 158 96 175 110 186 C124 197 142 201 160 197 C174 193 186 183 194 170 C178 194 148 206 120 206 C80 206 48 175 48 135 C48 95 80 40 120 16 Z"
        fill="url(#ignite-flame-main)"
        opacity="0.95"
      />

      {/* --- GEAR COGS & BASE (Bottom & Right) --- */}
      <path
        d="M178 135 L190 132 L194 146 L182 150 C184 156 185 162 185 168 L198 170 L195 185 L183 183 C180 189 176 195 172 200 L181 209 L169 220 L160 211 C154 215 147 218 140 220 L139 233 L124 233 L124 220 C117 219 110 216 103 212 L94 221 L84 210 L92 201 C88 196 85 190 82 184 L70 186 L67 172 L79 169"
        fill="none"
        stroke="url(#ignite-gear-grad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gear Tooth blocks (Solid Teeth) */}
      <path d="M192 136 L204 133 L207 147 L195 150 Z" fill="url(#ignite-gear-grad)" />
      <path d="M194 168 L207 170 L204 185 L191 183 Z" fill="url(#ignite-gear-grad)" />
      <path d="M179 198 L189 208 L177 219 L167 209 Z" fill="url(#ignite-gear-grad)" />
      <path d="M149 216 L151 229 L136 229 L136 216 Z" fill="url(#ignite-gear-grad)" />
      <path d="M112 216 L108 229 L94 222 L99 210 Z" fill="url(#ignite-gear-grad)" />

      {/* --- MAIN "A" APEX STRUCTURE --- */}
      {/* Central bold 'A' triangular flame chassis */}
      <path
        d="M125 76 L154 175 L135 175 L125 138 L104 138 L95 175 L76 175 L113 76 Z"
        fill="none"
        stroke="#121318"
        strokeWidth="18"
        strokeLinejoin="miter"
      />
      <path
        d="M124 74 L157 182 L137 182 L127 144 L103 144 L94 182 L74 182 L114 74 Z"
        fill="none"
        stroke="url(#ignite-flame-inner)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />

      {/* Inner Apex core of "A" */}
      <polygon
        points="120,102 110,132 130,132"
        fill="url(#ignite-flame-main)"
      />

      {/* --- SWEEPING FRONT CIRCUIT TRACK & TOP-RIGHT NODE --- */}
      {/* Thick diagonal circuit band crossing across the A */}
      <path
        d="M48 214 L78 174 L162 128 C182 117 194 95 190 72 C186 50 166 36 144 40 C130 43 118 54 114 68"
        fill="none"
        stroke="#0D0E12"
        strokeWidth="19"
        strokeLinecap="round"
      />
      <path
        d="M48 214 L78 174 L162 128 C182 117 194 95 190 72 C186 50 166 36 144 40 C130 43 118 54 114 68"
        fill="none"
        stroke="url(#ignite-circuit-gold)"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Inner accent stripe on the sweeping circuit */}
      <path
        d="M58 206 L82 174 L160 131 C176 122 185 104 182 85 C179 67 163 55 145 58"
        fill="none"
        stroke="#FFDD66"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Top right circular node terminal */}
      <circle cx="172" cy="98" r="14" fill="#0D0E12" stroke="url(#ignite-circuit-gold)" strokeWidth="7" />
      <circle cx="172" cy="98" r="5" fill="#FFD000" />
      <path d="M172 98 L172 136" stroke="url(#ignite-circuit-gold)" strokeWidth="6" strokeLinecap="round" />

      {/* --- LEFT CIRCUIT TRACES (Dual Nodes) --- */}
      {/* Upper left circuit trace + node */}
      <path d="M96 116 L65 130 L48 138" fill="none" stroke="#0D0E12" strokeWidth="12" strokeLinecap="round" />
      <path d="M96 116 L65 130 L48 138" fill="none" stroke="url(#ignite-circuit-gold)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="78" cy="130" r="9" fill="#0D0E12" stroke="url(#ignite-circuit-gold)" strokeWidth="5" />
      <circle cx="78" cy="130" r="3" fill="#FFC72C" />

      {/* Lower left circuit trace + node */}
      <path d="M82 144 L54 158 L40 166" fill="none" stroke="#0D0E12" strokeWidth="12" strokeLinecap="round" />
      <path d="M82 144 L54 158 L40 166" fill="none" stroke="url(#ignite-circuit-gold)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="68" cy="158" r="9" fill="#0D0E12" stroke="url(#ignite-circuit-gold)" strokeWidth="5" />
      <circle cx="68" cy="158" r="3" fill="#FFC72C" />

      {/* --- LOWER RIGHT MINI CIRCUIT BRANCH --- */}
      <path d="M148 160 L158 174 L170 178" fill="none" stroke="url(#ignite-circuit-gold)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="172" cy="190" r="7" fill="#0D0E12" stroke="url(#ignite-circuit-gold)" strokeWidth="4" />
      <circle cx="172" cy="190" r="2.5" fill="#FFC72C" />
      <path d="M164 176 C168 180 170 184 172 190" fill="none" stroke="url(#ignite-circuit-gold)" strokeWidth="4" />
    </svg>
  );

  if (variant === 'icon') {
    return renderEmblem();
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-900/90 border border-orange-500/30 backdrop-blur-md shadow-lg shadow-orange-950/40 ${className}`}>
        {renderEmblem()}
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-semibold leading-tight">
            AUTOMATIONS
          </span>
          <span className="text-xs font-black tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent leading-tight">
            IGNITE
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {renderEmblem()}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-sm font-black text-white tracking-tight">Automations</span>
            <span className="text-sm font-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent tracking-tight">
              Ignite
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-medium">
            Loyalty Pass Engine
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Lockup with Tagline
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-md scale-95" />
        <div className="relative p-1 rounded-2xl bg-neutral-950/80 border border-neutral-800/80">
          {renderEmblem()}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-extrabold tracking-tight text-white">Automations</span>
          <span className="text-base font-black tracking-tight bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Ignite
          </span>
          <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
            PRO
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span>Smart Pass & Loyalty Automation</span>
          <span>•</span>
          <span className="text-neutral-500 font-mono text-[10px]">automationsignite.com</span>
        </div>
      </div>
    </div>
  );
};
