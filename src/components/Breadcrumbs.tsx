import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  backLink?: {
    label: string;
    href: string;
  };
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, backLink }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        paddingBlock: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}
    >
      <ol
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li
              key={`${item.label}-${idx}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {idx > 0 && <ChevronRight size={13} aria-hidden="true" style={{ opacity: 0.6 }} />}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'color 150ms',
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast ? 'var(--text-ink)' : 'var(--text-muted)',
                    fontWeight: isLast ? 500 : 400,
                  }}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {backLink && (
        <Link to={backLink.href} className="btn-link" style={{ fontSize: '0.8rem' }}>
          ← {backLink.label}
        </Link>
      )}
    </nav>
  );
};

