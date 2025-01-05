require('dotenv').config();
const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');

// Initialize Firebase Admin
const certConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

console.log('Using Firebase config:', {
  projectId: certConfig.projectId,
  clientEmail: certConfig.clientEmail,
  hasPrivateKey: !!certConfig.privateKey,
});

if (!certConfig.projectId || !certConfig.clientEmail || !certConfig.privateKey) {
  console.error('Missing required Firebase credentials in .env file');
  process.exit(1);
}

initializeApp({
  credential: cert(certConfig),
});

const db = admin.firestore();

async function createTestUser() {
  const userId = 'Tj91eYQxxgRXx1h6BOWFEcB1xyB3';
  const userEmail = 'cjohndesign@gmail.com';

  try {
    console.log('Creating/updating test user profile...');

    // Create or update user profile in Firestore
    await db.collection('users').doc(userId).set({
      // Core identity fields
      id: userId,
      uid: userId,
      email: userEmail,
      name: 'CJ Design',
      firstName: 'CJ',
      lastName: 'Design',
      
      // Profile fields
      bio: 'Designer and developer passionate about creating amazing user experiences. Building Gouda to help musicians collaborate and create.',
      location: 'San Francisco, CA',
      avatarUrl: 'https://avatars.githubusercontent.com/u/cjohndesign',
      profilePicUrl: 'https://avatars.githubusercontent.com/u/cjohndesign', // Legacy field
      phoneNumber: '+1234567890',
      telegramUsername: '',

      // Collections/Lists
      playlists: [],
      favoriteSongs: [],
      favoriteArtists: [],
      favoriteAlbums: [],

      // Stripe billing fields
      stripeCustomerId: 'cus_test_123',
      subscriptionStatus: 'Active',
      stripePaymentMethods: [],
      stripeBillingDetails: {
        address: {
          city: 'San Francisco',
          country: 'US',
          line1: '123 Main St',
          postal_code: '94105',
          state: 'CA'
        },
        email: userEmail,
        name: 'CJ Design',
        phone: '+1234567890'
      },
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Metadata flags
      metadata: {
        isPublished: true,
        isFeatured: false,
        isPrivate: false,
        isDeleted: false,
        isDraft: false,
        isPending: false,
        isApproved: true,
        isRejected: false,
        isHidden: false
      }
    }, { merge: false }); // merge: false ensures complete overwrite

    console.log('Setting custom claims...');

    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, {
      stripeRole: 'subscriber',
      stripeCustomerId: 'cus_test_123',
    });

    console.log('Test user created/updated successfully!');
    console.log('User ID:', userId);
    console.log('Email:', userEmail);
    process.exit(0);
  } catch (error) {
    console.error('Error creating/updating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 