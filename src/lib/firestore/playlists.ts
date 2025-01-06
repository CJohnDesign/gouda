import { 
  doc, 
  collection,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
  onSnapshot,
  updateDoc
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { Playlist, PlaylistRole, UserPlaylist } from '@/types/music/playlist'

// Subscribe to playlist changes
export function subscribeToPlaylist(
  playlistId: string,
  onUpdate: (playlist: Playlist | null) => void
): () => void {
  const playlistRef = doc(db, 'playlists', playlistId)
  
  return onSnapshot(playlistRef, (doc) => {
    if (!doc.exists()) {
      onUpdate(null)
      return
    }

    const data = doc.data()
    // Ensure we're getting the latest timestamp values
    const createdAt = data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null
    const updatedAt = data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : null

    onUpdate({
      ...data,
      id: doc.id,
      createdAt,
      updatedAt
    } as Playlist)
  })
}

// Create a new playlist
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string | null,
  isPublic: boolean = false
): Promise<string> {
  const playlistRef = doc(collection(db, 'playlists'))
  const now = serverTimestamp()
  
  // Create base playlist data
  const playlistData: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt: FieldValue;
    updatedAt: FieldValue;
  } = {
    name,
    ownerId: userId,
    songs: [],
    isPublic,
    tags: [],
    likeCount: 0,
    shareCount: 0,
    createdAt: now,
    updatedAt: now,
    metadata: {
      isPublished: true,
      isFeatured: false,
      isPrivate: !isPublic,
      isDeleted: false,
      isDraft: false,
      isPending: false,
      isApproved: true,
      isRejected: false,
      isHidden: false
    }
  }

  // Add description if provided
  if (description?.trim()) {
    playlistData.description = description.trim()
  }

  // Create the playlist document
  await setDoc(playlistRef, {
    id: playlistRef.id,
    ...playlistData
  })

  // Add to user's playlists
  await setDoc(
    doc(db, `users/${userId}/playlists/${playlistRef.id}`),
    {
      id: playlistRef.id,
      role: 'owner' as PlaylistRole,
      addedAt: now
    }
  )

  return playlistRef.id
}

// Get a playlist by ID
export async function getPlaylist(playlistId: string): Promise<Playlist | null> {
  const playlistRef = doc(db, 'playlists', playlistId)
  const playlistSnap = await getDoc(playlistRef)

  if (!playlistSnap.exists()) {
    return null
  }

  const data = playlistSnap.data()
  return {
    ...data,
    id: playlistSnap.id,
    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : null
  } as Playlist
}

// Get all playlists for a user
export async function getUserPlaylists(userId: string): Promise<{
  playlist: Playlist;
  userAccess: UserPlaylist;
}[]> {
  // Get user's playlist references
  const userPlaylistsRef = collection(db, `users/${userId}/playlists`)
  const userPlaylistsSnap = await getDocs(userPlaylistsRef)
  
  // Get full playlist data for each reference
  const playlists = await Promise.all(
    userPlaylistsSnap.docs.map(async (doc) => {
      const userAccess = {
        ...doc.data(),
        addedAt: (doc.data().addedAt as Timestamp).toDate().toISOString()
      } as UserPlaylist

      const playlist = await getPlaylist(doc.data().id)
      if (!playlist) return null

      return {
        playlist,
        userAccess
      }
    })
  )

  return playlists.filter((p): p is NonNullable<typeof p> => p !== null)
}

// Add a song to a playlist
export async function addSongToPlaylist(
  playlistId: string,
  songId: string,
  userId: string
): Promise<void> {
  const playlistRef = doc(db, 'playlists', playlistId)
  const playlistSnap = await getDoc(playlistRef)

  if (!playlistSnap.exists()) {
    throw new Error('Playlist not found')
  }

  const playlist = playlistSnap.data() as Playlist
  
  // Check if user has access
  if (playlist.ownerId !== userId) {
    const accessRef = doc(db, `playlistAccess/${playlistId}/users/${userId}`)
    const accessSnap = await getDoc(accessRef)
    
    if (!accessSnap.exists() || accessSnap.data().role === 'viewer') {
      throw new Error('Unauthorized')
    }
  }

  // Add song if it's not already in the playlist
  if (!playlist.songs.includes(songId)) {
    await setDoc(playlistRef, {
      songs: [...playlist.songs, songId],
      updatedAt: serverTimestamp()
    }, { merge: true })
  }
}

// Remove a song from a playlist
export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string,
  userId: string
): Promise<void> {
  const playlistRef = doc(db, 'playlists', playlistId)
  const playlistSnap = await getDoc(playlistRef)

  if (!playlistSnap.exists()) {
    throw new Error('Playlist not found')
  }

  const playlist = playlistSnap.data() as Playlist
  
  // Check if user has access
  if (playlist.ownerId !== userId) {
    const accessRef = doc(db, `playlistAccess/${playlistId}/users/${userId}`)
    const accessSnap = await getDoc(accessRef)
    
    if (!accessSnap.exists() || accessSnap.data().role === 'viewer') {
      throw new Error('Unauthorized')
    }
  }

  await setDoc(playlistRef, {
    songs: playlist.songs.filter(id => id !== songId),
    updatedAt: serverTimestamp()
  }, { merge: true })
}

// Share a playlist with another user
export async function sharePlaylist(
  playlistId: string,
  targetUserId: string,
  role: PlaylistRole,
  userId: string
): Promise<void> {
  const playlistRef = doc(db, 'playlists', playlistId)
  const playlistSnap = await getDoc(playlistRef)

  if (!playlistSnap.exists()) {
    throw new Error('Playlist not found')
  }

  const playlist = playlistSnap.data() as Playlist
  
  // Only owner can share
  if (playlist.ownerId !== userId) {
    throw new Error('Unauthorized')
  }

  const now = serverTimestamp()

  // Add access for target user
  await setDoc(
    doc(db, `playlistAccess/${playlistId}/users/${targetUserId}`),
    {
      userId: targetUserId,
      role,
      addedAt: now
    }
  )

  // Add to target user's playlists
  await setDoc(
    doc(db, `users/${targetUserId}/playlists/${playlistId}`),
    {
      id: playlistId,
      role,
      addedAt: now
    }
  )

  // Increment share count
  await setDoc(playlistRef, {
    shareCount: (playlist.shareCount || 0) + 1,
    updatedAt: now
  }, { merge: true })
}

interface SongPosition {
  id: string
  position: number
}

export async function updatePlaylistSongPositions(
  playlistId: string,
  songPositions: SongPosition[]
): Promise<void> {
  const playlistRef = doc(db, 'playlists', playlistId)
  
  try {
    await updateDoc(playlistRef, {
      songs: songPositions.sort((a, b) => a.position - b.position).map(s => s.id),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating song positions:', error)
    throw error
  }
}

// Update playlist details
export async function updatePlaylist(
  playlistId: string,
  updates: Partial<Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const playlistRef = doc(db, 'playlists', playlistId)
  
  try {
    await updateDoc(playlistRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating playlist:', error)
    throw error
  }
} 