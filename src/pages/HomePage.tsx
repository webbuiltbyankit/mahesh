import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, MessageCircle, Sparkles } from 'lucide-react';
import {
  getCategories,
  getProductById,
  getProductsByIds,
} from '../data/catalogRepository';
import { ProductCard } from '../components/ProductCard';
import { SectionHeading } from '../components/SectionHeading';
import {
  buildGeneralWhatsAppUrl,
  buildProductWhatsAppUrl,
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  WHATSAPP_DISPLAY_NUMBER,
} from '../utils/whatsapp';

export const HomePage: React.FC = () => {
  const heroProduct = getProductById('MD-PROD-001');
  const categories = getCategories();

  const selectedSarees = getProductsByIds([
    'MD-PROD-001',
    'MD-PROD-004',
    'MD-PROD-029',
    'MD-PROD-036',
  ]);

  const editorialStoryProduct = getProductById('MD-PROD-051');
  const textureHighlightProduct = getProductById('MD-PROD-063');

  const chanderiEditProducts = getProductsByIds([
    'MD-PROD-009',
    'MD-PROD-014',
    'MD-PROD-060',
    'MD-PROD-063',
  ]);

  const occasionCapsuleProducts = getProductsByIds([
    'MD-PROD-001',
    'MD-PROD-004',
    'MD-PROD-036',
    'MD-PROD-053',
  ]);

  const fabricProducts = getProductsByIds(['MD-PROD-049', 'MD-PROD-050']);

  return (
    <div>
      {/* 1. Split Editorial Hero — Prompts 081–085 */}
      <section className="container" aria-label="Featured collection introduction">
        <div className="hero-split">
          <div className="hero-copy">
            <span className="eyebrow">Mahesh Designers · Tirupur, Tamil Nadu</span>
            <h1 className="serif-display">The art of choosing beautifully.</h1>
            <p className="hero-lead">
              Thoughtfully selected sarees, unstitched salwar dress materials, and woven fabrics —
              spanning luminous Banarasi and Tussar drapes, airy Chanderi weaves, and tactile
              everyday cottons.
            </p>

            <div className="hero-actions">
              <Link to="/collections/sarees" className="btn btn-primary">
                <span>Shop Sarees</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/collections" className="btn-link">
                <span>Explore All Collections (62 Pieces)</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-ink)' }}>52</strong> Curated Sarees
              </div>
              <div>
                <strong style={{ color: 'var(--text-ink)' }}>8</strong> Unstitched Dress Materials
              </div>
              <div>
                <strong style={{ color: 'var(--text-ink)' }}>2</strong> Select Fabrics
              </div>
            </div>
          </div>

          {heroProduct && (
            <div className="hero-media-frame">
              <Link
                to={`/products/${heroProduct.slug}`}
                aria-label={`View featured piece: ${heroProduct.displayTitle}`}
              >
                <img
                  src={heroProduct.media[0]?.galleryUrl}
                  srcSet={`${heroProduct.media[0]?.cardUrl} 840w, ${heroProduct.media[0]?.galleryUrl} 1440w`}
                  sizes="(max-width: 960px) 94vw, 46vw"
                  alt={heroProduct.media[0]?.alt ?? heroProduct.displayTitle}
                  width={heroProduct.media[0]?.width}
                  height={heroProduct.media[0]?.height}
                  fetchPriority="high"
                  className="hero-media-img"
                />
              </Link>

              <div className="hero-caption-card">
                <div>
                  <span className="eyebrow" style={{ fontSize: '0.66rem' }}>
                    Featured Drape · {heroProduct.productCode}
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                    }}
                  >
                    <Link to={`/products/${heroProduct.slug}`}>{heroProduct.displayTitle}</Link>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="price-numeral" style={{ fontSize: '1rem' }}>
                    {heroProduct.priceFormatted}
                  </div>
                  <Link
                    to={`/products/${heroProduct.slug}`}
                    className="btn-link"
                    style={{ fontSize: '0.75rem' }}
                  >
                    View Piece →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Three-Category Introduction Tiles — Prompt 086 */}
      <section className="section-spacing section-paper" aria-labelledby="categories-heading">
        <div className="container">
          <SectionHeading
            eyebrow="Three Distinct Lines"
            title="Browse by Category"
            subtitle="Every piece in our online showcase is photographed directly from the Mahesh Designers collection in Tirupur."
            ctaLabel="View Full Catalog"
            ctaHref="/collections"
          />

          <div className="category-tiles-grid">
            {categories.map((cat) => {
              const featureProd = getProductById(cat.featureProductId);
              const coverMedia = featureProd?.media[0];
              return (
                <article key={cat.slug} className="category-tile">
                  <Link
                    to={`/collections/${cat.slug}`}
                    className="category-tile-media"
                    aria-label={`${cat.title} (${cat.count} pieces)`}
                  >
                    {coverMedia && (
                      <img
                        src={coverMedia.cardUrl}
                        srcSet={`${coverMedia.thumbUrl} 420w, ${coverMedia.cardUrl} 840w`}
                        sizes="(max-width: 767px) 92vw, 31vw"
                        alt={`${cat.title} — ${featureProd?.displayTitle}`}
                        loading="lazy"
                      />
                    )}
                  </Link>
                  <div className="category-tile-body">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <span className="eyebrow">{cat.eyebrow}</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-subtle)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {cat.count} {cat.count === 1 ? 'Piece' : 'Pieces'}
                      </span>
                    </div>
                    <h3 className="serif-h2">
                      <Link to={`/collections/${cat.slug}`}>{cat.title}</Link>
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                      {cat.shortDescription}
                    </p>
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link to={`/collections/${cat.slug}`} className="btn-link">
                        <span>Explore {cat.title}</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Selected Sarees Row — Prompts 087 & 088 */}
      <section className="section-spacing container" aria-labelledby="selected-sarees-heading">
        <SectionHeading
          eyebrow="Signature Drapes"
          title="Selected Sarees"
          subtitle="Banarasi, Tussar, and Cotton-Tussar weaves chosen for their poised drape, zari borders, and rich palette."
          ctaLabel="Explore All 52 Sarees"
          ctaHref="/collections/sarees"
        />

        <div className="product-grid">
          {selectedSarees.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
              showSku={true}
            />
          ))}
        </div>
      </section>

      {/* 4. First Editorial Split Story (Dress Materials: MD-PROD-051) — Prompt 089 */}
      {editorialStoryProduct && (
        <section className="section-spacing section-plum-tint" aria-label="Dress materials spotlight">
          <div className="container">
            <div className="editorial-split">
              <div className="editorial-media-stack">
                <div className="editorial-frame" style={{ aspectRatio: '3 / 4' }}>
                  <Link to={`/products/${editorialStoryProduct.slug}`}>
                    <img
                      src={editorialStoryProduct.media[0]?.cardUrl}
                      alt={editorialStoryProduct.displayTitle}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                </div>
                {editorialStoryProduct.media[1] && (
                  <div className="editorial-frame" style={{ aspectRatio: '3 / 4' }}>
                    <Link to={`/products/${editorialStoryProduct.slug}`}>
                      <img
                        src={editorialStoryProduct.media[1].cardUrl}
                        alt={`${editorialStoryProduct.displayTitle} detail view`}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', alignItems: 'flex-start' }}>
                <span className="eyebrow">Unstitched Ensemble Spotlight</span>
                <h2 className="serif-h1">Tailored to Your Own Silhouette</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem' }}>
                  Our unstitched salwar and chudithar dress material sets pair coordinated tops,
                  bottoms, and dupattas in Vichitra Silk, Chanderi, Kota, and Cotton — ready to be
                  custom-tailored to your preferred fit and neckline.
                </p>

                <div
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-paper)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      Pictured Set · {editorialStoryProduct.productCode}
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600 }}>
                      {editorialStoryProduct.displayTitle}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Unstitched salwar suit material set
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="price-numeral" style={{ fontSize: '1.08rem' }}>
                      {editorialStoryProduct.priceFormatted}
                    </div>
                    <Link
                      to={`/products/${editorialStoryProduct.slug}`}
                      className="btn-link"
                      style={{ fontSize: '0.78rem' }}
                    >
                      Inspect Set →
                    </Link>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                  <Link to="/collections/dress-materials" className="btn btn-primary">
                    <span>Shop Dress Materials (8 Sets)</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Texture-Led Transition Pause (MD-PROD-063) & The Chanderi Edit — Prompts 090 & 091 */}
      <section className="section-spacing container" aria-labelledby="chanderi-edit-heading">
        {textureHighlightProduct && (
          <div
            style={{
              marginBottom: '4rem',
              padding: 'clamp(1.5rem, 3.5vw, 3rem)',
              background: 'var(--bg-paper)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="eyebrow eyebrow-gold">Close-Up Surface Study</span>
              <h2 className="serif-h2" style={{ marginTop: '0.35rem', marginBottom: '0.75rem' }}>
                Sheer Lightness, Thread &amp; Mirror Detail
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Across both sarees and unstitched ensembles, our Chanderi selection highlights fine
                thread embroidery, mirror accents, and featherlight drape — photographed up close so
                you can inspect the weave before you enquire.
              </p>
              <Link
                to={`/products/${textureHighlightProduct.slug}`}
                className="btn-link"
              >
                <span>
                  Shown: {textureHighlightProduct.displayTitle} ({textureHighlightProduct.priceFormatted})
                </span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.85rem',
              }}
            >
              <Link
                to={`/products/${textureHighlightProduct.slug}`}
                className="editorial-frame"
                style={{ aspectRatio: '4 / 5' }}
              >
                <img
                  src={textureHighlightProduct.media[0]?.cardUrl}
                  alt={textureHighlightProduct.displayTitle}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>
              <Link
                to={`/products/${textureHighlightProduct.slug}`}
                className="editorial-frame"
                style={{ aspectRatio: '4 / 5' }}
              >
                <img
                  src={
                    (textureHighlightProduct.media[2] ?? textureHighlightProduct.media[1] ?? textureHighlightProduct.media[0])
                      ?.cardUrl
                  }
                  alt={`${textureHighlightProduct.displayTitle} close-up texture`}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>
            </div>
          </div>
        )}

        <SectionHeading
          eyebrow="Curated Weave Story"
          title="The Chanderi Edit"
          subtitle="Luminous Chanderi Silk, Tussar Chanderi, and embroidered Chanderi ensembles spanning sarees and unstitched dress materials."
          ctaLabel="View Full Chanderi Edit (8 Pieces)"
          ctaHref="/collections?edit=chanderi-edit"
        />

        <div className="product-grid">
          {chanderiEditProducts.map((product) => (
            <ProductCard key={product.id} product={product} showSku={true} />
          ))}
        </div>
      </section>

      {/* 6. "For Your Moments" Occasion Capsule — Prompt 092 */}
      <section className="section-spacing section-paper" aria-labelledby="occasion-capsule-heading">
        <div className="container">
          <SectionHeading
            eyebrow="For Your Moments"
            title="Celebration & Gathering Drapes"
            subtitle="Expressive jewel tones, woven zari pallus, and poised silhouettes suited for festive occasions and family gatherings."
            ctaLabel="Explore Occasion Capsule"
            ctaHref="/collections?edit=for-your-moments"
          />

          <div className="product-grid">
            {occasionCapsuleProducts.map((product) => (
              <ProductCard key={product.id} product={product} showSku={true} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Fabrics Exploration Strip — Prompt 093 */}
      <section className="section-spacing container" aria-labelledby="fabrics-strip-heading">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <span className="eyebrow">Custom Yardage &amp; Blouses</span>
            <h2 id="fabrics-strip-heading" className="serif-h2" style={{ marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              Select Woven Fabrics
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Alongside full sarees and dress material sets, Mahesh Designers offers select Banaras
              and Sana Silk fabrics for custom blouses, kurtas, and coordinated trims.
            </p>
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg-plum-tint)',
                borderLeft: '3px solid var(--brand-plum)',
                fontSize: '0.82rem',
                color: 'var(--text-ink)',
                marginBottom: '1.5rem',
              }}
            >
              <strong>Boutique Note:</strong> Listed prices ({'₹545'} and {'₹595'}) reflect the
              archive unit rate. Please confirm exact cut length and meterage requirements on
              WhatsApp before ordering.
            </div>
            <Link to="/collections/fabrics" className="btn btn-secondary">
              <span>Explore Fabrics</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '1.25rem',
            }}
          >
            {fabricProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showSku={true}
                showUnitNote={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Boutique Assistance & Closing CTA — Prompts 094 & 095 */}
      <section className="section-spacing section-plum-tint" aria-label="Personal shopping assistance">
        <div className="container">
          <div
            style={{
              background: 'var(--bg-paper)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: 'clamp(2rem, 4.5vw, 3.5rem)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={13} aria-hidden="true" /> Direct from Tirupur
              </span>
              <h2 className="serif-h1" style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
                Need Help Choosing a Drape or Shade?
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '54ch' }}>
                Share any product title or code (such as <span className="sku-code">SKU052MAUVAPUR</span>)
                with our team on WhatsApp to confirm current piece availability, request daylight
                queries, or arrange your order directly.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                alignItems: 'stretch',
                maxWidth: '380px',
                marginLeft: 'auto',
                width: '100%',
              }}
            >
              <a
                href={
                  heroProduct
                    ? buildProductWhatsAppUrl(heroProduct)
                    : buildGeneralWhatsAppUrl()
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <MessageCircle size={17} aria-hidden="true" />
                <span>Chat on WhatsApp ({WHATSAPP_DISPLAY_NUMBER})</span>
              </a>

              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <Instagram size={16} aria-hidden="true" />
                <span>Follow {INSTAGRAM_HANDLE}</span>
              </a>

              <Link
                to="/collections"
                className="btn-link"
                style={{ justifyContent: 'center', marginTop: '0.25rem' }}
              >
                <span>Or browse all 62 catalog pieces</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

