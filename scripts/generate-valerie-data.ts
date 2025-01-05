import { config } from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { Song } from '@/types/music/song';

// Load .env.local file
config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
const certConfig = {
  projectId: process.env.GOUDA_PROJECT_ID,
  clientEmail: process.env.GOUDA_CLIENT_EMAIL,
  privateKey: process.env.GOUDA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!certConfig.projectId || !certConfig.clientEmail || !certConfig.privateKey) {
  console.error('Missing required Firebase credentials in .env file');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(certConfig as admin.ServiceAccount),
});

const db = getFirestore();

// Generate the song data
function generateSongData(songId: string): Song {
  const now = new Date().toISOString();

  return {
    id: songId,
    title: "Valerie",
    artist: "Mark Ronson",
    featuring: ["Amy Winehouse"],
    artistId: "mark-ronson",
    album: "Version",
    albumId: "version",
    writer: "The Zutons",
    coverUrl: '/images/placeholder.jpg',
    description: "A soulful cover of The Zutons' original song, featuring Amy Winehouse's distinctive vocals",
    releaseYear: 2007,
    genre: ["Soul", "R&B", "Pop"],
    mood: ["Upbeat", "Energetic", "Soulful"],
    duration: "3:39",
    structure: [
      {
        section: "Verse 1",
        lyrics: [
          "Well sometimes I go out by myself and I look across the water",
          "And I think of all the things, what you're doing and in my head I paint a picture"
        ],
        chords: [
          "D#", "Fm",
          "D#", "Fm"
        ]
      },
      {
        section: "Chorus",
        lyrics: [
          "'Cos since I've come on home, well my body's been a mess",
          "And I've missed your ginger hair and the way you like to dress",
          "Won't you come on over, stop making a fool out of me",
          "Why don't you come on over Va-a-lerie, Valerie-e-ee, Va-a-alerie, Valerie-e-ee"
        ],
        chords: [
          "G#", "Gm",
          "G#", "Gm",
          "G#", "Gm", "A#",
          "D#", "Fm", "D#", "Fm"
        ]
      },
      {
        section: "Verse 2",
        lyrics: [
          "Did you have to go to jail, put your house on up for sale, did you get a good lawyer",
          "I hope you didn't catch a tan, I hope you found the right man who'll fix it for ya",
          "Are you shoppin' anywhere, changed the colour of your hair, are you busy?",
          "And did you have to pay that fine you was dodging all the time are you still dizzy?"
        ],
        chords: [
          "D#", "Fm",
          "D#", "Fm",
          "D#", "Fm",
          "D#", "Fm"
        ]
      },
      {
        section: "Chorus",
        lyrics: [
          "'Cos since I've come on home, well my body's been a mess",
          "And I've missed your ginger hair and the way you like to dress",
          "Won't you come on over, stop making a fool out of me",
          "Why don't you come on over Va-a-lerie, Valerie-e-ee, Va-a-alerie, Valerie-e-ee"
        ],
        chords: [
          "G#", "Gm",
          "G#", "Gm",
          "G#", "Gm", "A#",
          "D#", "Fm", "D#", "Fm"
        ]
      },
      {
        section: "Verse 3",
        lyrics: [
          "Well sometimes I go out by myself and I look across the water",
          "And I think of all the things, what you're doing and in my head I paint a picture"
        ],
        chords: [
          "D#", "Fm",
          "D#", "Fm"
        ]
      },
      {
        section: "Chorus",
        lyrics: [
          "'Cos since I've come on home, well my body's been a mess",
          "And I've missed your ginger hair and the way you like to dress",
          "Won't you come on over, stop making a fool out of me",
          "Why don't you come on over Va-a-lerie, Valerie-e-ee, Va-a-alerie, Valerie-e-ee"
        ],
        chords: [
          "G#", "Gm",
          "G#", "Gm",
          "G#", "Gm", "A#",
          "D#", "Fm", "D#", "Fm"
        ]
      },
      {
        section: "Outro",
        lyrics: [
          "mmm Valerie     Valerie-e-ee",
          "Valerie-E-ee, Va-A-le-rieee",
          "Why dont you come on over Valerie..."
        ],
        chords: [
          "D#", "Fm",
          "D#", "Fm",
          "D#maj7"
        ]
      }
    ],
    theory: {
      key: "Eb",
      scale: "major",
      mode: "ionian",
      tempoMarking: "Moderato",
      timeSignature: [4, 4] as [number, number],
      bpm: 96,
      harmonicAnalysis: {
        chordProgression: "I-ii-V-iv progression with soul variations",
        secondaryDominants: [],
        borrowedChords: ["Gm"],
        modulationSections: [],
      },
      melodicAnalysis: {
        vocalRange: "Bb3-Eb5",
        vocalTechniques: ["Belt", "Head Voice", "Soul Runs"],
        motifs: ["Syncopated Rhythm", "Soul Inflections"],
        phrasingPatterns: ["4-bar phrases"],
      },
    },
    chartPerformance: [{
      chartName: 'UK Singles Chart',
      position: 2,
    }],
    hasMaleVocals: false,
    hasFemaleVocals: true,
    hasGuitarSolo: false,
    metadata: {
      isPublished: true,
      isFeatured: true,
      isPrivate: false,
      isDeleted: false,
      isDraft: false,
      isPending: false,
      isApproved: true,
      isRejected: false,
      isHidden: false,
    },
    createdAt: now,
    updatedAt: now,
  };
}

// Main function to generate and upload the data
async function generateValerieData() {
  try {
    console.log('Starting Valerie data generation...');
    const songId = 'valerie';
    const songData = generateSongData(songId);
    
    // Upload to Firestore
    await db.collection('songs').doc(songId).set(songData);
    console.log('Successfully uploaded song data to Firestore!');
  } catch (error) {
    console.error('Error generating data:', error);
  }
}

// Run the generator
generateValerieData().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 