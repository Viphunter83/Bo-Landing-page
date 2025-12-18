'use client'

import { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
    onUpload: (url: string) => void
    initialImage?: string
}

export default function ImageUpload({ onUpload, initialImage }: ImageUploadProps) {
    const [image, setImage] = useState<string | null>(initialImage || null)
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!storage) {
            alert('Storage not configured or available in this region.')
            return
        }

        setIsLoading(true)
        // Create a unique filename: timestamp_filename
        const storageRef = ref(storage, `menu_images/${Date.now()}_${file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on('state_changed',
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setProgress(p)
            },
            (error) => {
                console.error("Upload error:", error)
                setIsLoading(false)
                alert("Failed to upload image. Did you enable Firebase Storage?")
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImage(downloadURL)
                    onUpload(downloadURL)
                    setIsLoading(false)
                })
            }
        )
    }

    const removeImage = () => {
        setImage(null)
        onUpload('')
    }

    return (
        <div className="w-full">
            {image ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-700 group">
                    <Image
                        src={image}
                        alt="Uploaded preview"
                        fill
                        className="object-cover"
                    />
                    <button
                        onClick={removeImage}
                        type="button"
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-xs text-white rounded">
                        Uploaded
                    </div>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer hover:bg-zinc-900 transition-colors relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-red-500" size={24} />
                            <span className="text-sm text-zinc-500">{Math.round(progress)}%</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-zinc-500" />
                            <p className="mb-2 text-sm text-zinc-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-zinc-500">SVG, PNG, JPG (MAX. 2MB)</p>
                        </div>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </label>
            )}
        </div>
    )
}
