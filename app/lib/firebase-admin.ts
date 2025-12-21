import * as admin from 'firebase-admin'

if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

    // Only initialize if we have credentials (prevents build failure)
    if (privateKey && clientEmail) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        })
    }
}

const adminAuth = admin.auth()
const adminDb = admin.firestore()

export { adminAuth, adminDb }
