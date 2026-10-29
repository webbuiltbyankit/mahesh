import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getProductsByIds } from '../data/catalogRepository';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { SectionHeading } from '../components/SectionHeading';
import { buildProductWhatsAppUrl } from '../utils/whatsapp';

export const WishlistPage: React.FC = () => {
  const { wishlistProducts, removeFromWishlist, addToBag } = useShop();

  const starterRecommendations = getProductsByIds([
    'MD-PROD-001',
    'MD-PROD-004',
    'MD-PROD-051',
    'MD-PROD-063',
  ]);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Saved Wishlist' },
        ]}
      />

      <header
        style={{
          paddingBlock: '1.5rem 2.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2.5rem',
        }}
      >
        <span className="eyebrow">Your Curated Shortlist</span>
        <h1 className="serif-h1" style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>
          Saved Wishlist ({wishlistProducts.length})
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '58ch' }}>
          Pieces you have bookmarked while browsing. Your wishlist is stored locally in this
          browser so you can compare weaves, move favourites to your bag, or share them with the
          boutique on WhatsApp.
        </p>
      </header>

      {wishlistProducts.length > 0 ? (
        <section aria-label="Saved wishlist items">
          <div className="product-grid">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <ProductCard product={product} showSku={true} />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, minHeight: '40px', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => addToBag(product.id, 1, true)}
                  >
                    <ShoppingBag size={14} aria-hidden="true" />
                    <span>Add to Bag</span>
                  </button>

                  <a
                    href={buildProductWhatsAppUrl(product, 1)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ minHeight: '40px', padding: '0.45rem 0.75rem' }}
                    aria-label={`Enquire about ${product.displayTitle} on WhatsApp`}
                    title="Enquire on WhatsApp"
                  >
                    <MessageCircle size={15} aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ minHeight: '40px', padding: '0.45rem 0.75rem' }}
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label={`Remove ${product.displayTitle} from wishlist`}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: 'var(--bg-paper)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '4rem',
            }}
          >
            <Heart
              size={36}
              strokeWidth={1.4}
              style={{ marginInline: 'auto', color: 'var(--brand-plum)', marginBottom: '1rem' }}
            />
            <h2 className="serif-h2" style={{ marginBottom: '0.5rem' }}>
              Your wishlist is currently empty
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                maxWidth: '46ch',
                marginInline: 'auto',
                marginBottom: '1.5rem',
              }}
            >
              Tap the heart icon on any saree, unstitched dress material, or fabric to save it here
              for easy comparison.
            </p>
            <Link to="/collections/sarees" className="btn btn-primary">
              <span>Explore Sarees</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </section>

          <section aria-labelledby="wishlist-suggestions-heading">
            <SectionHeading
              eyebrow="Begin Your Selection"
              title="Signature Pieces to Explore"
              ctaLabel="View All 62 Pieces"
              ctaHref="/collections"
            />
            <div className="product-grid">
              {starterRecommendations.map((product) => (
                <ProductCard key={product.id} product={product} showSku={true} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

