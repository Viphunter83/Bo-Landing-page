'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface LanguageSwitcherProps {
  current: string
}

export default function LanguageSwitcher({ current }: LanguageSwitcherProps) {
  const pathname = usePathname()

  const redirectedPathName = (locale: string) => {
    if (!pathname) return '/'
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <div className="flex gap-2 bg-white/10 backdrop-blur-md p-1 rounded-full border border-yellow-500/30">
      {['en', 'ru', 'ar'].map((lang) => (
        <Link
          key={lang}
          href={redirectedPathName(lang)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all uppercase ${current === lang
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
              : 'text-white hover:text-yellow-400'
            }`}
        >
          {lang}
        </Link>
      ))}
    </div>
  )
}


