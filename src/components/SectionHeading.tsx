import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  align = 'left',
}) => {
  return (
    <div
      className="section-heading"
      style={
        align === 'center'
          ? { flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
          : undefined
      }
    >
      <div className="section-heading-copy">
        {eyebrow && (
          <span className="eyebrow" style={{ marginBottom: '0.45rem' }}>
            {eyebrow}
          </span>
        )}
        <h2 className="serif-h2">{title}</h2>
        {subtitle && <p className="section-heading-sub">{subtitle}</p>}
      </div>
      {ctaLabel && ctaHref && (
        <Link to={ctaHref} className="btn-link">
          <span>{ctaLabel}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};

