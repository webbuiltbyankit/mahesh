export type PrimaryCategorySlug = 'sarees' | 'dress-materials' | 'fabrics';

export type FabricFacet =
  | 'Banarasi'
  | 'Tussar'
  | 'Chanderi'
  | 'Cotton'
  | 'Silk'
  | 'Tissue'
  | 'Linen'
  | 'Organza'
  | 'Muslin'
  | 'Jute';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface ProductMedia {
  id: string;
  productId: string;
  role: 'cover' | 'gallery';
  index: number;
  sourcePath: string;
  sourceFormat: string;
  sha256: string;
  width: number;
  height: number;
  aspectRatio: number;
  thumbUrl: string;
  cardUrl: string;
  galleryUrl: string;
  originalFormatUrl: string;
  alt: string;
}

export interface DataConfidence {
  title: string;
  price: string;
  productCode: string;
  primaryCategory: string;
  fabricFacets: string;
  colors: string;
  sizes: string;
  availability: string;
  shippingAndReturns: string;
}

export interface Product {
  id: string;
  slug: string;
  shortcode: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  sourceTitle: string | null;
  displayTitle: string;
  subtitle: string;
  productCode: string | null;
  priceInr: number | null;
  pricePaise: number | null;
  priceFormatted: string;
  rawPriceString: string | null;
  primaryCategory: PrimaryCategorySlug | null;
  primaryCategoryLabel: string;
  rawCategories: string[];
  fabricFacets: FabricFacet[];
  rawFabrics: string[];
  sourceColors: string[];
  sourceStyles: string[];
  description: string;
  originalCaption: string | null;
  unitNote: string | null;
  whatsappNumber: string;
  status: 'approved' | 'quarantined' | 'reference_only';
  statusReason: string | null;
  featuredRank?: number;
  media: ProductMedia[];
  skippedDuplicateMedia: Array<{ sourcePath: string; sha256: string }>;
  confidence: DataConfidence;
}

export interface CategorySummary {
  slug: PrimaryCategorySlug;
  title: string;
  eyebrow: string;
  shortDescription: string;
  editorialIntro: string;
  featureProductId: string;
  landingHeroProductId: string;
  count: number;
}

export interface EditorialEdit {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  heroProductId: string;
  productIds: string[];
}

export interface BrandLogoMetadata {
  sourcePath: string;
  sourceActualFormat: string;
  publicWebpPath: string;
  publicPngPath: string;
  width: number;
  height: number;
  aspectRatio: number;
  sha256: string;
}

export interface BrandMetadata {
  name: string;
  tagline: string;
  factualPosition: string;
  instagramHandle: string;
  instagramUrl: string;
  relatedBoutiqueHandle: string;
  whatsappNumberDisplay: string;
  whatsappNumberRaw: string;
  whatsappUrl: string;
  additionalPhones: string[];
  landlines: string[];
  cityState: string;
  provisionalAddressNote: string;
  logo: BrandLogoMetadata;
}

export interface CatalogData {
  generatedAt: string;
  brand: BrandMetadata;
  counts: {
    totalArchiveRecords: number;
    approvedProducts: number;
    sareesCount: number;
    dressMaterialsCount: number;
    fabricsCount: number;
    quarantinedCount: number;
    referenceOnlyCount: number;
  };
  heroShortlist: Array<{
    productId: string;
    role: string;
    note: string;
  }>;
  categories: CategorySummary[];
  editorialEdits: EditorialEdit[];
  products: Product[];
}

export interface CartLine {
  productId: string;
  quantity: number;
  addedAt: number;
}

export interface HydratedCartLine {
  product: Product;
  quantity: number;
  lineTotalInr: number;
  lineTotalPaise: number;
  lineTotalFormatted: string;
}

export interface FilterState {
  query?: string;
  category?: PrimaryCategorySlug | 'all';
  editSlug?: string | null;
  fabrics?: FabricFacet[];
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: SortOption;
}

export interface DemoCheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  notes: string;
}

export interface DemoContactForm {
  name: string;
  contact: string;
  subject: string;
  productCode: string;
  message: string;
}

