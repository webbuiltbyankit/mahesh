import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Instagram,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getAllApprovedProducts, getBrandMetadata } from '../data/catalogRepository';
import { filterAndSortProducts } from '../utils/search';
import {
  buildBagWhatsAppUrl,
  buildGeneralWhatsAppUrl,
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  WHATSAPP_DISPLAY_NUMBER,
} from '../utils/whatsapp';

const QUICK_SEARCH_TERMS = [
  'Tussar Banaras',
  'Chanderi',
  'Soft Banarasi',
  'Vichitra Silk',
  'Cotton',
  'Organza',
  'SKU052MAUVAPUR',
];

export const SiteLayout: React.FC = () => {
  const brand = getBrandMetadata();
  const allProducts = useMemo(() => getAllApprovedProducts(), []);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    wishlistCount,
    bagItemCount,
    hydratedBagLines,
    bagSubtotalInr,
    bagSubtotalFormatted,
    updateBagQuantity,
    removeFromBag,
    isBagDrawerOpen,
    openBagDrawer,
    closeBagDrawer,
    isSearchOverlayOpen,
    openSearchOverlay,
    closeSearchOverlay,
    toast,
    dismissToast,
  } = useShop();

  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to top on route pathname change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setIsMobileMenuOpen(false);
    closeBagDrawer();
    closeSearchOverlay();
  }, [location.pathname, closeBagDrawer, closeSearchOverlay]);

  // Sticky header elevation state
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchOverlayOpen) {
      const id = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(id);
    } else {
      setQuickQuery('');
    }
  }, [isSearchOverlayOpen]);

  // Global Escape key listener for drawers/modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOverlayOpen) closeSearchOverlay();
        if (isBagDrawerOpen) closeBagDrawer();
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOverlayOpen, isBagDrawerOpen, isMobileMenuOpen, closeSearchOverlay, closeBagDrawer]);

  const instantMatches = useMemo(() => {
    if (!quickQuery.trim()) return [];
    return filterAndSortProducts(allProducts, {
      query: quickQuery,
      sort: 'featured',
    }).slice(0, 4);
  }, [allProducts, quickQuery]);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    closeSearchOverlay();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Factual Announcement Bar — Prompt 029 */}
      {showAnnouncement && (
        <div className="announcement-bar" role="region" aria-label="Boutique announcement">
          <div className="announcement-inner">
            <div className="announcement-text">
              <span>Discover sarees, unstitched dress materials &amp; fabrics</span>
              <span className="announcement-sep" aria-hidden="true">
                •
              </span>
              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                WhatsApp Boutique Assistance: {WHATSAPP_DISPLAY_NUMBER}
              </a>
            </div>
            <button
              type="button"
              className="announcement-close"
              onClick={() => setShowAnnouncement(false)}
              aria-label="Dismiss announcement bar"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Site Header — Prompts 030–033 & 269 */}
      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="header-inner">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} aria-hidden="true" />
            </button>

            <Link
              to="/"
              className="brand-logo-link"
              aria-label="Mahesh Designers — Home"
            >
              <picture>
                <source srcSet={brand.logo.publicWebpPath} type="image/webp" />
                <img
                  src={brand.logo.publicPngPath}
                  alt="Mahesh Designers — The Extraordinary Smart Saree Store"
                  width={brand.logo.width}
                  height={brand.logo.height}
                  className="brand-logo-img"
                />
              </picture>
            </Link>
          </div>

          <nav className="primary-nav" aria-label="Primary navigation">
            <NavLink
              to="/collections/sarees"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Sarees
            </NavLink>
            <NavLink
              to="/collections/dress-materials"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Dress Materials
            </NavLink>
            <NavLink
              to="/collections/fabrics"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Fabrics
            </NavLink>
            <NavLink
              to="/collections"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Shop All
            </NavLink>
            <NavLink
              to="/our-story"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Our Story
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Contact
            </NavLink>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-action-btn"
              onClick={openSearchOverlay}
              aria-label="Search catalog"
            >
              <Search size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>

            <Link
              to="/wishlist"
              className="icon-action-btn"
              aria-label={`Wishlist (${wishlistCount} saved ${
                wishlistCount === 1 ? 'item' : 'items'
              })`}
            >
              <Heart size={20} strokeWidth={1.8} aria-hidden="true" />
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            <button
              type="button"
              className="icon-action-btn"
              onClick={openBagDrawer}
              aria-label={`Shopping bag (${bagItemCount} ${
                bagItemCount === 1 ? 'item' : 'items'
              })`}
            >
              <ShoppingBag size={20} strokeWidth={1.8} aria-hidden="true" />
              {bagItemCount > 0 && <span className="action-badge">{bagItemCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Landmark — Prompt 035 */}
      <main id="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Mobile Navigation Drawer — Prompt 033 */}
      {isMobileMenuOpen && (
        <div
          className="backdrop-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileMenuOpen(false);
          }}
        >
          <div className="drawer-panel">
            <div className="drawer-header">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="brand-logo-link"
              >
                <img
                  src={brand.logo.publicWebpPath}
                  alt="Mahesh Designers"
                  style={{ height: '36px', width: 'auto' }}
                />
              </Link>
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <nav aria-label="Mobile primary links">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { to: '/', label: 'Home' },
                    { to: '/collections/sarees', label: 'Sarees (52)' },
                    { to: '/collections/dress-materials', label: 'Dress Materials (8)' },
                    { to: '/collections/fabrics', label: 'Fabrics (2)' },
                    { to: '/collections', label: 'Shop All Collections (62)' },
                    { to: '/search', label: 'Search Catalog' },
                    { to: '/wishlist', label: `Saved Wishlist (${wishlistCount})` },
                    { to: '/bag', label: `Shopping Bag (${bagItemCount})` },
                  ].map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="serif-h3"
                        style={{ display: 'block', paddingBlock: '0.25rem' }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

              <nav aria-label="Mobile secondary links">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.92rem' }}>
                  <li>
                    <Link to="/our-story" onClick={() => setIsMobileMenuOpen(false)}>
                      Our Story &amp; Textile Craft
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                      Contact &amp; Boutique Assistance
                    </Link>
                  </li>
                  <li>
                    <Link to="/policies" onClick={() => setIsMobileMenuOpen(false)}>
                      Ordering &amp; Policy Notes
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="drawer-footer">
              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>WhatsApp: {WHATSAPP_DISPLAY_NUMBER}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay Sheet — Prompts 184 & 185 */}
      {isSearchOverlayOpen && (
        <div
          className="backdrop-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search catalog"
          style={{ alignItems: 'flex-start' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearchOverlay();
          }}
        >
          <div className="search-modal-sheet">
            <div className="search-modal-inner">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <span className="eyebrow">Search Mahesh Designers</span>
                <button
                  type="button"
                  className="icon-action-btn"
                  onClick={closeSearchOverlay}
                  aria-label="Close search overlay"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleQuickSearchSubmit} className="search-input-row">
                <Search size={22} color="var(--text-muted)" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Search sarees, weaves (Banarasi, Chanderi, Tussar), or SKU..."
                  className="search-input-field"
                  aria-label="Search by title, weave, category, or product code"
                />
                {quickQuery && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setQuickQuery('')}
                    aria-label="Clear search query"
                  >
                    Clear
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginRight: '0.25rem' }}>
                  Popular searches:
                </span>
                {QUICK_SEARCH_TERMS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="filter-pill"
                    onClick={() => {
                      closeSearchOverlay();
                      navigate(`/search?q=${encodeURIComponent(term)}`);
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* Instant Preview Matches (up to 4) */}
              {quickQuery.trim().length > 0 && (
                <div style={{ marginTop: '1.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <span className="eyebrow">
                      Instant Matches ({instantMatches.length > 0 ? 'Top results' : 'No matches'})
                    </span>
                    <Link
                      to={`/search?q=${encodeURIComponent(quickQuery.trim())}`}
                      onClick={closeSearchOverlay}
                      className="btn-link"
                    >
                      <span>View all search results</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  {instantMatches.length > 0 ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {instantMatches.map((item) => (
                        <Link
                          key={item.id}
                          to={`/products/${item.slug}`}
                          state={{ fromSearch: quickQuery.trim() }}
                          onClick={closeSearchOverlay}
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.5rem',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-ivory)',
                            alignItems: 'center',
                          }}
                        >
                          <img
                            src={item.media[0]?.thumbUrl}
                            alt={item.displayTitle}
                            style={{
                              width: '54px',
                              height: '72px',
                              objectFit: 'cover',
                              borderRadius: '2px',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontWeight: 600,
                                fontSize: '0.98rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.displayTitle}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.primaryCategoryLabel}
                            </div>
                            <div className="price-numeral" style={{ fontSize: '0.84rem', marginTop: '2px' }}>
                              {item.priceFormatted}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No pieces matched &ldquo;{quickQuery}&rdquo;. Press Enter to explore full catalog filters.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini-Bag Drawer — Prompt 171 */}
      {isBagDrawerOpen && (
        <div
          className="backdrop-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="minibag-drawer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBagDrawer();
          }}
        >
          <div className="drawer-panel drawer-right">
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Your Selection</span>
                <h2 id="minibag-drawer-title" className="serif-h3">
                  Shopping Bag ({bagItemCount})
                </h2>
              </div>
              <button
                type="button"
                className="icon-action-btn"
                onClick={closeBagDrawer}
                aria-label="Close shopping bag drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {hydratedBagLines.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: '3rem' }}>
                  <ShoppingBag
                    size={36}
                    strokeWidth={1.3}
                    style={{ marginInline: 'auto', color: 'var(--text-subtle)', marginBottom: '1rem' }}
                  />
                  <h3 className="serif-h3" style={{ marginBottom: '0.5rem' }}>
                    Your bag is currently empty
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Explore our curated sarees, unstitched dress materials, and fabrics.
                  </p>
                  <Link
                    to="/collections/sarees"
                    onClick={closeBagDrawer}
                    className="btn btn-primary"
                  >
                    Explore Sarees
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {hydratedBagLines.map(({ product, quantity, lineTotalFormatted }) => (
                    <div
                      key={product.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '72px 1fr',
                        gap: '0.85rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <Link to={`/products/${product.slug}`} onClick={closeBagDrawer}>
                        <img
                          src={product.media[0]?.thumbUrl}
                          alt={product.displayTitle}
                          style={{
                            width: '72px',
                            height: '96px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      </Link>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <Link
                            to={`/products/${product.slug}`}
                            onClick={closeBagDrawer}
                            style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem' }}
                          >
                            {product.displayTitle}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromBag(product.id)}
                            aria-label={`Remove ${product.displayTitle} from bag`}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-subtle)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {product.productCode && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Code: {product.productCode}
                          </span>
                        )}

                        <div
                          style={{
                            marginTop: 'auto',
                            paddingTop: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div className="qty-stepper" style={{ transform: 'scale(0.88)', transformOrigin: 'left center' }}>
                            <button
                              type="button"
                              className="qty-btn"
                              disabled={quantity <= 1}
                              onClick={() => updateBagQuantity(product.id, quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="qty-value" style={{ fontSize: '0.85rem' }}>
                              {quantity}
                            </span>
                            <button
                              type="button"
                              className="qty-btn"
                              disabled={quantity >= 10}
                              onClick={() => updateBagQuantity(product.id, quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <span className="price-numeral" style={{ fontSize: '0.92rem' }}>
                            {lineTotalFormatted}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hydratedBagLines.length > 0 && (
              <div className="drawer-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Illustrative Merchandise Subtotal
                  </span>
                  <span className="price-numeral" style={{ fontSize: '1.15rem' }}>
                    {bagSubtotalFormatted}
                  </span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                  Demo preview — no online payment is collected. Shipping &amp; availability are confirmed directly with the boutique.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <Link
                    to="/bag"
                    onClick={closeBagDrawer}
                    className="btn btn-secondary"
                  >
                    View Bag
                  </Link>
                  <Link
                    to="/checkout-demo"
                    onClick={closeBagDrawer}
                    className="btn btn-primary"
                  >
                    Checkout Preview
                  </Link>
                </div>

                <a
                  href={buildBagWhatsAppUrl(hydratedBagLines, bagSubtotalInr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: '100%' }}
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  <span>Enquire About Bag on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification — Prompt 167 */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{toast.title}</div>
            {toast.subtitle && (
              <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{toast.subtitle}</div>
            )}
          </div>
          {toast.actionLabel && toast.actionHref && (
            <Link
              to={toast.actionHref}
              onClick={dismissToast}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#E8D2A6',
                textDecoration: 'underline',
                whiteSpace: 'nowrap',
              }}
            >
              {toast.actionLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.75)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Quiet Editorial Footer — Prompt 034 */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand Identity */}
            <div>
              <Link to="/" className="brand-logo-link" style={{ marginBottom: '1rem' }}>
                <img
                  src={brand.logo.publicWebpPath}
                  alt="Mahesh Designers"
                  style={{ height: '42px', width: 'auto' }}
                />
              </Link>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.15rem',
                  fontStyle: 'italic',
                  color: 'var(--text-ink)',
                  marginBottom: '0.5rem',
                }}
              >
                &ldquo;{brand.tagline}&rdquo;
              </p>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '34ch' }}>
                Curated sarees, unstitched salwar dress materials, and select running fabrics from{' '}
                {brand.cityState}.
              </p>
            </div>

            {/* Column 2: Shop */}
            <div>
              <h3
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  color: 'var(--brand-plum)',
                }}
              >
                Collections
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
                <li>
                  <Link to="/collections/sarees">Sarees (52)</Link>
                </li>
                <li>
                  <Link to="/collections/dress-materials">Unstitched Dress Materials (8)</Link>
                </li>
                <li>
                  <Link to="/collections/fabrics">Select Fabrics (2)</Link>
                </li>
                <li>
                  <Link to="/collections?edit=chanderi-edit">The Chanderi Edit</Link>
                </li>
                <li>
                  <Link to="/collections?edit=banarasi-and-tussar">Banarasi &amp; Tussar Weaves</Link>
                </li>
                <li>
                  <Link to="/collections">View All Pieces</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Information */}
            <div>
              <h3
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  color: 'var(--brand-plum)',
                }}
              >
                Information
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
                <li>
                  <Link to="/our-story">Our Story &amp; Craft</Link>
                </li>
                <li>
                  <Link to="/contact">Contact &amp; Enquiries</Link>
                </li>
                <li>
                  <Link to="/policies">Ordering &amp; Policies</Link>
                </li>
                <li>
                  <Link to="/search">Search Catalog</Link>
                </li>
                <li>
                  <Link to="/wishlist">Saved Wishlist</Link>
                </li>
                <li>
                  <Link to="/bag">Shopping Bag</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Reach Us */}
            <div>
              <h3
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  color: 'var(--brand-plum)',
                }}
              >
                Reach Us
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-ink)' }}>Location:</strong> {brand.cityState}
                </p>
                <p>
                  <a
                    href={buildGeneralWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--brand-plum)',
                      fontWeight: 500,
                    }}
                  >
                    <MessageCircle size={15} aria-hidden="true" />
                    <span>WhatsApp: {WHATSAPP_DISPLAY_NUMBER}</span>
                  </a>
                </p>
                <p>
                  <a
                    href={INSTAGRAM_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--text-ink)',
                    }}
                  >
                    <Instagram size={15} aria-hidden="true" />
                    <span>{INSTAGRAM_HANDLE}</span>
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Mahesh Designers ({brand.cityState}). All product photographs &amp; prices sourced from official catalog records.</p>
            <p>Frontend Concept Preview — No live orders or payments are processed on this demo site.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

