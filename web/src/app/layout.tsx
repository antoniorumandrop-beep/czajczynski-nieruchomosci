import type { Metadata } from 'next'
import { Inter, Newsreader, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

// latin-ext jest obowiazkowe - bez niego ą, ę, ł, ś, ż wypadaja na fallback
// i w polowie naglowkow widac dwa rozne kroje naraz
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  style: ['normal', 'italic'],
})

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Czajczyński Nieruchomości — Wrocław',
  description:
    'Biuro nieruchomości we Wrocławiu. Mieszkania, domy, działki i lokale na sprzedaż i wynajem.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${newsreader.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  )
}
