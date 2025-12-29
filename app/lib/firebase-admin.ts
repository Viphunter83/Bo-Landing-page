import * as admin from 'firebase-admin'

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, '\n')
}

export function initAdmin() {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
        const privateKey = process.env.FIREBASE_PRIVATE_KEY

        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: formatPrivateKey(privateKey),
                }),
            })
        } else {
            console.error("Firebase Admin Validation Failed. Missing keys:", {
                projectId: !!projectId,
                clientEmail: !!clientEmail,
                privateKey: !!privateKey
            })
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

export const getAdminMessaging = () => {
    initAdmin()
    return admin.messaging()
}

// Fallback for existing code using direct exports (will break if we just remove them)
// We have to change the usage pattern in `route.ts`. 
// OR keep the exports but make them lazy (Proxies?) - too complex.
// Let's refactor the consumers.

