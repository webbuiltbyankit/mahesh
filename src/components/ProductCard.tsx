import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '../types/catalog';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  showSku?: boolean;
  showUnitNote?: boolean;
  searchContext?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  priority = false,
  showSku = false,
  showUnitNote = true,
  searchContext,
}) => {
  const { isWishlisted, toggleWishlist } = useShop();
  const saved = isWishlisted(product.id);

  const primaryMedia = product.media[0];
  const secondaryMedia = product.media.length > 1 ? product.media[1] : null;
  const productHref = `/products/${product.slug}`;

  const linkState = searchContext ? { fromSearch: searchContext } : undefined;

  return (
    <article className="product-card" data-product-id={product.id}>
      <div className="product-card-media-wrap">
        <Link
          to={productHref}
          state={linkState}
          className="product-card-link-media"
          aria-label={`${product.displayTitle} — ${product.priceFormatted}`}
        >
          {primaryMedia && (
            <img
              src={primaryMedia.cardUrl}
              srcSet={`${primaryMedia.thumbUrl} 420w, ${primaryMedia.cardUrl} 840w`}
              sizes="(max-width: 767px) 48vw, (max-width: 1199px) 31vw, 300px"
              alt={primaryMedia.alt}
              width={primaryMedia.width}
              height={primaryMedia.height}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={`product-card-img product-card-img-primary ${
                secondaryMedia ? 'has-secondary' : ''
              }`}
            />
          )}
          {secondaryMedia && (
            <img
              src={secondaryMedia.cardUrl}
              srcSet={`${secondaryMedia.thumbUrl} 420w, ${secondaryMedia.cardUrl} 840w`}
              sizes="(max-width: 767px) 48vw, (max-width: 1199px) 31vw, 300px"
              alt={secondaryMedia.alt}
              width={secondaryMedia.width}
              height={secondaryMedia.height}
              loading="lazy"
              decoding="async"
              aria-hidden="true"
              className="product-card-img product-card-img-secondary"
            />
          )}
        </Link>

        <button
          type="button"
          className={`product-card-wishlist-btn ${saved ? 'is-Saved' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={
            saved
              ? `Remove ${product.displayTitle} from Wishlist`
              : `Save ${product.displayTitle} to Wishlist`
          }
          aria-pressed={saved}
        >
          <Heart
            size={17}
            fill={saved ? 'currentColor' : 'none'}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>

        {product.primaryCategory === 'dress-materials' && (
          <span className="product-card-badge">Unstitched Set</span>
        )}
        {product.primaryCategory === 'fabrics' && (
          <span className="product-card-badge">Fabric</span>
        )}
      </div>

      <div className="product-card-body">
        <span className="product-card-subtitle">{product.subtitle}</span>

        <h3 className="product-card-title">
          <Link to={productHref} state={linkState}>
            {product.displayTitle}
          </Link>
        </h3>

        <div className="product-card-meta-row">
          <span className="price-numeral product-card-price">{product.priceFormatted}</span>
          {showSku && product.productCode && (
            <span className="sku-code">{product.productCode}</span>
          )}
        </div>

        {showUnitNote && product.primaryCategory === 'fabrics' && product.unitNote && (
          <p className="product-card-unit-note">{product.unitNote}</p>
        )}
      </div>
    </article>
  );
};

