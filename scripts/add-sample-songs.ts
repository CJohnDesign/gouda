import { config } from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local file
config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Debug info
console.log('Environment variables:', {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length,
});

console.log('Using Firebase config:', {
  projectId: serviceAccount.projectId,
  clientEmail: serviceAccount.clientEmail,
  hasPrivateKey: !!serviceAccount.privateKey,
});

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Missing required Firebase credentials in .env file');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = getFirestore();

// Sample data arrays for generating random combinations
const genres = ['Electronic', 'Ambient', 'Techno', 'IDM', 'Synthwave', 'House', 'Drum & Bass', 'Experimental', 'Downtempo', 'Progressive'];
const moods = ['Atmospheric', 'Calm', 'Energetic', 'Complex', 'Nostalgic', 'Dark', 'Uplifting', 'Melancholic', 'Euphoric', 'Introspective'];
const keys = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bm', 'C#', 'F#m', 'Gm', 'Abm', 'Bb'];
const artists = [
  'The Neon Collective', 'Luna Echo', 'Digital Pulse', 'Synthwave Saints', 'AI Orchestra',
  'Neural Beats', 'Quantum Harmonics', 'Circuit Theory', 'Data Flow', 'Echo Chamber',
  'Binary Dreams', 'Analog Future', 'Digital Horizon', 'Cyber Symphony', 'Virtual State'
];

// Function to generate a random song
function generateRandomSong() {
  const bpm = Math.floor(Math.random() * 60) + 90; // 90-150 BPM
  const minutes = Math.floor(Math.random() * 4) + 3; // 3-7 minutes
  const seconds = Math.floor(Math.random() * 60);
  const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const releaseYear = Math.random() < 0.7 ? 2024 : 2023;
  
  const artist = artists[Math.floor(Math.random() * artists.length)];
  const genre = genres[Math.floor(Math.random() * genres.length)];
  const mood = moods[Math.floor(Math.random() * moods.length)];
  const key = keys[Math.floor(Math.random() * keys.length)];
  
  // Generate a title based on combinations of words
  const titlePrefixes = ['Digital', 'Cyber', 'Neural', 'Quantum', 'Sonic', 'Electric', 'Virtual', 'Binary', 'Analog', 'Future'];
  const titleSuffixes = ['Dreams', 'Pulse', 'Wave', 'Echo', 'Signal', 'State', 'Flow', 'Path', 'Space', 'Light'];
  const title = `${titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)]} ${titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)]}`;
  
  return {
    title,
    artist,
    coverUrl: '/images/placeholder.jpg',
    bpm,
    key,
    genre,
    mood,
    duration,
    releaseYear,
    description: Math.random() < 0.3 ? `An ${mood.toLowerCase()} journey through ${genre.toLowerCase()} soundscapes.` : null
  };
}

// Generate 50 sample songs
const sampleSongs = Array.from({ length: 50 }, generateRandomSong);

async function addSampleSongs() {
  try {
    console.log('Starting to add sample songs...');
    
    // Create a batch
    const batch = db.batch();
    
    // Add each song to the batch with auto-generated IDs
    for (const song of sampleSongs) {
      const songRef = db.collection('songs').doc(); // Let Firestore generate the ID
      batch.set(songRef, {
        ...song,
        id: songRef.id, // Use the auto-generated ID
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log('Successfully added sample songs!');
    console.log('Number of songs added:', sampleSongs.length);
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample songs:', error);
    process.exit(1);
  }
}

// Run the script
addSampleSongs(); 