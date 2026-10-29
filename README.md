# Mahesh Designers — Luxury Editorial E-Commerce Frontend Demo

Customer-facing, browser-only luxury e-commerce frontend concept for **Mahesh Designers** (`@maheshdesigners_online_` · Tirupur, Tamil Nadu), built according to the **300 Sequential Frontend Demo Prompts** specification.

---

## 1. Quick Start & Commands

```bash
# Start local development server (http://127.0.0.1:5173)
npm run dev

# Run TypeScript strict type-checking
npm run typecheck

# Build production bundle into dist/
npm run build

# Preview production build locally (http://127.0.0.1:4173)
npm run preview

# Verify all 62 approved products, deduplicated galleries & 744 image variants
npm run audit:assets

# Run automated QA & functional smoke test suite
npm run test:qa
```

---

## 2. Catalog & Data Truth Summary

- **Raw Archive Preserved:** `products/products.json` (`69` records) remains completely untouched.
- **Approved Retail Catalog (`62` Products in `src/data/catalog.json`):**
  - **Sarees (`/collections/sarees`):** `52` approved pieces
  - **Unstitched Dress Materials (`/collections/dress-materials`):** `8` approved sets (`MD-PROD-051`, `059`, `060`, `061`, `062`, `063`, `064`, `065`)
  - **Select Running Fabrics (`/collections/fabrics`):** `2` approved pieces (`MD-PROD-049` Banaras Fabric `₹545`, `MD-PROD-050` Sana Silk Fabric `₹595`)
- **Excluded Records (`src/data/quarantined_and_reference_records.json`):**
  - **Quarantined (`3`):** `MD-PROD-041` (`Testing`, `₹9900.00`), `MD-PROD-044` (`Wedding Collection Combo`, `₹1140.00`), and `MD-PROD-058` (`Cotton Fabric Thread Work`, `₹395.00`, `0` local images).
  - **Reference-Only (`4`):** `MD-PROD-066` through `MD-PROD-069` (public showcase posts without individual prices or SKU codes).
- **Gallery Deduplication & Image Optimization:**
  - All `62` SHA-256 duplicate `slide_01` carousel files (identical to `cover`) were automatically deduplicated during normalization so each product gallery displays only unique angles (`cover`, `slide_02`, `slide_03`, `slide_04`).
  - `744` responsive image derivatives (`420px` `_sm.jpg`, `840px` `_card.jpg`, `1440px` `_lg.jpg`) + format-verified brand logo (`public/assets/brand/mahesh-designers-logo.webp` & `.png`) are generated in `public/assets/`.

---

## 3. Route Map

| Route | Purpose |
| :--- | :--- |
| `/` | Editorial Homepage (Hero `MD-PROD-001`, 3 Category Tiles, Selected Sarees, `MD-PROD-051` Dress Material Story, `MD-PROD-063` Texture Study, Chanderi Edit, Occasion Capsule, Fabrics Strip, WhatsApp Concierge) |
| `/collections` | Complete 62-piece Catalog Gateway with Curated Edits, Fabric Facets, Price Range & Sort |
| `/collections/sarees` | Dedicated 52-piece Sarees Landing Page (Hero `MD-PROD-004`) |
| `/collections/dress-materials` | Dedicated 8-piece Unstitched Dress Materials Landing Page (Hero `MD-PROD-060`) |
| `/collections/fabrics` | Dedicated 2-piece Select Fabrics Landing Page (Hero `MD-PROD-049`) |
| `/products/:slug` | Product Detail Page with Deduplicated Gallery, Full-Screen Lightbox, Copyable SKU, Quantity Stepper, Add to Bag, Wishlist & Prefilled WhatsApp Inquiry |
| `/search` | Instant Search across Titles, SKUs, Weaves & Gentle Spelling Synonyms (`?q=`) |
| `/wishlist` | Browser-Local Saved Wishlist (`localStorage`) |
| `/bag` | Browser-Local Shopping Bag with Exact Integer Paise Subtotal & WhatsApp Handoff |
| `/checkout-demo` | Non-Transactional Concept Preview Checkout (In-Memory Form + Printable Receipt Preview) |
| `/our-story` | Factual Brand & Textile Craft Story (`Tirupur, Tamil Nadu`) |
| `/contact` | Verified WhatsApp (`+91 79049 57928`), Instagram (`@maheshdesigners_online_`) & Demo Enquiry Composer |
| `/policies` | Transparent Pricing, Sizing, Dispatch & Demo Boundary Notes |
| `*` | Branded 404 Recovery Page |

---

## 4. Documentation Index

- [`docs/SOURCE_AUDIT_AND_CONFIDENCE_LEDGER.md`](docs/SOURCE_AUDIT_AND_CONFIDENCE_LEDGER.md) — Phase 1 Source Audit, Quarantine Ledger & Data Confidence Matrix (Prompts 001–019)
- [`docs/CREATIVE_BRIEF.md`](docs/CREATIVE_BRIEF.md) — Editorial Luxury Direction, Palette & Typography Brief (Prompt 020)
- [`docs/QA_AND_HANDOVER_REPORT.md`](docs/QA_AND_HANDOVER_REPORT.md) — Accessibility & Performance Audit, Client Walkthrough Script, Known Assumptions & Next-Stage Roadmap (Prompts 280–300)

