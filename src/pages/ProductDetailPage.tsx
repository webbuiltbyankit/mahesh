import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Heart,
  Maximize2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getProductBySlugOrId,
  getQuarantinedAndReferenceRecords,
  getRelatedProducts,
} from '../data/catalogRepository';
import { useShop } from '../context/ShopContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { SectionHeading } from '../components/SectionHeading';
import { buildProductWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from '../utils/whatsapp';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const fromSearch = (location.state as { fromSearch?: string } | null)?.fromSearch;

  const product = useMemo(() => getProductBySlugOrId(slug), [slug]);
  const nonPurchasableMatch = useMemo(() => {
    if (product || !slug) return undefined;
    const upper = slug.toUpperCase();
    return getQuarantinedAndReferenceRecords().find(
      (r) => r.id.toUpperCase() === upper || r.slug.toLowerCase() === slug.toLowerCase()
    );
  }, [product, slug]);

  const {
    addToBag,
    isWishlisted,
    toggleWishlist,
    recordProductView,
    recentlyViewedProducts,
  } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setIsLightboxOpen(false);
    setCopiedSku(false);
    if (product) {
      recordProductView(product.id);
    }
  }, [product, recordProductView]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen || !product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % product.media.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + product.media.length) % product.media.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen, product]);

  const relatedProducts = useMemo(
    () => (product ? getRelatedProducts(product, 4) : []),
    [product]
  );

  const otherRecentlyViewed = useMemo(
    () =>
      product
        ? recentlyViewedProducts.filter((item) => item.id !== product.id).slice(0, 4)
        : [],
    [product, recentlyViewedProducts]
  );

  const handleCopySku = async () => {
    if (!product?.productCode) return;
    try {
      await navigator.clipboard.writeText(product.productCode);
      setCopiedSku(true);
      window.setTimeout(() => setCopiedSku(false), 2200);
    } catch {
      setCopiedSku(true);
    }
  };

  // Recovery view if product is missing or quarantined/reference-only (Prompt 160)
  if (!product) {
    return (
      <div className="container section-spacing">
        <div
          style={{
            maxWidth: '620px',
            marginInline: 'auto',
            textAlign: 'center',
            padding: '3.5rem 2rem',
            background: 'var(--bg-paper)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <span className="eyebrow">Catalog Notice</span>
          <h1 className="serif-h1" style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
            {nonPurchasableMatch
              ? 'Archive Reference Record Only'
              : 'Piece Not Found in Active Catalog'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            {nonPurchasableMatch
              ? `Record ${nonPurchasableMatch.id} (${nonPurchasableMatch.displayTitle}) is an archive reference or non-standard entry (${nonPurchasableMatch.statusReason}) and is excluded from individual online bag selection.`
              : 'The requested piece could not be located. Explore our 62 verified sarees, unstitched dress materials, and fabrics below.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to="/collections/sarees" className="btn btn-primary">
              Explore Sarees
            </Link>
            <Link to="/collections" className="btn btn-secondary">
              View All Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const saved = isWishlisted(product.id);
  const currentMedia = product.media[activeImageIndex] ?? product.media[0];
  const categoryHref = product.primaryCategory
    ? `/collections/${product.primaryCategory}`
    : '/collections';

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: product.primaryCategoryLabel, href: categoryHref },
          { label: product.displayTitle },
        ]}
        backLink={
          fromSearch
            ? {
                label: `Back to search results for "${fromSearch}"`,
                href: `/search?q=${encodeURIComponent(fromSearch)}`,
              }
            : undefined
        }
      />

      {/* Main Split PDP Layout — Prompts 141–157 */}
      <section className="pdp-layout" aria-label="Product details">
        {/* Left: Deduplicated Gallery */}
        <div className="pdp-gallery">
          {product.media.length > 1 ? (
            <div className="pdp-thumbs" role="tablist" aria-label="Product angles">
              {product.media.map((mediaItem, idx) => {
                const isSelected = idx === activeImageIndex;
                return (
                  <button
                    key={mediaItem.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`View image ${idx + 1} of ${product.media.length}`}
                    className={`pdp-thumb-btn ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img
                      src={mediaItem.thumbUrl}
                      alt={`${product.displayTitle} thumbnail ${idx + 1}`}
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="sr-only">Single verified product image</div>
          )}

          <div
            className="pdp-main-stage"
            style={product.media.length === 1 ? { gridColumn: '1 / -1' } : undefined}
          >
            {currentMedia && (
              <img
                src={currentMedia.galleryUrl}
                srcSet={`${currentMedia.cardUrl} 840w, ${currentMedia.galleryUrl} 1440w`}
                sizes="(max-width: 960px) 94vw, 50vw"
                alt={currentMedia.alt}
                width={currentMedia.width}
                height={currentMedia.height}
                onClick={() => setIsLightboxOpen(true)}
              />
            )}

            {product.media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) => (prev - 1 + product.media.length) % product.media.length
                    )
                  }
                  aria-label="Previous product image"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0.75rem',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    background: 'rgba(255, 254, 250, 0.9)',
                    border: '1px solid var(--border-subtle)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % product.media.length)
                  }
                  aria-label="Next product image"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0.75rem',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    background: 'rgba(255, 254, 250, 0.9)',
                    border: '1px solid var(--border-subtle)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            <button
              type="button"
              className="pdp-zoom-btn"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Open full-screen textile zoom view"
            >
              <Maximize2 size={13} aria-hidden="true" />
              <span>
                Inspect Weave ({activeImageIndex + 1}/{product.media.length})
              </span>
            </button>
          </div>
        </div>

        {/* Right: Product Summary & Actions */}
        <div className="pdp-summary">
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '0.4rem',
              }}
            >
              <span className="eyebrow">{product.subtitle}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Archive ID: {product.id}
              </span>
            </div>

            <h1 className="serif-h1" style={{ marginBottom: '0.65rem' }}>
              {product.displayTitle}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div className="price-numeral" style={{ fontSize: '1.65rem' }}>
                {product.priceFormatted}
              </div>

              {product.productCode && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Product Code:
                  </span>
                  <span className="sku-code" style={{ fontSize: '0.82rem' }}>
                    {product.productCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySku}
                    className="btn-ghost"
                    style={{ minHeight: '28px', padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                    aria-label={`Copy product code ${product.productCode}`}
                  >
                    {copiedSku ? (
                      <>
                        <Check size={12} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Unstitched or Unit Note */}
          {product.unitNote && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg-plum-tint)',
                borderLeft: '3px solid var(--brand-plum)',
                fontSize: '0.84rem',
                color: 'var(--text-ink)',
              }}
            >
              <strong>Format &amp; Sizing Note:</strong> {product.unitNote}
            </div>
          )}

          {/* Quantity & Primary Actions — Prompts 151–154 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '0.3rem',
                  }}
                >
                  Quantity
                </span>
                <div className="qty-stepper" aria-label="Select quantity">
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="qty-value" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={quantity >= 10}
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '200px', paddingTop: '1.15rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => addToBag(product.id, quantity, true)}
                >
                  <ShoppingBag size={17} aria-hidden="true" />
                  <span>Add to Bag · {product.priceFormatted}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={saved}
              >
                <Heart
                  size={16}
                  fill={saved ? 'currentColor' : 'none'}
                  color={saved ? 'var(--brand-plum)' : 'currentColor'}
                  aria-hidden="true"
                />
                <span>{saved ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>

              <a
                href={buildProductWhatsAppUrl(product, quantity)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Factual Product Details Card — Prompts 149, 150, 155 */}
          <div className="pdp-info-card">
            <h2
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--brand-plum)',
                marginBottom: '0.85rem',
              }}
            >
              Verified Archive Specifications
            </h2>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-ink)', marginBottom: '1rem' }}>
              {product.description}
            </p>

            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr',
                rowGap: '0.55rem',
                columnGap: '0.75rem',
                fontSize: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.85rem',
              }}
            >
              <dt style={{ color: 'var(--text-muted)' }}>Category</dt>
              <dd style={{ fontWeight: 500 }}>{product.primaryCategoryLabel}</dd>

              {product.fabricFacets.length > 0 && (
                <>
                  <dt style={{ color: 'var(--text-muted)' }}>Weave / Fabric</dt>
                  <dd style={{ fontWeight: 500 }}>{product.fabricFacets.join(', ')}</dd>
                </>
              )}

              {product.productCode && (
                <>
                  <dt style={{ color: 'var(--text-muted)' }}>Product Code</dt>
                  <dd style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {product.productCode}
                  </dd>
                </>
              )}

              <dt style={{ color: 'var(--text-muted)' }}>Gallery Frames</dt>
              <dd>
                {product.media.length} verified studio{' '}
                {product.media.length === 1 ? 'photograph' : 'photographs'}
              </dd>

              {product.sourceUrl && (
                <>
                  <dt style={{ color: 'var(--text-muted)' }}>Archive Source</dt>
                  <dd>
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <span>View Original Instagram Post</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </div>

          {/* Truthful Shipping, Availability & Care Disclosure — Prompt 155 */}
          <div
            className="pdp-info-card"
            style={{ background: 'var(--bg-ivory)', fontSize: '0.82rem', color: 'var(--text-muted)' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                color: 'var(--text-ink)',
                marginBottom: '0.35rem',
              }}
            >
              <Sparkles size={14} color="var(--brand-plum)" aria-hidden="true" />
              <span>Availability, Dispatch &amp; Care Notes</span>
            </div>
            <p>
              Each textile is offered in limited boutique quantities from Tirupur, Tamil Nadu.
              Exact stock availability, shipping charges, delivery timelines, and weave-specific
              care guidance are confirmed directly via WhatsApp ({WHATSAPP_DISPLAY_NUMBER}) prior to
              order placement.
            </p>
          </div>
        </div>
      </section>

      {/* Related Pieces — Prompt 158 */}
      {relatedProducts.length > 0 && (
        <section className="section-spacing" aria-labelledby="related-pieces-heading">
          <SectionHeading
            eyebrow="Complementary Selection"
            title="You May Also Appreciate"
            subtitle={`Selected from our verified ${product.primaryCategoryLabel.toLowerCase()} and ${
              product.fabricFacets[0] ?? 'signature'
            } weaves.`}
            ctaLabel={`View All ${product.primaryCategoryLabel}`}
            ctaHref={categoryHref}
          />
          <div className="product-grid">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} showSku={true} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed — Prompt 159 */}
      {otherRecentlyViewed.length > 0 && (
        <section
          className="section-spacing-sm"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
          aria-labelledby="recently-viewed-heading"
        >
          <SectionHeading
            eyebrow="Your Browsing History"
            title="Recently Viewed Pieces"
          />
          <div className="product-grid">
            {otherRecentlyViewed.map((recent) => (
              <ProductCard key={recent.id} product={recent} showSku={true} />
            ))}
          </div>
        </section>
      )}

      {/* Full-Screen Lightbox Modal — Prompt 145 */}
      {isLightboxOpen && currentMedia && (
        <div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Full-screen image viewer for ${product.displayTitle}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLightboxOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#F8F6F1',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
                {product.displayTitle} ({product.priceFormatted})
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>
                Frame {activeImageIndex + 1} of {product.media.length}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close full-screen viewer"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#FFFFFF',
                borderRadius: '999px',
                width: '42px',
                height: '42px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={currentMedia.galleryUrl}
              alt={currentMedia.alt}
              className="lightbox-img"
            />
          </div>

          {product.media.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.35)' }}
                onClick={() =>
                  setActiveImageIndex(
                    (prev) => (prev - 1 + product.media.length) % product.media.length
                  )
                }
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.35)' }}
                onClick={() =>
                  setActiveImageIndex((prev) => (prev + 1) % product.media.length)
                }
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

