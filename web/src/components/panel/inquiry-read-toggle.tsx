'use client'

import { useTransition } from 'react'
import { Check, Undo2 } from 'lucide-react'
import { setInquiryRead } from '@/app/panel/actions'

export function InquiryReadToggle({ id, isRead }: { id: string; isRead: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void setInquiryRead(id, !isRead))}
      className="text-body inline-flex h-10 items-center gap-2 px-3 text-[14px] text-[#4A443D] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5 disabled:opacity-50"
    >
      {isRead ? (
        <>
          <Undo2 className="size-4" aria-hidden />
          Oznacz jako nieprzeczytane
        </>
      ) : (
        <>
          <Check className="size-4" aria-hidden />
          Oznacz jako przeczytane
        </>
      )}
    </button>
  )
}
