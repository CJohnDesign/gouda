import { 
  getAuth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  getAdditionalUserInfo,
  User,
  Auth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { app } from '@/firebase/firebase';
import { getActionCodeSettings } from './routes';
import { getBrowserCapabilities } from './storage-utils';

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

  public async setupAuthPersistence(): Promise<string> {
    try {
      const capabilities = await getBrowserCapabilities();
      
      if (capabilities.hasIndexedDB) {
        await setPersistence(this.auth, indexedDBLocalPersistence);
        console.log('Using IndexedDB persistence');
        return 'indexedDB';
      } 
      
      if (capabilities.hasLocalStorage) {
        await setPersistence(this.auth, browserLocalPersistence);
        console.log('Using localStorage persistence');
        return 'localStorage';
      }
      
      // Fall back to in-memory
      await setPersistence(this.auth, inMemoryPersistence);
      console.log('Using in-memory persistence - session will be lost on browser close');
      return 'inMemory';
    } catch (error) {
      console.error('Error setting auth persistence:', error);
      // Always fall back to in-memory as last resort
      await setPersistence(this.auth, inMemoryPersistence);
      return 'inMemory';
    }
  }

  public async sendLoginLink(email: string, returnUrl: string): Promise<void> {
    const settings = getActionCodeSettings(returnUrl);
    await sendSignInLinkToEmail(this.auth, email, settings);
    
    try {
      localStorage.setItem(this.EMAIL_STORAGE_KEY, email);
    } catch (error) {
      console.warn('Unable to save email to localStorage:', error);
      // Continue without storing email - user will need to re-enter email
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
      console.error('Error completing sign in:', error instanceof Error ? error.message : 'Unknown error');
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

// Export a singleton instance setup function for convenience
export const setupAuthPersistence = async (): Promise<string> => {
  const authService = AuthService.getInstance();
  return authService.setupAuthPersistence();
}; 