'use client'

import { Star, Instagram } from 'lucide-react'
import Image from 'next/image'

interface SocialProofProps {
  t: any
}

export default function SocialProof({ t }: SocialProofProps) {
  const socialImages = [
    '1559339352-11d035aa65de',
    '1514933651103-005eec06c04b',
    '1559339352-11d035aa65de',
    '1514933651103-005eec06c04b'
  ]

  return (
    <section className="py-20 bg-zinc-900 overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-12">
        <h3 className="text-white text-xl uppercase tracking-widest mb-2 font-bold">{t.social.title}</h3>
        <div className="flex justify-center gap-1 text-yellow-500 mb-4">
          {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={20} />)}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-8 snap-x mx-4 no-scrollbar">
        {socialImages.map((imgId, i) => (
          <a
            key={i}
            href="https://instagram.com/bo_dubai"
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-[280px] md:min-w-[350px] aspect-[9/16] bg-black rounded-xl overflow-hidden relative shrink-0 snap-center border border-zinc-800 hover:border-yellow-500 transition-all group cursor-pointer"
          >
            <Image
              src={`https://images.unsplash.com/photo-${imgId}?w=600&q=80`}
              alt={`Social proof ${i + 1}`}
              fill
              className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80'
              }}
            />
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm group-hover:text-yellow-400 transition-colors">
                <Instagram size={16} /> @bo_dubai
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

