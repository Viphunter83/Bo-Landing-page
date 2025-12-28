import * as admin from 'firebase-admin'

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, '\n')
}

export function initAdmin() {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
                }),
            })
        } else {
            console.warn("Firebase Admin: Missing environment variables. Skipping initialization.")
            // Potential Mock for Build Time if absolutely needed, or let it fail at runtime
        }
    }
}

// Lazy getters to safely handle missing init during build time imports
export const getAdminDb = () => {
    initAdmin()
    // Check if app was initialized
    if (!admin.apps.length) {
        // Return a mock or throw tailored error?
        // For build safety, if we just import this file but don't call it, we are fine.
        // But `export const adminDb = admin.firestore()` executes immediately.
        // So we MUST NOT export consts that call admin.* immediately.
        throw new Error("Firebase Admin not initialized")
    }
    return admin.firestore()
}

export const getAdminAuth = () => {
    initAdmin()
    return admin.auth()
}

// Fallback for existing code using direct exports (will break if we just remove them)
// We have to change the usage pattern in `route.ts`. 
// OR keep the exports but make them lazy (Proxies?) - too complex.
// Let's refactor the consumers.

