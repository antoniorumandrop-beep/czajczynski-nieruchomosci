import Image from 'next/image'
import type { Agent } from '@/lib/types'

/**
 * Zdjecie agenta albo inicjaly, gdy zdjecia jeszcze nie ma.
 * Wersja z inicjalami nie ma wygladac jak brakujacy element - ma wygladac
 * jak swiadoma decyzja, bo strona bedzie pokazana zanim zdjecia dojda.
 */
export function AgentAvatar({
  agent,
  size = 96,
  className = '',
}: {
  agent: Agent
  size?: number
  className?: string
}) {
  const initials = agent.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden bg-[#E7E0D6] ${className}`}
    >
      {agent.photoUrl ? (
        <Image
          src={agent.photoUrl}
          alt={agent.fullName}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="text-heading absolute inset-0 flex items-center justify-center font-serif text-[#8A6A3B]"
          style={{ fontSize: size * 0.34 }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
