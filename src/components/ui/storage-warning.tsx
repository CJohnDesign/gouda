'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { getBrowserCapabilities } from '@/lib/auth/storage-utils';

export function StorageWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkCapabilities = async () => {
      const capabilities = await getBrowserCapabilities();
      
      if (!capabilities.hasCookies) {
        setMessage('Cookies are disabled. Some features may not work properly.');
        setShowWarning(true);
      } else if (!capabilities.hasLocalStorage && !capabilities.hasIndexedDB) {
        setMessage('Storage access is restricted. Your session may not persist after closing the browser.');
        setShowWarning(true);
      } else if (capabilities.isPrivate) {
        setMessage('Private browsing detected. Your session may not persist after closing the browser.');
        setShowWarning(true);
      }
    };

    checkCapabilities();
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Browser Storage Warning
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            {message}
          </p>
          <button
            onClick={() => setShowWarning(false)}
            className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
} 