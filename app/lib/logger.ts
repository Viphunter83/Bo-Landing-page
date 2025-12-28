import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
    level: LogLevel
    message: string
    meta?: any
    timestamp: any
    environment: string
    userAgent?: string
}

const LOG_COLLECTION = 'system_logs'
const IS_DEV = process.env.NODE_ENV === 'development'

class Logger {
    private async log(level: LogLevel, message: string, meta?: any) {
        const entry: LogEntry = {
            level,
            message,
            meta: meta || {},
            timestamp: serverTimestamp(),
            environment: process.env.NODE_ENV || 'unknown',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
        }

        // Always log to console
        const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
        consoleMethod(`[${level.toUpperCase()}] ${message}`, meta || '')

        // In Production (or if forced), save to Firestore
        // We skip 'debug' logs in Firestore to save costs
        if (!IS_DEV && level !== 'debug' && db) {
            try {
                await addDoc(collection(db, LOG_COLLECTION), entry)
            } catch (e) {
                console.error('Failed to write log to Firestore:', e)
            }
        }
    }

    public info(message: string, meta?: any) {
        this.log('info', message, meta)
    }

    public warn(message: string, meta?: any) {
        this.log('warn', message, meta)
    }

    public error(message: string, meta?: any) {
        this.log('error', message, meta)
    }

    public debug(message: string, meta?: any) {
        this.log('debug', message, meta)
    }
}

export const logger = new Logger()
