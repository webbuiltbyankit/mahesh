import type { FabricFacet, FilterState, Product } from '../types/catalog';
import { getEditorialEditBySlug } from '../data/catalogRepository';

/**
 * Normalizes search tokens and gentle spelling variants backed by actual archive titles
 * (Prompts 182, 183, 192, 198, 199)
 */
const SYNONYM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\boraganza\b/gi, 'organza'],
  [/\bbanarashi\b/gi, 'banarasi'],
  [/\bbanaras\b/gi, 'banarasi'],
  [/\bkotta\b/gi, 'kota'],
  [/\bslup\b/gi, 'slub'],
  [/\btread\b/gi, 'thread'],
  [/\brawsilk\b/gi, 'raw silk'],
  [/\bchudi\b/gi, 'chudithar dress material'],
  [/\bchudithar\b/gi, 'chudithar dress material'],
  [/\bsalwar\b/gi, 'salwar dress material'],
  [/\bsuit\b/gi, 'dress material'],
];

export function normalizeSearchText(input: string): string {
  let text = input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[-_/.,()]+/g, ' ');
  for (const [pattern, replacement] of SYNONYM_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s+/g, ' ').trim();
}

export function buildProductSearchIndex(product: Product): string {
  const rawParts = [
    product.id,
    product.displayTitle,
    product.sourceTitle ?? '',
    product.subtitle,
    product.productCode ?? '',
    product.primaryCategoryLabel,
    product.primaryCategory === 'dress-materials' ? 'unstitched dress material salwar chudithar set' : '',
    product.primaryCategory === 'sarees' ? 'saree sarees drape' : '',
    product.primaryCategory === 'fabrics' ? 'fabric fabrics running material' : '',
    ...product.fabricFacets,
    ...product.rawFabrics,
    ...product.sourceColors,
    ...product.sourceStyles,
  ];
  const joined = rawParts.join(' ');
  return `${joined.toLowerCase()} ${normalizeSearchText(joined)}`;
}

const searchIndexCache = new WeakMap<Product, string>();

function getIndexForProduct(product: Product): string {
  let cached = searchIndexCache.get(product);
  if (!cached) {
    cached = buildProductSearchIndex(product);
    searchIndexCache.set(product, cached);
  }
  return cached;
}

export function matchesSearchQuery(product: Product, rawQuery: string): boolean {
  const trimmed = rawQuery.trim();
  if (!trimmed) return true;

  // Direct exact or prefix SKU / ID match
  const compactQuery = trimmed.replace(/\s+/g, '').toLowerCase();
  if (product.productCode && product.productCode.toLowerCase().includes(compactQuery)) {
    return true;
  }
  if (product.id.toLowerCase().includes(compactQuery)) {
    return true;
  }

  const normalizedQuery = normalizeSearchText(trimmed);
  if (!normalizedQuery) return true;

  const indexStr = getIndexForProduct(product);
  const tokens = normalizedQuery.split(' ').filter((t) => t.length > 0 && t !== 'and');
  return tokens.every((token) => indexStr.includes(token));
}

export function filterAndSortProducts(products: Product[], filter: FilterState): Product[] {
  let result = products.filter((p) => p.status === 'approved');

  // 1. Primary Category Filter
  if (filter.category && filter.category !== 'all') {
    result = result.filter((p) => p.primaryCategory === filter.category);
  }

  // 2. Curated Editorial Edit Filter
  if (filter.editSlug) {
    const edit = getEditorialEditBySlug(filter.editSlug);
    if (edit) {
      const idSet = new Set(edit.productIds);
      result = result.filter((p) => idSet.has(p.id));
    }
  }

  // 3. Search Query Filter
  if (filter.query && filter.query.trim().length > 0) {
    const q = filter.query;
    result = result.filter((p) => matchesSearchQuery(p, q));
  }

  // 4. Verified Fabric Facets Filter
  if (filter.fabrics && filter.fabrics.length > 0) {
    const selectedFabrics = new Set<FabricFacet>(filter.fabrics);
    result = result.filter((p) => p.fabricFacets.some((f) => selectedFabrics.has(f)));
  }

  // 5. Price Range Filter
  if (typeof filter.minPrice === 'number' && !Number.isNaN(filter.minPrice)) {
    const min = filter.minPrice;
    result = result.filter((p) => p.priceInr !== null && p.priceInr >= min);
  }
  if (typeof filter.maxPrice === 'number' && !Number.isNaN(filter.maxPrice)) {
    const max = filter.maxPrice;
    result = result.filter((p) => p.priceInr !== null && p.priceInr <= max);
  }

  // 6. Deterministic Sorting (Prompt 134)
  const sort = filter.sort ?? 'featured';
  const sorted = [...result];
  sorted.sort((a, b) => {
    if (sort === 'price-asc') {
      const pa = a.priceInr ?? Number.MAX_SAFE_INTEGER;
      const pb = b.priceInr ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return a.id.localeCompare(b.id);
    }
    if (sort === 'price-desc') {
      const pa = a.priceInr ?? 0;
      const pb = b.priceInr ?? 0;
      if (pa !== pb) return pb - pa;
      return a.id.localeCompare(b.id);
    }
    if (sort === 'name-asc') {
      const cmp = a.displayTitle.localeCompare(b.displayTitle);
      if (cmp !== 0) return cmp;
      return a.id.localeCompare(b.id);
    }
    // Default: 'featured'
    const ra = a.featuredRank ?? 999;
    const rb = b.featuredRank ?? 999;
    if (ra !== rb) return ra - rb;
    return a.id.localeCompare(b.id);
  });

  return sorted;
}

export function getAvailableFabricCounts(
  products: Product[],
  baseFilter: Omit<FilterState, 'fabrics'>
): Array<{ fabric: FabricFacet; count: number }> {
  const baseMatched = filterAndSortProducts(products, { ...baseFilter, fabrics: [] });
  const counts = new Map<FabricFacet, number>();
  for (const p of baseMatched) {
    for (const f of p.fabricFacets) {
      counts.set(f, (counts.get(f) ?? 0) + 1);
    }
  }
  const order: FabricFacet[] = [
    'Banarasi',
    'Tussar',
    'Chanderi',
    'Cotton',
    'Silk',
    'Tissue',
    'Linen',
    'Organza',
    'Muslin',
    'Jute',
  ];
  return order
    .map((fabric) => ({ fabric, count: counts.get(fabric) ?? 0 }))
    .filter((item) => item.count > 0);
}

