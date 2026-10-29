import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  Minus,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { buildBagWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from '../utils/whatsapp';

export const BagPage: React.FC = () => {
  const {
    hydratedBagLines,
    bagItemCount,
    bagSubtotalInr,
    bagSubtotalFormatted,
    updateBagQuantity,
    removeFromBag,
    clearBag,
  } = useShop();

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shopping Bag' },
        ]}
      />

      <header
        style={{
          paddingBlock: '1.5rem 2.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <span className="eyebrow">Your Selection</span>
          <h1 className="serif-h1" style={{ marginTop: '0.35rem' }}>
            Shopping Bag ({bagItemCount} {bagItemCount === 1 ? 'Unit' : 'Units'})
          </h1>
        </div>

        {hydratedBagLines.length > 0 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={clearBag}
            style={{ fontSize: '0.82rem' }}
          >
            Clear Entire Bag
          </button>
        )}
      </header>

      {hydratedBagLines.length === 0 ? (
        <section
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            background: 'var(--bg-paper)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <ShoppingBag
            size={40}
            strokeWidth={1.3}
            style={{ marginInline: 'auto', color: 'var(--brand-plum)', marginBottom: '1rem' }}
          />
          <h2 className="serif-h2" style={{ marginBottom: '0.5rem' }}>
            Your shopping bag is empty
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '48ch',
              marginInline: 'auto',
              marginBottom: '1.75rem',
            }}
          >
            Browse our verified collection of 52 sarees, 8 unstitched salwar dress material sets,
            and 2 running fabrics to build your selection.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to="/collections/sarees" className="btn btn-primary">
              <span>Shop Sarees</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link to="/collections" className="btn btn-secondary">
              Explore All Collections
            </Link>
          </div>
        </section>
      ) : (
        <div className="bag-grid">
          {/* Left Column: Line Items — Prompts 172–175 */}
          <section aria-label="Selected items in bag">
            {hydratedBagLines.map(({ product, quantity, lineTotalFormatted }) => (
              <article key={product.id} className="bag-line-card">
                <Link to={`/products/${product.slug}`} className="bag-line-thumb">
                  <img
                    src={product.media[0]?.thumbUrl}
                    alt={product.displayTitle}
                    loading="lazy"
                  />
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span className="eyebrow" style={{ fontSize: '0.68rem' }}>
                    {product.subtitle}
                  </span>

                  <h2 className="serif-h3">
                    <Link to={`/products/${product.slug}`}>{product.displayTitle}</Link>
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Unit Price: {product.priceFormatted}</span>
                    {product.productCode && (
                      <span>
                        Code: <span className="sku-code">{product.productCode}</span>
                      </span>
                    )}
                    <span>ID: {product.id}</span>
                  </div>

                  {product.unitNote && (
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                      {product.unitNote}
                    </p>
                  )}

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div className="qty-stepper" aria-label={`Quantity for ${product.displayTitle}`}>
                      <button
                        type="button"
                        className="qty-btn"
                        disabled={quantity <= 1}
                        onClick={() => updateBagQuantity(product.id, quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        disabled={quantity >= 10}
                        onClick={() => updateBagQuantity(product.id, quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => removeFromBag(product.id)}
                      style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      aria-label={`Remove ${product.displayTitle} from bag`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div
                  className="bag-line-actions-col"
                  style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Line Total</div>
                    <div className="price-numeral" style={{ fontSize: '1.15rem' }}>
                      {lineTotalFormatted}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/collections" className="btn-link">
                ← Continue Browsing Collections
              </Link>
            </div>
          </section>

          {/* Right Column: Order Summary Card — Prompts 176–178 */}
          <aside className="summary-card" aria-label="Order summary">
            <span className="eyebrow">Bag Summary</span>
            <h2 className="serif-h2" style={{ marginTop: '0.25rem', marginBottom: '1.25rem' }}>
              Order Overview
            </h2>

            <dl
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.9rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <dt style={{ color: 'var(--text-muted)' }}>Selected Pieces</dt>
                <dd style={{ fontWeight: 500 }}>
                  {hydratedBagLines.length}{' '}
                  {hydratedBagLines.length === 1 ? 'style' : 'styles'} ({bagItemCount}{' '}
                  {bagItemCount === 1 ? 'unit' : 'units'})
                </dd>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <dt style={{ color: 'var(--text-muted)' }}>Shipping &amp; Dispatch</dt>
                <dd style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', textAlign: 'right' }}>
                  Confirmed by boutique
                </dd>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <dt style={{ fontWeight: 600, color: 'var(--text-ink)' }}>
                  Illustrative Merchandise Subtotal
                </dt>
                <dd className="price-numeral" style={{ fontSize: '1.35rem' }}>
                  {bagSubtotalFormatted}
                </dd>
              </div>
            </dl>

            <div
              className="demo-banner"
              style={{ marginBlock: '1.25rem', fontSize: '0.8rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  color: 'var(--brand-plum)',
                  marginBottom: '0.25rem',
                }}
              >
                <ShieldAlert size={15} aria-hidden="true" />
                <span>Demo Checkout — No Payment Collected</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Proceeding to checkout lets you preview a printable order summary or send your
                itemized selection directly to Mahesh Designers on WhatsApp (
                {WHATSAPP_DISPLAY_NUMBER}).
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/checkout-demo" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Proceed to Demo Checkout</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>

              <a
                href={buildBagWhatsAppUrl(hydratedBagLines, bagSubtotalInr)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%' }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>Enquire About Bag on WhatsApp</span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

