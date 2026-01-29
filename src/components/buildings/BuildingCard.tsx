interface Props {
  icon: string
  name: string
  subtitle: string
  gradient: string
  border: string
  onClick: () => void
}

export function BuildingCard({ icon, name, subtitle, gradient, border, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`building-card relative bg-cream ${gradient} ${border} border-3 rounded-2xl p-6 text-center shadow-[2px_2px_12px_rgba(107,66,38,0.15)] cursor-pointer transition-all hover:-translate-y-1`}
    >
      <span className="text-4xl block mb-2">{icon}</span>
      <h3 className="font-heading text-lg font-bold text-wood-dark">{name}</h3>
      <p className="font-body italic text-text-mid text-xs mt-1">{subtitle}</p>
    </button>
  )
}
