import rawCatalogJson from './catalog.json';
import rawQuarantinedJson from './quarantined_and_reference_records.json';
import type {
  BrandMetadata,
  CatalogData,
  CategorySummary,
  EditorialEdit,
  PrimaryCategorySlug,
  Product,
} from '../types/catalog';

const RAW_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

function prefixUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const clean = url.startsWith('/') ? url : '/' + url;
  return RAW_BASE ? `${RAW_BASE}${clean}` : clean;
}

const rawCatalog = rawCatalogJson as unknown as CatalogData;
const rawQuarantined = rawQuarantinedJson as unknown as Product[];

const normalizedBrand: BrandMetadata = {
  ...rawCatalog.brand,
  logo: {
    ...rawCatalog.brand.logo,
    publicWebpPath: prefixUrl(rawCatalog.brand.logo.publicWebpPath),
    publicPngPath: prefixUrl(rawCatalog.brand.logo.publicPngPath),
  },
};

const normalizedProducts: Product[] = rawCatalog.products.map((p) => ({
  ...p,
  media: p.media.map((m) => ({
    ...m,
    thumbUrl: prefixUrl(m.thumbUrl),
    cardUrl: prefixUrl(m.cardUrl),
    galleryUrl: prefixUrl(m.galleryUrl),
    originalFormatUrl: prefixUrl(m.originalFormatUrl),
  })),
}));

const normalizedQuarantined: Product[] = rawQuarantined.map((p) => ({
  ...p,
  media: p.media.map((m) => ({
    ...m,
    thumbUrl: prefixUrl(m.thumbUrl),
    cardUrl: prefixUrl(m.cardUrl),
    galleryUrl: prefixUrl(m.galleryUrl),
    originalFormatUrl: prefixUrl(m.originalFormatUrl),
  })),
}));

const productByIdMap = new Map<string, Product>();
const productBySlugMap = new Map<string, Product>();
const productBySkuMap = new Map<string, Product[]>();

for (const product of normalizedProducts) {
  productByIdMap.set(product.id.toUpperCase(), product);
  productBySlugMap.set(product.slug.toLowerCase(), product);
  if (product.productCode) {
    const key = product.productCode.toUpperCase();
    const list = productBySkuMap.get(key) ?? [];
    list.push(product);
    productBySkuMap.set(key, list);
  }
}

export function getBrandMetadata(): BrandMetadata {
  return normalizedBrand;
}

export function getCatalogCounts() {
  return rawCatalog.counts;
}

export function getAllApprovedProducts(): Product[] {
  return normalizedProducts;
}

export function getQuarantinedAndReferenceRecords(): Product[] {
  return normalizedQuarantined;
}

export function getCategories(): CategorySummary[] {
  return rawCatalog.categories;
}

export function getCategoryBySlug(slug: string | undefined): CategorySummary | undefined {
  if (!slug) return undefined;
  return rawCatalog.categories.find((c) => c.slug === slug.toLowerCase());
}

export function getEditorialEdits(): EditorialEdit[] {
  return rawCatalog.editorialEdits;
}

export function getEditorialEditBySlug(slug: string | undefined | null): EditorialEdit | undefined {
  if (!slug) return undefined;
  return rawCatalog.editorialEdits.find((e) => e.slug === slug.toLowerCase());
}

export function getProductById(id: string | undefined | null): Product | undefined {
  if (!id) return undefined;
  return productByIdMap.get(id.toUpperCase());
}

export function getProductBySlugOrId(slugOrId: string | undefined): Product | undefined {
  if (!slugOrId) return undefined;
  const cleaned = slugOrId.trim();
  const bySlug = productBySlugMap.get(cleaned.toLowerCase());
  if (bySlug) return bySlug;

  const byId = productByIdMap.get(cleaned.toUpperCase());
  if (byId) return byId;

  // Support shorthand e.g. "001" -> "MD-PROD-001"
  if (/^\d{1,3}$/.test(cleaned)) {
    const padded = cleaned.padStart(3, '0');
    const byNum = productByIdMap.get(`MD-PROD-${padded}`);
    if (byNum) return byNum;
  }

  // Support direct SKU lookup e.g. "SKU052MAUVAPUR"
  const bySku = productBySkuMap.get(cleaned.toUpperCase());
  if (bySku && bySku.length > 0) {
    return bySku[0];
  }

  return undefined;
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids.map((id) => getProductById(id)).filter((p): p is Product => Boolean(p));
}

export function getProductsByCategory(category: PrimaryCategorySlug): Product[] {
  return normalizedProducts.filter((p) => p.primaryCategory === category);
}

/**
 * Selects up to 4 visually distinct related products from the same validated category
 * or sharing a verified fabric facet (Prompt 158).
 */
export function getRelatedProducts(current: Product, limit = 4): Product[] {
  const candidates = normalizedProducts.filter((p) => p.id !== current.id);
  const scored = candidates.map((item) => {
    let score = 0;
    if (item.primaryCategory === current.primaryCategory) score += 4;
    const sharedFabrics = item.fabricFacets.filter((f) => current.fabricFacets.includes(f));
    score += sharedFabrics.length * 3;
    if (item.displayTitle !== current.displayTitle) score += 2; // Favor visual & title variety
    return { item, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.item.featuredRank ?? 999) - (b.item.featuredRank ?? 999);
  });

  const picked: Product[] = [];
  const seenTitles = new Set<string>();
  for (const { item } of scored) {
    if (picked.length >= limit) break;
    if (!seenTitles.has(item.displayTitle) || picked.length >= limit - 1) {
      picked.push(item);
      seenTitles.add(item.displayTitle);
    }
  }
  return picked;
}

export function getPriceBounds(products: Product[] = normalizedProducts): {
  min: number;
  max: number;
} {
  const prices = products
    .map((p) => p.priceInr)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  if (prices.length === 0) return { min: 500, max: 3500 };
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
