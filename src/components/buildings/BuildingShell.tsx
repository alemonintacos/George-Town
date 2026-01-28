import type { ReactNode } from 'react'

interface Props {
  icon: string
  name: string
  subtitle: string
  gradient: string
  border: string
  onBack: () => void
  children: ReactNode
}

export function BuildingShell({ icon, name, subtitle, gradient, border, onBack, children }: Props) {
  return (
    <div className={`bg-gradient-to-br ${gradient} ${border} border-2 rounded-2xl p-6 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-xs font-cinzel font-bold bg-parchment/15 text-parchment/70 rounded-lg hover:bg-parchment/25 transition-colors"
        >
          ← Village
        </button>
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="font-cinzel text-xl font-bold text-gold-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {name}
          </h2>
          <p className="font-lora italic text-parchment/60 text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
