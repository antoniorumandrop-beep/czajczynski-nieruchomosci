import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center bg-[#F6F2EC] font-sans text-[#1E1B18]">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-micro text-[11px] font-semibold text-[#8A6A3B] uppercase">Błąd 404</p>
        <h1 className="text-display mt-5 font-serif text-[clamp(2rem,5vw,3.5rem)]">
          Tej strony nie ma
        </h1>
        <p className="text-body mt-5 text-[17px] text-[#4A443D]">
          Oferta mogła zostać sprzedana albo wynajęta i zdjęta ze strony. Proszę sprawdzić aktualną
          listę albo zadzwonić — często mamy coś podobnego.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/oferty"
            className="text-body inline-flex h-12 items-center bg-[#1E1B18] px-6 text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
          >
            Aktualne oferty
          </Link>
          <a
            href="tel:+48717944983"
            className="text-body inline-flex h-12 items-center px-6 text-[15px] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5"
          >
            71 794 49 83
          </a>
        </div>
      </div>
    </div>
  )
}
