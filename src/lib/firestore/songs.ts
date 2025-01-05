import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Song } from '@/types/music/song';

export async function getSongById(songId: string): Promise<Song | null> {
  try {
    const songRef = doc(db, 'songs', songId);
    const songSnap = await getDoc(songRef);

    if (!songSnap.exists()) {
      return null;
    }

    return {
      id: songSnap.id,
      ...songSnap.data()
    } as Song;
  } catch (error) {
    console.error('Error fetching song:', error);
    return null;
  }
} 