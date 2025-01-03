export interface UserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicUrl?: string;
  location?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | null;
} 