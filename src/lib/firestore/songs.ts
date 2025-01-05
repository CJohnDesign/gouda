import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore'
import { app } from '@/firebase/firebase'
import type { Song } from '@/types/music/song'

const db = getFirestore(app)

export async function getSongById(songId: string): Promise<Song | null> {
  try {
    const songRef = doc(db, 'songs', songId)
    const songSnap = await getDoc(songRef)

    if (!songSnap.exists()) {
      return null
    }

    return {
      id: songSnap.id,
      ...songSnap.data()
    } as Song
  } catch (error) {
    console.error('Error fetching song:', error)
    return null
  }
}

export async function getAllSongs(): Promise<Song[]> {
  try {
    const songsQuery = query(
      collection(db, 'songs'),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(songsQuery)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Song[]
  } catch (error) {
    console.error('Error fetching songs:', error)
    return []
  }
} 