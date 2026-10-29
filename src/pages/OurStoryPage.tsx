import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, MessageCircle } from 'lucide-react';
import {
  getBrandMetadata,
  getCatalogCounts,
  getProductById,
} from '../data/catalogRepository';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  buildGeneralWhatsAppUrl,
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  WHATSAPP_DISPLAY_NUMBER,
} from '../utils/whatsapp';

export const OurStoryPage: React.FC = () => {
  const brand = getBrandMetadata();
  const counts = getCatalogCounts();
  const storySaree = getProductById('MD-PROD-001');
  const storyDressMaterial = getProductById('MD-PROD-051');
  const storyChanderi = getProductById('MD-PROD-063');

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Our Story' },
        ]}
      />

      {/* Hero Intro — Prompts 221–225 */}
      <section className="hero-split" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="hero-copy">
          <span className="eyebrow">Mahesh Designers · {brand.cityState}</span>
          <h1 className="serif-display">“{brand.tagline}”</h1>
          <p className="hero-lead">
            Known across our community as <em>{brand.factualPosition}</em>, Mahesh Designers curates
            expressive sarees, unstitched salwar dress material sets, and woven running fabrics from{' '}
            {brand.cityState}.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            Rather than overwhelming shoppers with thousands of unverified listings, our online
            showcase focuses on carefully photographed textiles where the character of the zari
            border, the fall of the pallu, and the surface embroidery can be appreciated clearly.
          </p>
        </div>

        {storySaree && (
          <div className="hero-media-frame" style={{ maxHeight: '540px' }}>
            <img
              src={storySaree.media[0]?.cardUrl}
              alt={storySaree.displayTitle}
              className="hero-media-img"
            />
          </div>
        )}
      </section>

      {/* Three Pillars of the Collection — Prompts 226 & 227 */}
      <section className="section-spacing" aria-labelledby="pillars-heading">
        <div style={{ maxWidth: '680px', marginBottom: '2.5rem' }}>
          <span className="eyebrow">What We Curate</span>
          <h2 id="pillars-heading" className="serif-h1" style={{ marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            Grounded in Weave, Surface &amp; Colour
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Every piece in this {counts.approvedProducts}-item catalog is backed by studio
            photography and verified weave metadata from our official archive.
          </p>
        </div>

        <div className="category-tiles-grid">
          <div className="pdp-info-card">
            <span className="eyebrow">{counts.sareesCount} Approved Pieces</span>
            <h3 className="serif-h2" style={{ marginBlock: '0.4rem 0.65rem' }}>
              Banarasi, Tussar &amp; Chanderi Sarees
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              From celebratory Soft Banarasi and Banarasi Tussar drapes to airy Organza, Linen,
              Tissue Silk, and breathable everyday Cottons.
            </p>
            <Link to="/collections/sarees" className="btn-link">
              <span>Explore Sarees</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="pdp-info-card">
            <span className="eyebrow">{counts.dressMaterialsCount} Approved Sets</span>
            <h3 className="serif-h2" style={{ marginBlock: '0.4rem 0.65rem' }}>
              Unstitched Salwar &amp; Chudithar Sets
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Coordinated unstitched ensembles in Vichitra Silk, Chanderi with thread &amp; mirror
              work, Kota Cotton, and Linen Cotton — ready for custom tailoring.
            </p>
            <Link to="/collections/dress-materials" className="btn-link">
              <span>Explore Dress Materials</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="pdp-info-card">
            <span className="eyebrow">{counts.fabricsCount} Approved Fabrics</span>
            <h3 className="serif-h2" style={{ marginBlock: '0.4rem 0.65rem' }}>
              Select Woven Fabrics
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Rich Banaras brocade and Sana Silk fabrics suited for custom blouses, kurtas, and
              festive coordinates, with meterage confirmed directly on WhatsApp.
            </p>
            <Link to="/collections/fabrics" className="btn-link">
              <span>Explore Fabrics</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Photography Study */}
      {storyDressMaterial && storyChanderi && (
        <section className="section-spacing section-paper" style={{ marginInline: 'calc(-1 * var(--container-gutter))', paddingInline: 'var(--container-gutter)' }}>
          <div className="container editorial-split">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Link to={`/products/${storyDressMaterial.slug}`} className="editorial-frame" style={{ aspectRatio: '3 / 4' }}>
                <img
                  src={storyDressMaterial.media[0]?.cardUrl}
                  alt={storyDressMaterial.displayTitle}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>
              <Link to={`/products/${storyChanderi.slug}`} className="editorial-frame" style={{ aspectRatio: '3 / 4' }}>
                <img
                  src={storyChanderi.media[0]?.cardUrl}
                  alt={storyChanderi.displayTitle}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
              <span className="eyebrow">Direct Boutique Guidance</span>
              <h2 className="serif-h1">Personal Selection, Direct Conversation</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Choosing a saree or dress material online should feel as reassuring as visiting our
                store in {brand.cityState}. Every piece carries a clear product code so you can
                reach out on WhatsApp for immediate guidance on drape, shade, and availability.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.5rem' }}>
                <a
                  href={buildGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  <span>WhatsApp: {WHATSAPP_DISPLAY_NUMBER}</span>
                </a>
                <a
                  href={INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Instagram size={16} aria-hidden="true" />
                  <span>{INSTAGRAM_HANDLE}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

