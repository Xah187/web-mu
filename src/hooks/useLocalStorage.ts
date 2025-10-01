'use client';

/**
 * useLocalStorage - Web equivalent of mobile app's AsyncStorage
 * Matches: Src/functions/StorageAsync.tsx
 */
export default function useLocalStorage() {
  const getItemsStorage = <T = any>(key: string): Promise<T | null> => {
    return new Promise((resolve) => {
      try {
        if (typeof window === 'undefined') {
          resolve(null);
          return;
        }

        const value = localStorage.getItem(key);
        if (value) {
          const newData = JSON.parse(value);
          if (newData && typeof newData === 'object') {
            resolve(newData);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      } catch (err) {
        console.error('Error getting from localStorage:', err);
        resolve(null);
      }
    });
  };

  const setItemsStorage = async (newData: any, key: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      
      await localStorage.setItem(key, JSON.stringify(newData));
    } catch (err) {
      console.error('Error setting to localStorage:', err);
    }
  };

  const removeStorage = (key: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        if (typeof window === 'undefined') {
          resolve(false);
          return;
        }

        localStorage.removeItem(key);
        resolve(true);
      } catch (err) {
        console.error('Error removing from localStorage:', err);
        resolve(false);
      }
    });
  };

  return { getItemsStorage, setItemsStorage, removeStorage };
}

