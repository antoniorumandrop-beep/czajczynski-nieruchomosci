'use server'

import { inquirySchema, saveInquiry } from '@/lib/inquiries'

export type InquiryState = {
  status: 'idle' | 'ok' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const parsed = inquirySchema.safeParse({
    name: formData.get('name') ?? '',
    contact: formData.get('contact') ?? '',
    message: formData.get('message') ?? '',
    offerId: formData.get('offerId') ?? undefined,
    offerNumber: formData.get('offerNumber') ?? undefined,
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    // pulapka wypelniona - udajemy sukces, zeby bot nie probowal ponownie
    if (fieldErrors.website) return { status: 'ok' }
    return { status: 'error', message: 'Sprawdź zaznaczone pola.', fieldErrors }
  }

  try {
    await saveInquiry(parsed.data)
    return { status: 'ok' }
  } catch {
    return {
      status: 'error',
      message: 'Nie udało się wysłać wiadomości. Zadzwoń pod 71 794 49 83.',
    }
  }
}
