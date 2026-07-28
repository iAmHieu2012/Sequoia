import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function initializeUserRecord(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }, displayName: string) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || 'Anonymous',
      photoUrl: user.photoURL || '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const progressRef = doc(db, 'user_progress', user.uid);
    await setDoc(progressRef, {
      id: user.uid,
      userId: user.uid,
      completedArticleIds: [],
      decodingArticleIds: [],
      lastActive: Date.now()
    });
  }
}
