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
      className={`building-card relative bg-gradient-to-br ${gradient} ${border} border-2 rounded-2xl p-6 text-center shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl`}
    >
      <span className="text-4xl block mb-2">{icon}</span>
      <h3 className="font-cinzel text-lg font-bold text-gold-light drop-shadow">{name}</h3>
      <p className="font-lora italic text-parchment/60 text-xs mt-1">{subtitle}</p>
    </button>
  )
}
