import { config } from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { Artist } from '@/types/music/artist';
import type { Album } from '@/types/music/album';
import type { Song, SongSection } from '@/types/music/song';
import type { Playlist } from '@/types/music/playlist';

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

// Helper function to get random items from an array
function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get a random item from an array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate a slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Function to delete all existing data
async function deleteAllExistingData() {
  console.log('Deleting existing data...');
  const collections = ['songs', 'artists', 'albums', 'playlists'];
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
  }
  console.log('Finished deleting existing data');
}

// Sample data arrays - exactly 5 options for each type
const artistNames = [
  'Neon',
  'Luna',
  'Pulse',
  'Wave',
  'Echo',
];

const songTitles = [
  'Neural Path',
  'Digital Dream',
  'Quantum Wave',
  'Binary Star',
  'Electric Soul',
];

const genres = [
  'Electronic',
  'Ambient',
  'Synthwave',
  'Progressive',
  'Experimental',
];

const moods = [
  'Energetic',
  'Dreamy',
  'Melancholic',
  'Uplifting',
  'Introspective',
];

const keys = ['C', 'G', 'D', 'A', 'E'];
const scales = ['major', 'minor', 'dorian', 'mixolydian', 'lydian'];
const modes = ['ionian', 'aeolian', 'dorian', 'mixolydian', 'lydian'];
const tempoMarkings = ['Allegro', 'Moderato', 'Andante', 'Vivace', 'Adagio'];
const timeSignatures: [number, number][] = [[4, 4], [3, 4], [6, 8], [2, 4], [5, 4]];
const vocalRanges = ['C3-C4', 'G3-G4', 'D4-D5', 'A3-A4', 'E4-E5'];
const vocalTechniques = ['Belt', 'Head Voice', 'Mix Voice', 'Falsetto', 'Whisper'];

const motifs = [
  'Ascending Scale',
  'Descending Arpeggio',
  'Chromatic Run',
  'Rhythmic Pattern',
  'Melodic Sequence',
];

const phrasingPatterns = [
  '4-bar phrases',
  '8-bar phrases',
  '2-bar motifs',
  '16-bar periods',
  'Irregular phrases',
];

const sectionTypes: ('Intro' | 'Verse' | 'Chorus' | 'Bridge' | 'Outro')[] = [
  'Intro',
  'Verse',
  'Chorus',
  'Bridge',
  'Outro',
];

const rhythmPatterns = [
  '4/4 Straight',
  '3/4 Waltz',
  '6/8 Compound',
  '2/4 March',
  '5/4 Complex',
];

const chordProgressions = [
  // 4-chord progressions
  ['C', 'G', 'Am', 'F'],
  ['Am', 'F', 'C', 'G'],
  ['F', 'G', 'Em', 'Am'],
  // 8-chord progressions
  ['C', 'Em', 'Am', 'F', 'C', 'G', 'Am', 'G'],
  ['Am', 'G', 'F', 'Em', 'Dm', 'C', 'G', 'Am'],
];

const lyrics = [
  ['Digital dreams unfold', 'In the virtual world'],
  ['Quantum waves collide', 'In infinite space'],
  ['Electric pulses flow', 'Through neural networks'],
  ['Binary stars align', 'In cosmic dance'],
  ['Neon lights flicker', 'In endless night'],
];

// Generate metadata
function generateMetadata() {
  return {
    isPublished: Math.random() > 0.1,
    isFeatured: Math.random() > 0.8,
    isPrivate: Math.random() > 0.9,
    isDeleted: false,
    isDraft: Math.random() > 0.9,
    isPending: Math.random() > 0.9,
    isApproved: Math.random() > 0.1,
    isRejected: false,
    isHidden: Math.random() > 0.9,
  };
}

// Generate a song section
function generateSongSection(): SongSection {
  const progression = getRandomItem(chordProgressions);
  return {
    type: getRandomItem(sectionTypes),
    content: [{
      lyrics: getRandomItem(lyrics),
      chordProgression: progression,
    }],
    rhythmPattern: getRandomItem(rhythmPatterns),
    keyChange: Math.random() > 0.8 ? getRandomItem(keys) : undefined,
  };
}

// Generate music theory
function generateMusicTheory() {
  const progression = getRandomItem(chordProgressions);
  return {
    key: getRandomItem(keys),
    scale: getRandomItem(scales),
    mode: getRandomItem(modes),
    tempoMarking: getRandomItem(tempoMarkings),
    timeSignature: getRandomItem(timeSignatures),
    bpm: Math.floor(Math.random() * 60) + 90, // 90-150 BPM
    harmonicAnalysis: {
      chordProgression: progression.join(' - '),
      secondaryDominants: [],
      borrowedChords: [],
      modulationSections: [],
    },
    melodicAnalysis: {
      vocalRange: getRandomItem(vocalRanges),
      vocalTechniques: getRandomItems(vocalTechniques, 2),
      motifs: getRandomItems(motifs, 2),
      phrasingPatterns: [getRandomItem(phrasingPatterns)],
    },
  };
}

// Generate chart performance
function generateChartPerformance() {
  return Math.random() > 0.7 ? [{
    chartName: 'Billboard Hot 100',
    position: Math.floor(Math.random() * 100) + 1,
  }] : undefined;
}

// Generate an artist
function generateArtist(id: string): Artist {
  const name = getRandomItem(artistNames);
  
  return {
    id,
    name,
    bio: `${name} is a groundbreaking artist pushing the boundaries of modern music.`,
    coverUrl: '/images/placeholder.jpg',
    genre: getRandomItems(genres, 2),
    activeYears: '2020-present',
    albums: [],
    songs: [],
    socialLinks: [{
      platform: 'spotify',
      url: `https://spotify.com/artist/${id}`,
    }],
    metadata: generateMetadata(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate an album
function generateAlbum(id: string, artistId: string): Album {
  const title = getRandomItem(songTitles);
  
  return {
    id,
    title,
    artistId,
    releaseYear: 2023,
    coverUrl: '/images/placeholder.jpg',
    genre: getRandomItems(genres, 2),
    description: `A groundbreaking album that pushes the boundaries of modern music.`,
    songs: [],
    metadata: generateMetadata(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate a song
function generateSong(id: string, artistId: string, albumId: string, artist: string, album: string): Song {
  const title = getRandomItem(songTitles);
  
  return {
    id,
    title,
    artist,
    artistId,
    featuring: [],
    album,
    albumId,
    writer: artist,
    coverUrl: '/images/placeholder.jpg',
    description: `A mesmerizing journey through sound and emotion.`,
    releaseYear: 2023,
    genre: getRandomItems(genres, 2),
    mood: getRandomItems(moods, 3),
    duration: `${Math.floor(Math.random() * 2) + 3}:${(Math.floor(Math.random() * 59) + 1).toString().padStart(2, '0')}`,
    sections: [generateSongSection(), generateSongSection(), generateSongSection()],
    theory: generateMusicTheory(),
    chartPerformance: generateChartPerformance(),
    hasMaleVocals: Math.random() > 0.5,
    hasFemaleVocals: Math.random() > 0.5,
    hasGuitarSolo: Math.random() > 0.7,
    metadata: generateMetadata(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate a playlist
function generatePlaylist(id: string, userId: string): Playlist {
  const name = `${getRandomItem(['My', 'Favorite', 'Best', 'Top', 'Ultimate'])} ${getRandomItem(genres)}`;
  
  return {
    id,
    name,
    description: `A curated collection of the finest ${getRandomItem(genres).toLowerCase()} tracks.`,
    ownerId: userId,
    songs: [],
    isPublic: Math.random() > 0.3,
    tags: getRandomItems(genres.concat(moods), 3),
    metadata: generateMetadata(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Main function to generate all data
async function generateAllData() {
  try {
    // First delete all existing data
    await deleteAllExistingData();
    
    console.log('Starting data generation...');
    const batch = db.batch();

    // Generate 5 artists
    const artists: Artist[] = [];
    for (let i = 0; i < 5; i++) {
      const artistId = generateSlug(`${artistNames[i]}`);
      const artist = generateArtist(artistId);
      artists.push(artist);
      batch.set(db.collection('artists').doc(artistId), artist);
    }
    console.log('Generated artists:', artists.map(a => a.name).join(', '));

    // Generate 1 album per artist
    for (const artist of artists) {
      const albumId = generateSlug(`${artist.name}-album`);
      const album = generateAlbum(albumId, artist.id);
      batch.set(db.collection('albums').doc(albumId), album);
      console.log(`Generated album for ${artist.name}`);

      // Generate 1 song per album
      const songId = generateSlug(`${songTitles[0]}-${artist.id}`);
      const song = generateSong(songId, artist.id, album.id, artist.name, album.title);
      batch.set(db.collection('songs').doc(songId), song);
      console.log(`Generated song for album ${album.title}`);

      // Update album with song IDs
      album.songs = [song.id];
      batch.update(db.collection('albums').doc(album.id), { songs: album.songs });

      // Update artist with album and song IDs
      artist.albums = [album.id];
      artist.songs = [song.id];
      batch.update(db.collection('artists').doc(artist.id), { 
        albums: artist.albums,
        songs: artist.songs,
      });
    }

    // Commit all changes
    await batch.commit();
    console.log('Data generation complete!');
  } catch (error) {
    console.error('Error generating data:', error);
  }
}

// Run the generator
generateAllData().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 