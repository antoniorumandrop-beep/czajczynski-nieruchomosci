export function NotConfigured() {
  return (
    <div className="border border-[#8A6A3B]/40 bg-[#F1EBE2] p-6">
      <p className="text-heading font-serif text-xl text-[#1E1B18]">
        Panel nie jest jeszcze podłączony do bazy
      </p>
      <p className="text-body mt-3 text-[15px] text-[#4A443D]">
        Brakuje kluczy Supabase. Strona publiczna działa na danych z pliku, ale logowanie,
        dodawanie ofert i wgrywanie zdjęć wymagają bazy.
      </p>
      <p className="text-body mt-3 text-[15px] text-[#6B645B]">
        Instrukcja krok po kroku jest w pliku <code className="font-mono text-[14px]">SETUP.md</code>{' '}
        w katalogu projektu.
      </p>
    </div>
  )
}
