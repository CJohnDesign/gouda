export const checkStorageAvailability = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('Storage availability check failed:', error);
    return false;
  }
};

export const isPrivateMode = () => {
  return new Promise((resolve) => {
    const on = () => resolve(true);
    const off = () => resolve(false);
    
    try {
      const db = indexedDB.open('test');
      db.onerror = on;
      db.onsuccess = off;
    } catch (error) {
      console.warn('Private mode check failed:', error);
      return on();
    }
  });
};

export const getBrowserCapabilities = async () => {
  return {
    hasLocalStorage: checkStorageAvailability(),
    isPrivate: await isPrivateMode(),
    hasIndexedDB: typeof indexedDB !== 'undefined',
    hasCookies: navigator.cookieEnabled
  };
}; 