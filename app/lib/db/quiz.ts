import { addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getTenantCollection } from './tenant_db';

export interface QuizPreferences {
    time: string; // 'quick' | 'relaxed'
    diet: string; // 'clean' | 'comfort'
    spice: string; // 'spicy' | 'mild'
    mood: string; // 'solo' | 'social'
    email?: string; // Captured in Step 4
}

export const saveQuizResult = async (prefs: QuizPreferences, userId?: string, tenantId?: string) => {
    try {
        // 1. Always save the raw quiz result for analytics in the tenant-scoped collection
        const quizResultsRef = getTenantCollection('quiz_results', tenantId);
        const docRef = await addDoc(quizResultsRef, {
            ...prefs,
            userId: userId || null,
            createdAt: serverTimestamp(),
            source: 'web_quiz'
        });
        console.log('Quiz result saved with ID:', docRef.id);

        // 2. If we have a logged-in user, Link results to their CRM Profile
        if (userId) {
            const usersRef = getTenantCollection('users', tenantId);
            const userRef = doc(usersRef, userId);
            await setDoc(userRef, {
                vibe: prefs.mood,
                spice: prefs.spice,
                lastQuizDate: serverTimestamp()
            }, { merge: true });
            console.log('Linked quiz result to User ID:', userId);
        }

        return docRef.id;
    } catch (e) {
        console.error('Error saving quiz result: ', e);
        return null;
    }
}
