'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { AuthService } from './auth-service';
import { getRedirectUrl } from './routes';

interface UseAuthFlowProps {
  returnUrl: string;
}

interface UseAuthFlowReturn {
  email: string;
  error: string;
  emailSent: boolean;
  isProcessing: boolean;
  setEmail: (email: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useAuthFlow({ returnUrl }: UseAuthFlowProps): UseAuthFlowReturn {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const authService = AuthService.getInstance();

  const completeSignIn = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const result = await authService.completeSignIn(window.location.href);
      if (result) {
        const { isNewUser } = result;
        router.push(getRedirectUrl(isNewUser));
      }
    } catch (error) {
      console.error('Error completing sign in:', error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/web-storage-unsupported') {
          setError('Your browser settings prevent storing login state. Please enable cookies and local storage.');
        } else {
          setError('Error signing in. Please try again.');
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  }, [router, authService]);

  useEffect(() => {
    completeSignIn();
  }, [completeSignIn]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      await authService.sendLoginLink(email, returnUrl);
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending login link:', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/unauthorized-domain':
            setError('This domain is not authorized for email sign-in.');
            break;
          case 'auth/web-storage-unsupported':
            setError('Your browser settings prevent storing login state. Please enable cookies and local storage.');
            break;
          default:
            setError(error.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    email,
    error,
    emailSent,
    isProcessing,
    setEmail,
    handleSubmit,
  };
} 