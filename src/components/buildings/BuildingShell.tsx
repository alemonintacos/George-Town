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
    <div className={`bg-cream ${gradient} ${border} border-3 rounded-2xl p-6 shadow-[2px_2px_12px_rgba(107,66,38,0.15)]`}>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-xs font-heading font-bold bg-cream-dark border border-wood/30 text-bark rounded-lg hover:bg-wood/10 transition-colors"
        >
          ← Back to Village
        </button>
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="font-heading text-xl font-bold text-wood-dark">
            {name}
          </h2>
          <p className="font-body italic text-text-mid text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
