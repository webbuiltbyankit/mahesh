import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldAlert } from 'lucide-react';
import { getBrandMetadata } from '../data/catalogRepository';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { buildGeneralWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from '../utils/whatsapp';

export const PoliciesPage: React.FC = () => {
  const brand = getBrandMetadata();

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Ordering & Policy Notes' },
        ]}
      />

      <header
        style={{
          paddingBlock: '1.5rem 2.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2.5rem',
        }}
      >
        <span className="eyebrow">Transparent Boutique Guidance</span>
        <h1 className="serif-h1" style={{ marginTop: '0.35rem', marginBottom: '0.65rem' }}>
          Ordering, Sizing &amp; Policy Notes
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '64ch' }}>
          Clear, factual guidance on how products, prices, fabric units, and boutique enquiries work
          in this Mahesh Designers catalog showcase.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        <section className="pdp-info-card">
          <span className="eyebrow">1 · Product Pricing &amp; Codes</span>
          <h2 className="serif-h3" style={{ marginBlock: '0.35rem 0.65rem' }}>
            Verified Archive Prices in INR
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Every price shown across the 62 catalog pieces is taken directly from the official
            Mahesh Designers product captions (ranging from ₹545 to ₹3,295). No artificial
            strikethrough MRPs or simulated discounts are displayed. Each piece includes its
            archive reference ID (e.g., <span className="sku-code">MD-PROD-001</span>) and, where
            published, its official boutique product code (e.g.,{' '}
            <span className="sku-code">SKU052MAUVAPUR</span>).
          </p>
        </section>

        <section className="pdp-info-card">
          <span className="eyebrow">2 · Formats &amp; Sizing</span>
          <h2 className="serif-h3" style={{ marginBlock: '0.35rem 0.65rem' }}>
            Sarees, Unstitched Sets &amp; Running Fabrics
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            • <strong>Sarees (52 pieces):</strong> Full-length woven drapes; please confirm blouse
            piece inclusion for any specific SKU via WhatsApp.<br />
            • <strong>Dress Materials (8 sets):</strong> Supplied as unstitched salwar / chudithar
            fabric sets ready for custom tailoring — no pre-stitched apparel sizes (XS–XXL) apply.<br />
            • <strong>Fabrics (2 pieces):</strong> Listed at the archive unit price; please confirm
            exact meterage and cut length with the boutique before ordering.
          </p>
        </section>

        <section className="pdp-info-card">
          <span className="eyebrow">3 · Availability &amp; Dispatch</span>
          <h2 className="serif-h3" style={{ marginBlock: '0.35rem 0.65rem' }}>
            Confirmed Directly from {brand.cityState}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Because boutique textiles are stocked in limited quantities, live inventory counts,
            domestic or international shipping charges, and dispatch timelines are confirmed
            personally on WhatsApp ({WHATSAPP_DISPLAY_NUMBER}) prior to payment.
          </p>
        </section>

        <section className="pdp-info-card">
          <span className="eyebrow">4 · Exchanges, Care &amp; Colour</span>
          <h2 className="serif-h3" style={{ marginBlock: '0.35rem 0.65rem' }}>
            Weave Care &amp; Policy Confirmation
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Silk, Banarasi, Tussar, Chanderi, and embroidered textiles benefit from gentle handling;
            please request weave-specific care advice and confirm current exchange or defect-claim
            terms with the boutique team on WhatsApp before finalizing your order.
          </p>
        </section>
      </div>

      <div className="demo-banner" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        <div style={{ maxWidth: '62ch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--brand-plum)', marginBottom: '0.25rem' }}>
            <ShieldAlert size={16} aria-hidden="true" />
            <span>Frontend Concept Preview Notice</span>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-ink)' }}>
            This website is a browser-only frontend demonstration built from the verified Mahesh
            Designers archive. Wishlist and Shopping Bag items are stored only in your local
            browser, and no payment or personal data is transmitted to any backend server.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={buildGeneralWhatsAppUrl('Ordering & Policy Confirmation')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <MessageCircle size={15} aria-hidden="true" />
            <span>Ask on WhatsApp</span>
          </a>
          <Link to="/collections" className="btn btn-secondary">
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

