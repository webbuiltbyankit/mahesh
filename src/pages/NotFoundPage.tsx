import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container section-spacing">
      <div
        style={{
          maxWidth: '640px',
          marginInline: 'auto',
          textAlign: 'center',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
          background: 'var(--bg-paper)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
        }}
      >
        <Compass
          size={38}
          strokeWidth={1.3}
          style={{ marginInline: 'auto', color: 'var(--brand-plum)', marginBottom: '1rem' }}
        />
        <span className="eyebrow">404 · Page Not Found</span>
        <h1 className="serif-h1" style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
          We couldn&rsquo;t find that page
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The link you followed may be outdated or mistyped. Explore our verified saree, unstitched
          dress material, and fabric collections below.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.85rem',
            marginBottom: '1.75rem',
          }}
        >
          <Link to="/" className="btn btn-primary">
            <span>Return to Homepage</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link to="/collections/sarees" className="btn btn-secondary">
            Shop Sarees (52)
          </Link>
          <Link to="/search" className="btn btn-secondary">
            <Search size={15} aria-hidden="true" />
            <span>Search Catalog</span>
          </Link>
        </div>

        <div
          style={{
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            fontSize: '0.84rem',
          }}
        >
          <Link to="/collections/dress-materials" className="btn-link">
            Dress Materials (8)
          </Link>
          <Link to="/collections/fabrics" className="btn-link">
            Select Fabrics (2)
          </Link>
          <Link to="/our-story" className="btn-link">
            Our Story
          </Link>
          <Link to="/contact" className="btn-link">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

