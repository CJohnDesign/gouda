import { config } from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { Song, SongSection } from '@/types/music/song';

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
db.settings({ ignoreUndefinedProperties: true });

// Helper function to generate a slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Generate metadata
function generateMetadata() {
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
  };
}

interface SongStructureSection {
  section: string;
  lyrics: string[];
  chords: string[];
}

// Transform the provided song structure into our SongSection format
function transformSongStructure(structure: SongStructureSection[]): SongSection[] {
  return structure.map(section => ({
    type: section.section as 'Intro' | 'Verse' | 'Chorus' | 'Bridge' | 'Outro' | 'Pre-Chorus' | 'Refrain' | 'Interlude' | 'Solo' | 'Coda',
    content: [{
      lyrics: section.lyrics,
      chordProgression: section.chords,
    }],
    rhythmPattern: '4/4 Rock',
  }));
}

// Generate the song data
function generateSongData(songId: string): Song {
  const songStructure: SongStructureSection[] = [
    {
      section: "Verse 1",
      lyrics: [
        "It's a god-awful small affair",
        "To the girl with the mousy hair",
        "But her mummy is yelling \"No\"",
        "And her daddy has told her to go",
        "But her friend is nowhere to be seen",
        "Now she walks through her sunken dream.",
        "To the seat with the clearest view",
        "And she's hooked to the silver screen"
      ],
      chords: [
        "F", "Am", "Cm/Eb", "D7", "Gm", "Bb", "C7", "F",
        "F", "Am", "Cm/Eb", "D7", "Gm", "Bb", "C7"
      ]
    },
    {
      section: "Pre-Chorus",
      lyrics: [
        "But the film is a saddening bore",
        "For she's lived it ten times or more",
        "She could spit in the eyes of fools",
        "As they ask her to focus on"
      ],
      chords: [
        "Ab", "Eaug", "Fm", "Ab7", "Db", "Aaug", "Bbm", "Db7"
      ]
    },
    {
      section: "Chorus",
      lyrics: [
        "Sailors fighting in the dance hall",
        "Oh man! look at those cavemen go",
        "It's the freakiest show",
        "Take a look at the lawman",
        "Beating up the wrong guy",
        "Oh man! Wonder if he'll ever know",
        "He's in the best selling show",
        "Is there life on Mars?"
      ],
      chords: [
        "Bb", "Eb", "Gm7", "Gbaug", "F", "Fm", "Cm7", "Ebm7",
        "Bb", "Gm", "Gbaug", "Bb/F", "C/E"
      ]
    },
    {
      section: "Bridge",
      lyrics: [],
      chords: [
        "F", "Gbdim", "Gm", "Ddim", "Am", "Bb", "Bbm"
      ]
    },
    {
      section: "Verse 2",
      lyrics: [
        "It's on Amerika's tortured brow",
        "That Mickey Mouse has grown up a cow",
        "Now the workers have struck for fame",
        "'Cause Lennon's on sale again",
        "See the mice in their million hordes",
        "From Ibeza to the norfolk broads",
        "Rule Britannia is out of bounds",
        "To my mother, my dog, and clowns"
      ],
      chords: [
        "F", "Am", "Cm/Eb", "D7", "Gm", "Bb", "C7", "F",
        "F", "Am", "Cm/Eb", "D7", "Gm", "Bb", "C7"
      ]
    },
    {
      section: "Pre-Chorus",
      lyrics: [
        "But the film is a saddening bore",
        "For I've writ it ten times or more",
        "It's about to be writ again",
        "As I ask you to focus on"
      ],
      chords: [
        "Ab", "Eaug", "Fm", "Ab7", "Db", "Aaug", "Bbm", "Db7"
      ]
    },
    {
      section: "Chorus",
      lyrics: [
        "Sailors fighting in the dance hall",
        "Oh man! look at those cavemen go",
        "It's the freakiest show",
        "Take a look at the lawman",
        "Beating up the wrong guy",
        "Oh man! Wonder if he'll ever know",
        "He's in the best selling show",
        "Is there life on Mars?"
      ],
      chords: [
        "Bb", "Eb", "Gm7", "Gbaug", "F", "Fm", "Cm7", "Ebm7",
        "Bb", "Gm", "Gbaug", "Bb/F", "C/E"
      ]
    }
  ];

  const now = new Date().toISOString();

  return {
    id: songId,
    title: "Life on Mars?",
    artist: "David Bowie",
    artistId: "david-bowie",
    featuring: [],
    album: "Hunky Dory",
    albumId: "hunky-dory",
    writer: "David Bowie",
    coverUrl: '/images/placeholder.jpg',
    description: "A masterpiece from the 1971 album Hunky Dory",
    releaseYear: 1971,
    genre: ["Art Rock", "Glam Rock"],
    mood: ["Dramatic", "Theatrical", "Melancholic"],
    duration: "3:53",
    sections: transformSongStructure(songStructure),
    theory: {
      key: "F",
      scale: "major",
      mode: "ionian",
      tempoMarking: "Moderato",
      timeSignature: [4, 4] as [number, number],
      bpm: 126,
      harmonicAnalysis: {
        chordProgression: "Complex progressive harmony",
        secondaryDominants: [],
        borrowedChords: ["Cm/Eb", "Ab7", "Db7"],
        modulationSections: ["Pre-Chorus", "Chorus"],
      },
      melodicAnalysis: {
        vocalRange: "F3-C5",
        vocalTechniques: ["Belt", "Head Voice", "Mix Voice"],
        motifs: ["Ascending Piano Riff", "Dramatic Vocal Lines"],
        phrasingPatterns: ["8-bar phrases"],
      },
    },
    chartPerformance: [{
      chartName: 'UK Singles Chart',
      position: 3,
    }],
    hasMaleVocals: true,
    hasFemaleVocals: false,
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
async function generateBowieData() {
  try {
    console.log('Starting Bowie data generation...');
    const songId = 'life-on-mars';
    const songData = generateSongData(songId);
    
    // Upload to Firestore
    await db.collection('songs').doc(songId).set(songData);
    console.log('Successfully uploaded song data to Firestore!');
  } catch (error) {
    console.error('Error generating data:', error);
  }
}

// Run the generator
generateBowieData().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 