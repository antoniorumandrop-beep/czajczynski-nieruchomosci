import { OFFER_STATUSES, type OfferStatus } from '@/lib/types'

export function StatusBadge({ status }: { status: OfferStatus }) {
  const tone =
    status === 'published'
      ? 'bg-[#EFF4EC] text-[#2C5731]'
      : status === 'draft'
        ? 'bg-[#F1EBE2] text-[#8A6A3B]'
        : 'bg-[#1E1B18]/8 text-[#4A443D]'

  return (
    <span className={`text-micro shrink-0 px-2.5 py-1 text-[10px] font-semibold uppercase ${tone}`}>
      {OFFER_STATUSES[status].label}
    </span>
  )
}
