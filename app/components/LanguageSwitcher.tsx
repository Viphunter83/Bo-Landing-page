'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useTenant } from '../context/TenantContext'

export default function LanguageSwitcher({ current }: { current: string }) {
  const pathname = usePathname()
  const tenantConfig = useTenant()
  const [isOpen, setIsOpen] = useState(false)

  const redirectedPathName = (locale: string) => {
    if (!pathname) return '/'
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <div className="flex gap-2 bg-white/10 backdrop-blur-md p-1 rounded-full border border-primary/30">
      {tenantConfig.localization.languages.map((lang) => (
        <Link
          key={lang}
          href={redirectedPathName(lang)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all uppercase ${current === lang
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'text-white hover:text-primary'
            }`}
        >
          {lang}
        </Link>
      ))}
    </div>
  )
}


