import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'driveease_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Listen to cross-component or cross-tab updates
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setWishlist(stored ? JSON.parse(stored) : []);
      } catch {
        setWishlist([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('driveease_wishlist_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('driveease_wishlist_updated', handleStorageChange);
    };
  }, []);

  const toggleWishlist = useCallback((carId: string) => {
    setWishlist((prev) => {
      let next: string[];
      if (prev.includes(carId)) {
        next = prev.filter((id) => id !== carId);
      } else {
        next = [...prev, carId];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event('driveease_wishlist_updated'));
      } catch (err) {
        console.error('Failed to update wishlist in localStorage', err);
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (carId: string) => wishlist.includes(carId),
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setWishlist([]);
      window.dispatchEvent(new Event('driveease_wishlist_updated'));
    } catch (err) {
      console.error('Failed to clear wishlist', err);
    }
  }, []);

  return {
    wishlist,
    wishlistCount: wishlist.length,
    toggleWishlist,
    isWishlisted,
    clearWishlist,
  };
}
