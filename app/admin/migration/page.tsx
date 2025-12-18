'use client'

import { useState } from 'react'
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { fullMenu } from '../../data/menuData'
import { content } from '../../data/content'

export default function MigrationPage() {
    const [status, setStatus] = useState('Idle')
    const [log, setLog] = useState<string[]>([])

    const addLog = (msg: string) => setLog(prev => [...prev, msg])

    const migrateMenu = async () => {
        addLog('Starting Menu Migration...')
        try {
            const batch = writeBatch(db)

            fullMenu.forEach((item) => {
                const ref = doc(db, 'menu_items', item.id)
                batch.set(ref, item)
            })

            await batch.commit()
            addLog(`Success: Migrated ${fullMenu.length} menu items.`)
        } catch (e) {
            addLog(`Error migrating menu: ${e}`)
            console.error(e)
        }
    }

    const migrateContent = async () => {
        addLog('Starting Content Migration...')
        try {
            const batch = writeBatch(db)

            // content is { en: {...}, ru: {...}, ar: {...} }
            Object.entries(content).forEach(([lang, data]) => {
                const ref = doc(db, 'site_content', lang)
                batch.set(ref, data)
            })

            await batch.commit()
            addLog(`Success: Migrated content for ${Object.keys(content).join(', ')}.`)
        } catch (e) {
            addLog(`Error migrating content: ${e}`)
            console.error(e)
        }
    }

    const runAll = async () => {
        setStatus('Migrating...')
        setLog([])
        await migrateMenu()
        await migrateContent()
        setStatus('Done')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-4">Data Migration</h1>
                <p className="text-zinc-400">
                    Upload local JSON data to Firestore. checks console for details.
                </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <button
                    onClick={runAll}
                    disabled={status === 'Migrating...'}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                >
                    {status === 'Migrating...' ? 'Migrating...' : 'Start Migration'}
                </button>
            </div>

            <div className="bg-black p-4 rounded-lg border border-zinc-800 font-mono text-sm h-64 overflow-y-auto">
                {log.map((l, i) => (
                    <div key={i} className="mb-1 text-green-400">{l}</div>
                ))}
            </div>
        </div>
    )
}
