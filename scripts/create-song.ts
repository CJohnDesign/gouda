import { config } from 'dotenv'
import * as path from 'path'
import * as admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import type { Song } from '@/types/music/song'
import fs from 'fs'

// Load .env.local file
config({ path: path.resolve(process.cwd(), '.env.local') })

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Missing required Firebase credentials in .env file')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
})

const db = getFirestore()

// Helper function to generate a slug
function generateSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

// Helper function to generate metadata
function generateMetadata(songData: any) {
  const now = new Date().toISOString()
  return {
    isPublished: true,
    isFeatured: true,
    isPrivate: false,
    isDeleted: false,
    isDraft: false,
    isPending: false,
    isApproved: true,
    isRejected: false,
    isHidden: false,
    createdAt: now,
    updatedAt: now,
    releaseDate: songData.releaseDate || '1973-06-01',
    recordLabel: songData.recordLabel || 'RCA Records',
    producer: songData.producer || 'Unknown',
    studio: songData.studio || 'Unknown',
    duration: songData.duration || '3:30',
    album: songData.album || 'Unknown',
    albumArt: songData.albumArt || '',
    spotifyUrl: songData.spotifyUrl || '',
    youtubeUrl: songData.youtubeUrl || '',
    appleMusicUrl: songData.appleMusicUrl || '',
  }
}

async function createSong() {
  try {
    // Get the song name from command line arguments
    const songArg = process.argv[2]
    if (!songArg) {
      console.error('Please provide a song name as an argument')
      process.exit(1)
    }

    // Read the song JSON file
    const songPath = path.join(__dirname, 'songs', `${songArg}.json`)
    if (!fs.existsSync(songPath)) {
      console.error(`Song file not found: ${songPath}`)
      process.exit(1)
    }

    const songData = JSON.parse(fs.readFileSync(songPath, 'utf-8'))
    const slug = generateSlug(songData.title)
    const now = new Date().toISOString()

    // Create the song document
    const songDoc: Partial<Song> = {
      id: slug,
      title: songData.title,
      artist: songData.artist,
      featuring: songData.featuring || [],
      artistId: songData.artistId || generateSlug(songData.artist),
      album: songData.album || 'Unknown',
      albumId: songData.albumId || generateSlug(songData.album || 'Unknown'),
      writer: songData.writer || songData.artist,
      coverUrl: songData.coverUrl || '/images/placeholder.jpg',
      description: songData.description || '',
      releaseYear: songData.releaseYear || new Date().getFullYear(),
      structure: songData.structure || [],
      genre: songData.genre || ['Pop'],
      mood: songData.mood || ['Upbeat'],
      duration: songData.duration || '3:30',
      theory: {
        key: songData.theory?.key || 'C',
        mode: songData.theory?.mode || 'Major',
        scale: songData.theory?.scale || 'Major',
        timeSignature: songData.theory?.timeSignature || [4, 4],
        bpm: songData.theory?.bpm || 120,
        tempoMarking: songData.theory?.tempoMarking || 'Moderato',
        harmonicAnalysis: {
          chordProgression: songData.theory?.harmonicAnalysis?.chordProgression || '',
          secondaryDominants: songData.theory?.harmonicAnalysis?.secondaryDominants || [],
          borrowedChords: songData.theory?.harmonicAnalysis?.borrowedChords || [],
          modulationSections: songData.theory?.harmonicAnalysis?.modulationSections || []
        },
        melodicAnalysis: {
          vocalRange: songData.theory?.melodicAnalysis?.vocalRange || 'Mid',
          vocalTechniques: songData.theory?.melodicAnalysis?.vocalTechniques || ['Chest Voice'],
          motifs: songData.theory?.melodicAnalysis?.motifs || [],
          phrasingPatterns: songData.theory?.melodicAnalysis?.phrasingPatterns || []
        }
      },
      chartPerformance: songData.chartPerformance || [],
      hasFemaleVocals: songData.hasFemaleVocals || false,
      hasMaleVocals: songData.hasMaleVocals || true,
      hasGuitarSolo: songData.hasGuitarSolo || false,
      createdAt: now,
      updatedAt: now,
      metadata: generateMetadata(songData),
    }

    // Save to Firestore
    await db.collection('songs').doc(slug).set(songDoc)
    console.log(`Successfully created song: ${songData.title}`)

  } catch (error) {
    console.error('Error creating song:', error)
    process.exit(1)
  }
}

// Run the script
createSong().then(() => {
  console.log('Script completed successfully')
  process.exit(0)
}).catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
}) 