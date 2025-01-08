import { 
  getAuth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  getAdditionalUserInfo,
  User,
  Auth
} from 'firebase/auth';
import { app } from '@/firebase/firebase';
import { getActionCodeSettings } from './routes';

export class AuthService {
  private static instance: AuthService;
  private auth: Auth;
  private EMAIL_STORAGE_KEY = 'emailForSignIn';

  private constructor() {
    this.auth = getAuth(app);
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async sendLoginLink(email: string, returnUrl: string): Promise<void> {
    const settings = getActionCodeSettings(returnUrl);
    await sendSignInLinkToEmail(this.auth, email, settings);
    
    try {
      localStorage.setItem(this.EMAIL_STORAGE_KEY, email);
    } catch (error) {
      console.warn('Unable to save email to localStorage:', error);
      // Continue without storing email
    }
  }

  public async completeSignIn(url: string): Promise<{
    user: User;
    isNewUser: boolean;
  } | null> {
    if (!isSignInWithEmailLink(this.auth, url)) {
      return null;
    }

    let email: string | null = null;

    try {
      email = localStorage.getItem(this.EMAIL_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
    }

    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }

    if (!email) {
      throw new Error('Email is required to complete sign in.');
    }

    try {
      const result = await signInWithEmailLink(this.auth, email, url);
      
      try {
        localStorage.removeItem(this.EMAIL_STORAGE_KEY);
      } catch (error) {
        console.warn('Unable to clear localStorage:', error);
      }

      const additionalInfo = getAdditionalUserInfo(result);
      
      return {
        user: result.user,
        isNewUser: additionalInfo?.isNewUser ?? false
      };
    } catch (error) {
      console.error('Error completing sign in:', error);
      throw error;
    }
  }

  public getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  public isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
} 