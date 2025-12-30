'use client'

import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, Copy, Check, Download, ExternalLink } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function QrGeneratorPage() {
    const [activeTab, setActiveTab] = useState<'table' | 'marketing'>('table')
    const [tableNumber, setTableNumber] = useState('1')
    const [startParam, setStartParam] = useState('')
    const [copied, setCopied] = useState(false)
    const { showToast } = useToast()
    const qrRef = useRef<SVGSVGElement>(null)

    // Base URLs
    const webBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bo-landing-page.vercel.app'
    const telegramBotUrl = 'https://t.me/Bo_FCC_bot/app'

    // Generated Values
    const tableUrl = `${webBaseUrl}/?table=${tableNumber}`
    const marketingUrl = startParam
        ? `${telegramBotUrl}?startapp=${startParam}`
        : telegramBotUrl

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        showToast('Link copied to clipboard! 📋', 'success')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        if (!qrRef.current) return

        const svgData = new XMLSerializer().serializeToString(qrRef.current)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
            canvas.width = 500
            canvas.height = 500
            if (ctx) {
                ctx.fillStyle = "white"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 25, 25, 450, 450)

                const pngUrl = canvas.toDataURL("image/png")
                const downloadLink = document.createElement("a")
                downloadLink.href = pngUrl
                downloadLink.download = activeTab === 'table'
                    ? `bo_table_${tableNumber}_qr.png`
                    : `bo_promo_${startParam || 'general'}_qr.png`
                document.body.appendChild(downloadLink)
                downloadLink.click()
                document.body.removeChild(downloadLink)
                URL.revokeObjectURL(url)
                showToast('QR Code downloaded! 🖼️', 'success')
            }
        }
        img.src = url
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow && qrRef.current) {
            const svgData = new XMLSerializer().serializeToString(qrRef.current)
            const title = activeTab === 'table' ? `Table ${tableNumber}` : `Bo Marketing: ${startParam}`

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code - ${title}</title>
                        <style>
                            body { 
                                display: flex; 
                                flex-direction: column; 
                                items-align: center; 
                                justify-content: center; 
                                height: 100vh; 
                                margin: 0; 
                                font-family: sans-serif; 
                            }
                            .container {
                                text-align: center;
                                border: 2px solid #000;
                                padding: 40px;
                                border-radius: 20px;
                                max-width: 400px;
                                margin: 0 auto;
                            }
                            h1 { font-size: 32px; margin-bottom: 20px; }
                            p { font-size: 18px; color: #666; margin-top: 20px; }
                            svg { width: 300px; height: 300px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>${title}</h1>
                            ${svgData}
                            <p>Scan to Order & Pay</p>
                        </div>
                        <script>
                            window.onload = function() { window.print(); window.close(); }
                        </script>
                    </body>
                </html>
            `)
            printWindow.document.close()
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">QR Code Generator</h1>
                <p className="text-zinc-400">Create QR codes for Tables and Marketing Campaigns.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('table')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'table' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Table QR
                    {activeTab === 'table' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('marketing')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'marketing' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Marketing Deep Link
                    {activeTab === 'marketing' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        {activeTab === 'table' ? (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-zinc-400">Table Number</label>
                                <input
                                    type="number"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 font-mono text-xl"
                                    placeholder="1"
                                />
                                <p className="text-sm text-zinc-500">
                                    Generates a link to the web app with table context.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-zinc-400">Start Param (Coupon Code)</label>
                                <input
                                    type="text"
                                    value={startParam}
                                    onChange={(e) => setStartParam(e.target.value.toUpperCase())}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 font-mono text-xl"
                                    placeholder="BO-SUMMER24"
                                />
                                <p className="text-sm text-zinc-500">
                                    Generates a deep link to the Telegram Mini App.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <label className="block text-sm font-medium text-zinc-400">Generated Link</label>
                        <div className="flex items-center gap-2 bg-black p-3 rounded-lg border border-zinc-800">
                            <code className="text-zinc-300 text-sm truncate flex-1">
                                {activeTab === 'table' ? tableUrl : marketingUrl}
                            </code>
                            <button
                                onClick={() => handleCopy(activeTab === 'table' ? tableUrl : marketingUrl)}
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                title="Copy Link"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <a
                                href={activeTab === 'table' ? tableUrl : marketingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                title="Open Link"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-8 shadow-xl">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-black mb-1">
                            {activeTab === 'table' ? `Table ${tableNumber}` : 'Bo Dubai'}
                        </h2>
                        <p className="text-zinc-500 font-medium">Scan to {activeTab === 'table' ? 'Order' : 'Start'}</p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border-4 border-black">
                        <QRCodeSVG
                            ref={qrRef}
                            value={activeTab === 'table' ? tableUrl : marketingUrl}
                            size={250}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                src: "/icons/icon-192x192.png", // Ensure this exists or use a reliable URL
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-2 bg-black text-white hover:bg-zinc-800 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            <Printer size={20} />
                            Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            <Download size={20} />
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
