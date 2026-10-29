import React, { useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, MessageCircle, RotateCcw } from 'lucide-react';
import type {
  FabricFacet,
  PrimaryCategorySlug,
  SortOption,
} from '../types/catalog';
import {
  getAllApprovedProducts,
  getCategories,
  getCategoryBySlug,
  getEditorialEditBySlug,
  getEditorialEdits,
  getPriceBounds,
  getProductById,
} from '../data/catalogRepository';
import { filterAndSortProducts, getAvailableFabricCounts } from '../utils/search';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FilterSheetAndBar } from '../components/FilterSheetAndBar';
import { ProductCard } from '../components/ProductCard';
import { buildGeneralWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from '../utils/whatsapp';

const VALID_CATEGORIES = new Set<PrimaryCategorySlug>([
  'sarees',
  'dress-materials',
  'fabrics',
]);

export const CollectionsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const allProducts = useMemo(() => getAllApprovedProducts(), []);
  const categories = useMemo(() => getCategories(), []);
  const editorialEdits = useMemo(() => getEditorialEdits(), []);

  const activeCategorySlug: PrimaryCategorySlug | 'all' =
    categorySlug && VALID_CATEGORIES.has(categorySlug as PrimaryCategorySlug)
      ? (categorySlug as PrimaryCategorySlug)
      : 'all';

  const activeCategorySummary =
    activeCategorySlug !== 'all' ? getCategoryBySlug(activeCategorySlug) : undefined;

  // Read filters from URL search params
  const selectedEditSlug = searchParams.get('edit') || null;
  const selectedEditObj = getEditorialEditBySlug(selectedEditSlug);

  const selectedFabrics = useMemo<FabricFacet[]>(() => {
    const raw = searchParams.get('fabric');
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as FabricFacet[];
  }, [searchParams]);

  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const minPrice = minPriceParam ? Number(minPriceParam) : null;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;

  const sortParam = (searchParams.get('sort') as SortOption) || 'featured';

  // Pool of products for current route category
  const categoryPool = useMemo(() => {
    if (activeCategorySlug === 'all') return allProducts;
    return allProducts.filter((p) => p.primaryCategory === activeCategorySlug);
  }, [allProducts, activeCategorySlug]);

  const priceBounds = useMemo(() => getPriceBounds(categoryPool), [categoryPool]);

  const availableFabrics = useMemo(
    () =>
      getAvailableFabricCounts(allProducts, {
        category: activeCategorySlug,
        editSlug: selectedEditSlug,
        minPrice,
        maxPrice,
      }),
    [allProducts, activeCategorySlug, selectedEditSlug, minPrice, maxPrice]
  );

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(allProducts, {
        category: activeCategorySlug,
        editSlug: selectedEditSlug,
        fabrics: selectedFabrics,
        minPrice,
        maxPrice,
        sort: sortParam,
      }),
    [allProducts, activeCategorySlug, selectedEditSlug, selectedFabrics, minPrice, maxPrice, sortParam]
  );

  // Handlers to update URL search params cleanly
  const updateParams = (updater: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next, { replace: true });
  };

  const handleSelectCategory = (cat: PrimaryCategorySlug | 'all') => {
    const queryStr = searchParams.toString();
    const suffix = queryStr ? `?${queryStr}` : '';
    if (cat === 'all') {
      navigate(`/collections${suffix}`);
    } else {
      navigate(`/collections/${cat}${suffix}`);
    }
  };

  const handleSelectEditSlug = (slug: string | null) => {
    updateParams((next) => {
      if (slug) next.set('edit', slug);
      else next.delete('edit');
    });
  };

  const handleToggleFabric = (fabric: FabricFacet) => {
    updateParams((next) => {
      const exists = selectedFabrics.includes(fabric);
      const updated = exists
        ? selectedFabrics.filter((f) => f !== fabric)
        : [...selectedFabrics, fabric];
      if (updated.length > 0) next.set('fabric', updated.join(','));
      else next.delete('fabric');
    });
  };

  const handleChangePriceRange = (min: number | null, max: number | null) => {
    updateParams((next) => {
      if (min !== null && !Number.isNaN(min)) next.set('minPrice', String(min));
      else next.delete('minPrice');
      if (max !== null && !Number.isNaN(max)) next.set('maxPrice', String(max));
      else next.delete('maxPrice');
    });
  };

  const handleChangeSort = (sort: SortOption) => {
    updateParams((next) => {
      if (sort && sort !== 'featured') next.set('sort', sort);
      else next.delete('sort');
    });
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const landingHeroProduct = useMemo(() => {
    if (selectedEditObj) {
      return getProductById(selectedEditObj.heroProductId);
    }
    if (activeCategorySummary) {
      return getProductById(activeCategorySummary.landingHeroProductId);
    }
    return getProductById('MD-PROD-001');
  }, [selectedEditObj, activeCategorySummary]);

  const breadcrumbItems = useMemo(() => {
    const list = [
      { label: 'Home', href: '/' },
      { label: 'Collections', href: activeCategorySlug === 'all' ? undefined : '/collections' },
    ];
    if (activeCategorySummary) {
      list.push({ label: activeCategorySummary.title, href: undefined });
    } else if (selectedEditObj) {
      list.push({ label: selectedEditObj.title, href: undefined });
    }
    return list;
  }, [activeCategorySlug, activeCategorySummary, selectedEditObj]);

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <Breadcrumbs items={breadcrumbItems} />

      {/* Category or Curated Edit Editorial Hero — Prompts 104–107 */}
      <section className="collection-hero" aria-label="Collection introduction">
        <div>
          <span className="eyebrow">
            {selectedEditObj
              ? selectedEditObj.eyebrow
              : activeCategorySummary
              ? activeCategorySummary.eyebrow
              : 'Complete Archive · 62 Approved Pieces'}
          </span>

          <h1 className="serif-h1" style={{ marginTop: '0.35rem', marginBottom: '0.85rem' }}>
            {selectedEditObj
              ? selectedEditObj.title
              : activeCategorySummary
              ? activeCategorySummary.title
              : 'All Collections'}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', maxWidth: '58ch' }}>
            {selectedEditObj
              ? selectedEditObj.description
              : activeCategorySummary
              ? activeCategorySummary.editorialIntro
              : 'Browse the complete verified Mahesh Designers collection — 52 sarees, 8 unstitched salwar dress material sets, and 2 select running fabrics.'}
          </p>

          {activeCategorySlug === 'dress-materials' && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.65rem 0.95rem',
                background: 'var(--bg-plum-tint)',
                borderLeft: '3px solid var(--brand-plum)',
                fontSize: '0.82rem',
              }}
            >
              <strong>Unstitched Format Note:</strong> All 8 pieces in this collection are
              unstitched dress material sets ready for custom tailoring. No pre-stitched garment
              size selection (XS–XXL) is required.
            </div>
          )}

          {activeCategorySlug === 'fabrics' && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.65rem 0.95rem',
                background: 'var(--bg-plum-tint)',
                borderLeft: '3px solid var(--brand-plum)',
                fontSize: '0.82rem',
              }}
            >
              <strong>Unit &amp; Meterage Note:</strong> Listed prices reflect the catalog unit
              rate. Please confirm your required cut length or meterage with the boutique on
              WhatsApp before ordering.
            </div>
          )}
        </div>

        {landingHeroProduct && (
          <div className="collection-hero-media">
            <Link to={`/products/${landingHeroProduct.slug}`}>
              <img
                src={landingHeroProduct.media[0]?.cardUrl}
                alt={landingHeroProduct.displayTitle}
                loading="eager"
              />
            </Link>
          </div>
        )}
      </section>

      {/* Category Gateway Cards on /collections when no specific category is selected */}
      {activeCategorySlug === 'all' && !selectedEditObj && (
        <section
          aria-label="Category shortcuts"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            paddingBlock: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/collections/${cat.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <div>
                <div className="eyebrow" style={{ fontSize: '0.66rem' }}>
                  {cat.eyebrow}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600 }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {cat.count} {cat.count === 1 ? 'piece' : 'pieces'}
                </div>
              </div>
              <ArrowRight size={18} color="var(--brand-plum)" aria-hidden="true" />
            </Link>
          ))}
        </section>
      )}

      {/* Filter Bar & Mobile Drawer — Prompts 121–139 */}
      <FilterSheetAndBar
        totalMatched={filteredProducts.length}
        totalPool={categoryPool.length}
        selectedCategory={activeCategorySlug}
        onSelectCategory={handleSelectCategory}
        showCategoryTabs={true}
        editorialEdits={editorialEdits}
        selectedEditSlug={selectedEditSlug}
        onSelectEditSlug={handleSelectEditSlug}
        availableFabrics={availableFabrics}
        selectedFabrics={selectedFabrics}
        onToggleFabric={handleToggleFabric}
        minPrice={minPrice}
        maxPrice={maxPrice}
        priceBounds={priceBounds}
        onChangePriceRange={handleChangePriceRange}
        sort={sortParam}
        onChangeSort={handleChangeSort}
        onClearAll={handleClearAll}
      />

      {/* Product Grid or Empty Filter Recovery State — Prompts 109–113 & 133 */}
      {filteredProducts.length > 0 ? (
        <section aria-label="Product catalog grid">
          <div className="product-grid">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
                showSku={true}
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
          <span className="eyebrow">No Matching Pieces</span>
          <h2 className="serif-h2" style={{ marginTop: '0.4rem', marginBottom: '0.65rem' }}>
            No pieces match all selected filters
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '46ch', marginInline: 'auto', marginBottom: '1.5rem' }}>
            Try clearing one of your fabric or price filters, or explore our full collection of 62
            sarees, unstitched dress materials, and fabrics.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handleClearAll}>
              <RotateCcw size={15} aria-hidden="true" />
              <span>Reset All Filters</span>
            </button>
            <Link to="/collections" className="btn btn-secondary">
              View All 62 Pieces
            </Link>
          </div>
        </section>
      )}

      {/* Bottom Boutique Assistance Note — Prompt 118 */}
      <section
        style={{
          marginTop: '4rem',
          padding: '2rem',
          background: 'var(--bg-paper)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        <div>
          <span className="eyebrow">Personal Assistance</span>
          <h3 className="serif-h3" style={{ marginTop: '0.25rem' }}>
            Looking for a specific weave, shade, or product code?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Message our team in Tirupur on WhatsApp for direct availability and ordering guidance.
          </p>
        </div>
        <a
          href={buildGeneralWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <MessageCircle size={16} aria-hidden="true" />
          <span>WhatsApp: {WHATSAPP_DISPLAY_NUMBER}</span>
        </a>
      </section>
    </div>
  );
};

