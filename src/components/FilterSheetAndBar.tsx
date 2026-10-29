import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type {
  EditorialEdit,
  FabricFacet,
  PrimaryCategorySlug,
  SortOption,
} from '../types/catalog';
import { formatInr } from '../utils/money';

interface FilterSheetAndBarProps {
  totalMatched: number;
  totalPool: number;
  selectedCategory: PrimaryCategorySlug | 'all';
  onSelectCategory?: (category: PrimaryCategorySlug | 'all') => void;
  showCategoryTabs?: boolean;
  editorialEdits: EditorialEdit[];
  selectedEditSlug: string | null;
  onSelectEditSlug: (slug: string | null) => void;
  availableFabrics: Array<{ fabric: FabricFacet; count: number }>;
  selectedFabrics: FabricFacet[];
  onToggleFabric: (fabric: FabricFacet) => void;
  minPrice: number | null;
  maxPrice: number | null;
  priceBounds: { min: number; max: number };
  onChangePriceRange: (min: number | null, max: number | null) => void;
  sort: SortOption;
  onChangeSort: (sort: SortOption) => void;
  onClearAll: () => void;
}

const PRICE_PRESETS: Array<{ label: string; min: number | null; max: number | null }> = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₹1,500', min: null, max: 1500 },
  { label: '₹1,500 – ₹2,500', min: 1500, max: 2500 },
  { label: 'Above ₹2,500', min: 2500, max: null },
];

export const FilterSheetAndBar: React.FC<FilterSheetAndBarProps> = ({
  totalMatched,
  totalPool,
  selectedCategory,
  onSelectCategory,
  showCategoryTabs = false,
  editorialEdits,
  selectedEditSlug,
  onSelectEditSlug,
  availableFabrics,
  selectedFabrics,
  onToggleFabric,
  minPrice,
  maxPrice,
  priceBounds,
  onChangePriceRange,
  sort,
  onChangeSort,
  onClearAll,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeFilterCount =
    (selectedEditSlug ? 1 : 0) +
    selectedFabrics.length +
    (minPrice !== null || maxPrice !== null ? 1 : 0);

  const hasAnyFilter =
    activeFilterCount > 0 || (showCategoryTabs && selectedCategory !== 'all');

  const activeEditObj = editorialEdits.find((e) => e.slug === selectedEditSlug);

  return (
    <>
      <div className="filter-toolbar" role="region" aria-label="Catalog filters and sorting">
        {showCategoryTabs && onSelectCategory && (
          <div className="pill-scroll-row" role="tablist" aria-label="Filter by product category">
            {(
              [
                { slug: 'all', label: 'All Pieces' },
                { slug: 'sarees', label: 'Sarees' },
                { slug: 'dress-materials', label: 'Dress Materials' },
                { slug: 'fabrics', label: 'Fabrics' },
              ] as const
            ).map((tab) => {
              const active = selectedCategory === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`filter-pill ${active ? 'is-active' : ''}`}
                  onClick={() => onSelectCategory(tab.slug)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Curated Edits Row — Prompt 107 & 124 */}
        <div className="pill-scroll-row" aria-label="Curated textile edits">
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-subtle)',
              marginRight: '0.35rem',
              whiteSpace: 'nowrap',
            }}
          >
            Curated Edits:
          </span>
          {editorialEdits.map((edit) => {
            const isSelected = selectedEditSlug === edit.slug;
            return (
              <button
                key={edit.slug}
                type="button"
                className={`filter-pill ${isSelected ? 'is-active' : ''}`}
                onClick={() => onSelectEditSlug(isSelected ? null : edit.slug)}
                aria-pressed={isSelected}
              >
                {edit.title}
              </button>
            );
          })}
        </div>

        {/* Controls & Count Row */}
        <div className="filter-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: '40px', padding: '0.45rem 1rem' }}
              onClick={() => setIsDrawerOpen(true)}
              aria-expanded={isDrawerOpen}
              aria-controls="catalog-filter-drawer"
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span>Filter & Refine</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: 'var(--brand-plum)',
                    color: 'var(--bg-paper)',
                    borderRadius: '999px',
                    padding: '0.05rem 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick Fabric Pills on Desktop */}
            <div
              className="pill-scroll-row"
              style={{ maxWidth: '540px' }}
              aria-label="Quick fabric filter"
            >
              {availableFabrics.slice(0, 6).map(({ fabric, count }) => {
                const active = selectedFabrics.includes(fabric);
                return (
                  <button
                    key={fabric}
                    type="button"
                    className={`filter-pill ${active ? 'is-active' : ''}`}
                    onClick={() => onToggleFabric(fabric)}
                    aria-pressed={active}
                  >
                    <span>{fabric}</span>
                    <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <p
              aria-live="polite"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Showing <strong>{totalMatched}</strong> of {totalPool}{' '}
              {totalPool === 1 ? 'piece' : 'pieces'}
            </p>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              <span className="sr-only">Sort products by</span>
              <select
                value={sort}
                onChange={(e) => onChangeSort(e.target.value as SortOption)}
                className="sort-select"
                aria-label="Sort products by"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        {/* Active Filter Chips — Prompt 131 */}
        {hasAnyFilter && (
          <div className="active-chips-row" aria-label="Active filters">
            {showCategoryTabs && selectedCategory !== 'all' && onSelectCategory && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={() => onSelectCategory('all')}
              >
                <span>Category: {selectedCategory.replace('-', ' ')}</span>
                <X size={13} aria-hidden="true" />
              </button>
            )}

            {activeEditObj && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={() => onSelectEditSlug(null)}
              >
                <span>Edit: {activeEditObj.title}</span>
                <X size={13} aria-hidden="true" />
              </button>
            )}

            {selectedFabrics.map((fabric) => (
              <button
                key={fabric}
                type="button"
                className="active-filter-chip"
                onClick={() => onToggleFabric(fabric)}
              >
                <span>Fabric: {fabric}</span>
                <X size={13} aria-hidden="true" />
              </button>
            ))}

            {(minPrice !== null || maxPrice !== null) && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={() => onChangePriceRange(null, null)}
              >
                <span>
                  Price: {minPrice ? formatInr(minPrice) : formatInr(priceBounds.min)} –{' '}
                  {maxPrice ? formatInr(maxPrice) : formatInr(priceBounds.max)}
                </span>
                <X size={13} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              className="btn-link"
              style={{ fontSize: '0.78rem', marginLeft: '0.35rem', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}
              onClick={onClearAll}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawer / Bottom Sheet — Prompt 126 & 266 */}
      {isDrawerOpen && (
        <div
          className="backdrop-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-drawer-title"
          id="catalog-filter-drawer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDrawerOpen(false);
          }}
        >
          <div className="drawer-panel">
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Refine Selection</span>
                <h2 id="filter-drawer-title" className="serif-h3">
                  Filter & Sort
                </h2>
              </div>
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close filter drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Fabric Family Facets */}
              <section aria-labelledby="filter-fabric-heading">
                <h3
                  id="filter-fabric-heading"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  Verified Fabric & Weave
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                  {availableFabrics.map(({ fabric, count }) => {
                    const checked = selectedFabrics.includes(fabric);
                    return (
                      <label
                        key={fabric}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.45rem 0.65rem',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          background: checked ? 'var(--bg-plum-tint)' : 'var(--bg-ivory)',
                          cursor: 'pointer',
                          fontSize: '0.86rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleFabric(fabric)}
                        />
                        <span style={{ flex: 1 }}>{fabric}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Price Band Presets */}
              <section aria-labelledby="filter-price-heading">
                <h3
                  id="filter-price-heading"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  Price Range (INR)
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {PRICE_PRESETS.map((preset) => {
                    const isActive = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        className={`filter-pill ${isActive ? 'is-active' : ''}`}
                        onClick={() => onChangePriceRange(preset.min, preset.max)}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" htmlFor="filter-min-price">
                      Min INR ({formatInr(priceBounds.min)})
                    </label>
                    <input
                      id="filter-min-price"
                      type="number"
                      className="form-input"
                      min={0}
                      max={priceBounds.max}
                      placeholder={String(priceBounds.min)}
                      value={minPrice ?? ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        onChangePriceRange(val ? Number(val) : null, maxPrice);
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="filter-max-price">
                      Max INR ({formatInr(priceBounds.max)})
                    </label>
                    <input
                      id="filter-max-price"
                      type="number"
                      className="form-input"
                      min={0}
                      max={10000}
                      placeholder={String(priceBounds.max)}
                      value={maxPrice ?? ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        onChangePriceRange(minPrice, val ? Number(val) : null);
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* Curated Edits inside Drawer */}
              <section aria-labelledby="filter-edits-heading">
                <h3
                  id="filter-edits-heading"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  Curated Edits
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {editorialEdits.map((edit) => {
                    const active = selectedEditSlug === edit.slug;
                    return (
                      <button
                        key={edit.slug}
                        type="button"
                        onClick={() => onSelectEditSlug(active ? null : edit.slug)}
                        style={{
                          textAlign: 'left',
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-xs)',
                          border: active
                            ? '1px solid var(--brand-plum)'
                            : '1px solid var(--border-subtle)',
                          background: active ? 'var(--bg-plum-tint)' : 'var(--bg-ivory)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{edit.title}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {edit.eyebrow} · {edit.productIds.length} pieces
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div
              className="drawer-footer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClearAll}
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={() => setIsDrawerOpen(false)}
              >
                View {totalMatched} {totalMatched === 1 ? 'Piece' : 'Pieces'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

