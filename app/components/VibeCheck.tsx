'use client'

import { useState } from 'react'

interface VibeCheckProps {
  t: any
  lang: string
  activeVibe: string
  setActiveVibe: (vibe: string) => void
}

export default function VibeCheck({ t, lang, activeVibe, setActiveVibe }: VibeCheckProps) {

  return (
    <div className="bg-zinc-900 py-16 border-y border-white/5">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
          <span className="text-yellow-500">✨</span> {t.vibe.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {t.vibe.options.map((option: any) => (
            <button
              key={option.id}
              onClick={() => setActiveVibe(option.id)}
              className={`p-6 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group ${
                activeVibe === option.id 
                  ? 'bg-zinc-800 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]' 
                  : 'bg-black border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-white">{option.label}</span>
                {activeVibe === option.id && <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />}
              </div>
              <p className="text-gray-400 text-sm group-hover:text-gray-300">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

