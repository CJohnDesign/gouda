import { firestore } from '@/lib/firebase-admin'

export interface UserProfile {
  uid: string
  email: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: 'Active' | 'Unpaid' | 'Canceled'
  firstName?: string
  lastName?: string
  telegramUsername?: string
  phoneNumber?: string
  location?: string
  bio?: string
}

export async function getProfileByUid(uid: string): Promise<UserProfile | null> {
  try {
    console.log('Attempting to get profile for uid:', uid);
    const doc = await firestore.collection('profiles').doc(uid).get()
    console.log('Firestore response:', doc.exists ? 'Document exists' : 'Document does not exist');
    
    if (!doc.exists) {
      console.log('No profile document found for uid:', uid);
      return null;
    }

    const data = doc.data();
    console.log('Profile data:', data);
    
    return { uid, ...data } as UserProfile;
  } catch (error) {
    console.error('Error getting profile from Firestore:', error);
    return null;
  }
}

export async function updateProfile(uid: string, data: Partial<UserProfile>) {
  try {
    console.log('Attempting to update profile for uid:', uid, 'with data:', data);
    await firestore.collection('profiles').doc(uid).update(data)
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile in Firestore:', error);
    return false;
  }
} 