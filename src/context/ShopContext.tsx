import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine, HydratedCartLine, Product } from '../types/catalog';
import { getProductById } from '../data/catalogRepository';
import { clampQuantity, computeBagSubtotal, hydrateCartLine } from '../utils/money';

const WISHLIST_STORAGE_KEY = 'md_demo_wishlist_v1';
const BAG_STORAGE_KEY = 'md_demo_bag_v1';
const RECENT_STORAGE_KEY = 'md_demo_recent_v1';

interface ToastMessage {
  id: number;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

interface ShopContextValue {
  wishlistIds: string[];
  wishlistProducts: Product[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;

  bagLines: CartLine[];
  hydratedBagLines: HydratedCartLine[];
  bagItemCount: number;
  bagSubtotalInr: number;
  bagSubtotalFormatted: string;
  addToBag: (productId: string, quantity?: number, openDrawer?: boolean) => void;
  updateBagQuantity: (productId: string, quantity: number) => void;
  removeFromBag: (productId: string) => void;
  clearBag: () => void;

  recentlyViewedIds: string[];
  recentlyViewedProducts: Product[];
  recordProductView: (productId: string) => void;

  isBagDrawerOpen: boolean;
  openBagDrawer: () => void;
  closeBagDrawer: () => void;

  isSearchOverlayOpen: boolean;
  openSearchOverlay: () => void;
  closeSearchOverlay: () => void;

  toast: ToastMessage | null;
  dismissToast: () => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWriteStorage(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gracefully ignore storage quota or privacy-mode errors (Prompt 161 & 165)
  }
}

function sanitizeWishlist(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const valid: string[] = [];
  const seen = new Set<string>();
  for (const id of raw) {
    if (typeof id === 'string') {
      const upper = id.toUpperCase();
      if (!seen.has(upper) && getProductById(upper)) {
        seen.add(upper);
        valid.push(upper);
      }
    }
  }
  return valid;
}

function sanitizeBag(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const valid: CartLine[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (entry && typeof entry === 'object' && 'productId' in entry) {
      const pid = String((entry as CartLine).productId).toUpperCase();
      const qty = clampQuantity(Number((entry as CartLine).quantity ?? 1));
      const addedAt = Number((entry as CartLine).addedAt ?? Date.now());
      if (!seen.has(pid) && getProductById(pid)) {
        seen.add(pid);
        valid.push({ productId: pid, quantity: qty, addedAt });
      }
    }
  }
  return valid;
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    sanitizeWishlist(safeReadStorage(WISHLIST_STORAGE_KEY, []))
  );
  const [bagLines, setBagLines] = useState<CartLine[]>(() =>
    sanitizeBag(safeReadStorage(BAG_STORAGE_KEY, []))
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    sanitizeWishlist(safeReadStorage(RECENT_STORAGE_KEY, [])).slice(0, 4)
  );

  const [isBagDrawerOpen, setIsBagDrawerOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    safeWriteStorage(WISHLIST_STORAGE_KEY, wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    safeWriteStorage(BAG_STORAGE_KEY, bagLines);
  }, [bagLines]);

  useEffect(() => {
    safeWriteStorage(RECENT_STORAGE_KEY, recentlyViewedIds);
  }, [recentlyViewedIds]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    setToast({ ...msg, id: Date.now() });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId.toUpperCase()),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      const upper = productId.toUpperCase();
      const product = getProductById(upper);
      if (!product) return;

      setWishlistIds((prev) => {
        const exists = prev.includes(upper);
        if (exists) {
          showToast({
            title: 'Removed from Wishlist',
            subtitle: product.displayTitle,
          });
          return prev.filter((id) => id !== upper);
        } else {
          showToast({
            title: 'Saved to Wishlist',
            subtitle: product.displayTitle,
            actionLabel: 'View Wishlist',
            actionHref: '/wishlist',
          });
          return [upper, ...prev];
        }
      });
    },
    [showToast]
  );

  const removeFromWishlist = useCallback((productId: string) => {
    const upper = productId.toUpperCase();
    setWishlistIds((prev) => prev.filter((id) => id !== upper));
  }, []);

  const addToBag = useCallback(
    (productId: string, quantity = 1, openDrawer = false) => {
      const upper = productId.toUpperCase();
      const product = getProductById(upper);
      if (!product) return;

      const safeQty = clampQuantity(quantity);
      setBagLines((prev) => {
        const existingIndex = prev.findIndex((item) => item.productId === upper);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const nextQty = clampQuantity(updated[existingIndex].quantity + safeQty);
          updated[existingIndex] = { ...updated[existingIndex], quantity: nextQty };
          return updated;
        }
        return [{ productId: upper, quantity: safeQty, addedAt: Date.now() }, ...prev];
      });

      if (openDrawer) {
        setIsBagDrawerOpen(true);
      } else {
        showToast({
          title: 'Added to Bag',
          subtitle: `${product.displayTitle} (Qty ${safeQty})`,
          actionLabel: 'View Bag',
          actionHref: '/bag',
        });
      }
    },
    [showToast]
  );

  const updateBagQuantity = useCallback((productId: string, quantity: number) => {
    const upper = productId.toUpperCase();
    const safeQty = clampQuantity(quantity);
    setBagLines((prev) =>
      prev.map((line) => (line.productId === upper ? { ...line, quantity: safeQty } : line))
    );
  }, []);

  const removeFromBag = useCallback((productId: string) => {
    const upper = productId.toUpperCase();
    setBagLines((prev) => prev.filter((line) => line.productId !== upper));
  }, []);

  const clearBag = useCallback(() => {
    setBagLines([]);
  }, []);

  const recordProductView = useCallback((productId: string) => {
    const upper = productId.toUpperCase();
    if (!getProductById(upper)) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== upper);
      return [upper, ...filtered].slice(0, 4);
    });
  }, []);

  const wishlistProducts = useMemo(
    () =>
      wishlistIds
        .map((id) => getProductById(id))
        .filter((p): p is Product => Boolean(p)),
    [wishlistIds]
  );

  const hydratedBagLines = useMemo(
    () =>
      bagLines
        .map((line) => {
          const product = getProductById(line.productId);
          if (!product) return null;
          return hydrateCartLine(product, line.quantity);
        })
        .filter((item): item is HydratedCartLine => Boolean(item)),
    [bagLines]
  );

  const bagSummary = useMemo(() => computeBagSubtotal(hydratedBagLines), [hydratedBagLines]);

  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => getProductById(id))
        .filter((p): p is Product => Boolean(p)),
    [recentlyViewedIds]
  );

  const openBagDrawer = useCallback(() => setIsBagDrawerOpen(true), []);
  const closeBagDrawer = useCallback(() => setIsBagDrawerOpen(false), []);
  const openSearchOverlay = useCallback(() => setIsSearchOverlayOpen(true), []);
  const closeSearchOverlay = useCallback(() => setIsSearchOverlayOpen(false), []);

  const value = useMemo<ShopContextValue>(
    () => ({
      wishlistIds,
      wishlistProducts,
      wishlistCount: wishlistProducts.length,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,

      bagLines,
      hydratedBagLines,
      bagItemCount: bagSummary.totalUnits,
      bagSubtotalInr: bagSummary.subtotalInr,
      bagSubtotalFormatted: bagSummary.subtotalFormatted,
      addToBag,
      updateBagQuantity,
      removeFromBag,
      clearBag,

      recentlyViewedIds,
      recentlyViewedProducts,
      recordProductView,

      isBagDrawerOpen,
      openBagDrawer,
      closeBagDrawer,

      isSearchOverlayOpen,
      openSearchOverlay,
      closeSearchOverlay,

      toast,
      dismissToast,
    }),
    [
      wishlistIds,
      wishlistProducts,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      bagLines,
      hydratedBagLines,
      bagSummary,
      addToBag,
      updateBagQuantity,
      removeFromBag,
      clearBag,
      recentlyViewedIds,
      recentlyViewedProducts,
      recordProductView,
      isBagDrawerOpen,
      openBagDrawer,
      closeBagDrawer,
      isSearchOverlayOpen,
      openSearchOverlay,
      closeSearchOverlay,
      toast,
      dismissToast,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return ctx;
}

