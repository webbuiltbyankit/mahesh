import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RotateCcw, Search, X } from 'lucide-react';
import type {
  FabricFacet,
  PrimaryCategorySlug,
  SortOption,
} from '../types/catalog';
import {
  getAllApprovedProducts,
  getEditorialEdits,
  getPriceBounds,
} from '../data/catalogRepository';
import { filterAndSortProducts, getAvailableFabricCounts } from '../utils/search';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FilterSheetAndBar } from '../components/FilterSheetAndBar';
import { ProductCard } from '../components/ProductCard';

const SUGGESTED_SEARCHES = [
  'Tussar Banaras',
  'Soft Banarasi',
  'Chanderi',
  'Vichitra Silk',
  'Cotton',
  'Tissue Silk',
  'Linen',
  'Organza',
  'Dress Material',
  'SKU052MAUVAPUR',
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allProducts = useMemo(() => getAllApprovedProducts(), []);
  const editorialEdits = useMemo(() => getEditorialEdits(), []);
  const priceBounds = useMemo(() => getPriceBounds(allProducts), [allProducts]);

  const queryParam = searchParams.get('q') ?? '';
  const [inputVal, setInputVal] = useState(queryParam);

  // Sync local input when URL ?q= changes externally
  React.useEffect(() => {
    setInputVal(queryParam);
  }, [queryParam]);

  const selectedCategory =
    (searchParams.get('category') as PrimaryCategorySlug | 'all') || 'all';
  const selectedEditSlug = searchParams.get('edit') || null;
  const selectedFabrics = useMemo<FabricFacet[]>(() => {
    const raw = searchParams.get('fabric');
    if (!raw) return [];
    return raw.split(',').filter(Boolean) as FabricFacet[];
  }, [searchParams]);

  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const minPrice = minPriceParam ? Number(minPriceParam) : null;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;
  const sortParam = (searchParams.get('sort') as SortOption) || 'featured';

  const updateParams = (updater: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next, { replace: true });
  };

  const handleQueryChange = (val: string) => {
    setInputVal(val);
    updateParams((next) => {
      if (val.trim()) next.set('q', val);
      else next.delete('q');
    });
  };

  const availableFabrics = useMemo(
    () =>
      getAvailableFabricCounts(allProducts, {
        query: queryParam,
        category: selectedCategory,
        editSlug: selectedEditSlug,
        minPrice,
        maxPrice,
      }),
    [allProducts, queryParam, selectedCategory, selectedEditSlug, minPrice, maxPrice]
  );

  const matchedProducts = useMemo(
    () =>
      filterAndSortProducts(allProducts, {
        query: queryParam,
        category: selectedCategory,
        editSlug: selectedEditSlug,
        fabrics: selectedFabrics,
        minPrice,
        maxPrice,
        sort: sortParam,
      }),
    [
      allProducts,
      queryParam,
      selectedCategory,
      selectedEditSlug,
      selectedFabrics,
      minPrice,
      maxPrice,
      sortParam,
    ]
  );

  const handleClearAll = () => {
    setInputVal('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Search Catalog' },
        ]}
      />

      {/* Search Header & Input Box — Prompts 181–190 */}
      <section
        style={{
          paddingBlock: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
        aria-label="Catalog search"
      >
        <span className="eyebrow">Catalog Search</span>
        <h1 className="serif-h1" style={{ marginTop: '0.35rem', marginBottom: '1rem' }}>
          {queryParam.trim()
            ? `Search Results for “${queryParam.trim()}”`
            : 'Search Sarees, Dress Materials & Weaves'}
        </h1>

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bg-paper)',
            border: '1.5px solid var(--border-strong)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.45rem 0.9rem',
            maxWidth: '720px',
          }}
        >
          <Search size={20} color="var(--text-muted)" aria-hidden="true" />
          <input
            type="search"
            value={inputVal}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by title, weave (Banarasi, Chanderi, Tussar, Cotton), or SKU code..."
            aria-label="Search catalog"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              paddingBlock: '0.45rem',
              outline: 'none',
            }}
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              className="icon-action-btn"
              aria-label="Clear search text"
            >
              <X size={18} />
            </button>
          )}
        </form>

        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginRight: '0.25rem' }}>
            Try searching:
          </span>
          {SUGGESTED_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              className={`filter-pill ${
                queryParam.toLowerCase() === term.toLowerCase() ? 'is-active' : ''
              }`}
              onClick={() => handleQueryChange(term)}
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Shared Filter Bar */}
      <FilterSheetAndBar
        totalMatched={matchedProducts.length}
        totalPool={allProducts.length}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) =>
          updateParams((next) => {
            if (cat === 'all') next.delete('category');
            else next.set('category', cat);
          })
        }
        showCategoryTabs={true}
        editorialEdits={editorialEdits}
        selectedEditSlug={selectedEditSlug}
        onSelectEditSlug={(slug) =>
          updateParams((next) => {
            if (slug) next.set('edit', slug);
            else next.delete('edit');
          })
        }
        availableFabrics={availableFabrics}
        selectedFabrics={selectedFabrics}
        onToggleFabric={(fabric) =>
          updateParams((next) => {
            const exists = selectedFabrics.includes(fabric);
            const updated = exists
              ? selectedFabrics.filter((f) => f !== fabric)
              : [...selectedFabrics, fabric];
            if (updated.length > 0) next.set('fabric', updated.join(','));
            else next.delete('fabric');
          })
        }
        minPrice={minPrice}
        maxPrice={maxPrice}
        priceBounds={priceBounds}
        onChangePriceRange={(min, max) =>
          updateParams((next) => {
            if (min !== null) next.set('minPrice', String(min));
            else next.delete('minPrice');
            if (max !== null) next.set('maxPrice', String(max));
            else next.delete('maxPrice');
          })
        }
        sort={sortParam}
        onChangeSort={(sort) =>
          updateParams((next) => {
            if (sort !== 'featured') next.set('sort', sort);
            else next.delete('sort');
          })
        }
        onClearAll={handleClearAll}
      />

      {/* Results Grid or Recovery State — Prompts 193–196 */}
      {matchedProducts.length > 0 ? (
        <section aria-label="Search results">
          <div className="product-grid">
            {matchedProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
                showSku={true}
                searchContext={queryParam.trim() || undefined}
              />
            ))}
          </div>
        </section>
      ) : (
        <section
          aria-live="polite"
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            background: 'var(--bg-paper)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <span className="eyebrow">No Exact Matches</span>
          <h2 className="serif-h2" style={{ marginTop: '0.4rem', marginBottom: '0.65rem' }}>
            We couldn&rsquo;t find any pieces matching &ldquo;{queryParam}&rdquo;
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '48ch',
              marginInline: 'auto',
              marginBottom: '1.5rem',
            }}
          >
            Check the spelling or product code, clear active filters, or explore one of our primary
            textile categories below.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handleClearAll}>
              <RotateCcw size={15} aria-hidden="true" />
              <span>Clear Search &amp; Filters</span>
            </button>
            <Link to="/collections/sarees" className="btn btn-secondary">
              Browse Sarees (52)
            </Link>
            <Link to="/collections/dress-materials" className="btn btn-secondary">
              Browse Dress Materials (8)
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

