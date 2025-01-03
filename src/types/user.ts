export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicUrl?: string;
  location?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId?: string;
  subscriptionStatus?: 'Active' | 'PastDue' | 'Unpaid' | 'Paused' | null;
} 