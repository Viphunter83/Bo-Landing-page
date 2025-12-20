import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface QuizPreferences {
    time: string; // 'quick' | 'relaxed'
    diet: string; // 'clean' | 'comfort'
    spice: string; // 'spicy' | 'mild'
    mood: string; // 'solo' | 'social'
}

export const saveQuizResult = async (prefs: QuizPreferences) => {
    if (!db) {
        console.warn('Firestore is not initialized. Quiz result not saved.');
        return null;
    }

    try {
        const docRef = await addDoc(collection(db, 'quiz_results'), {
            ...prefs,
            createdAt: serverTimestamp(),
            source: 'web_quiz'
        });
        console.log('Quiz result saved with ID:', docRef.id);
        return docRef.id;
    } catch (e) {
        console.error('Error saving quiz result: ', e);
        return null;
    }
}
