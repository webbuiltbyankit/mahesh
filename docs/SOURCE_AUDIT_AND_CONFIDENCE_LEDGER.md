# Mahesh Designers — Source Audit, Data Confidence Ledger & Phase 01 Foundations
*(Covers Sequential Prompts 001–019)*

## Prompt 001: Inspect the Delivered Archive (Source Audit)

### 1. Archive Provenance &Observed vs. Inferred Data
- **Primary Source:** `/Users/taklatvs/Desktop/maheshhh` (`MASTER_INDEX.md`, `profile/business_info.md`, `profile/profile.json`, `products/products.json`, `products/react_vite_catalog.json`, `reports/extraction_report.md`, `reports/verification_summary.json`).
- **Not an Authenticated Instagram Export:** `reports/extraction_report.md` explicitly records that live Instagram GraphQL (`web_profile_info`) and `/embed/` returned `HTTP 401 Unauthorized` without login bypass. Therefore, `follower_count`, `following_count`, `posts_count`, live biography string, Reels (`0`), and Story Highlights (`1` cover only) were inaccessible and are strictly `null`.
- **Observed Data (Verified in Archive):**
  - **Brand Identity:** Mahesh Designers (`@maheshdesigners_online_`, related boutique handle `@_mahesh_designers_`), based in Tirupur, Tamil Nadu, India.
  - **Brand Mark:** `profile/profile_picture/maheshdesigners_online__brand_logo.png` (36,294 bytes; actual binary header is `WEBP`, featuring the circular purple-and-gold `MD` dress-form monogram and `MAHESH DESIGNERS` wordmark).
  - **Contact Channels:** Primary WhatsApp ordering number `+91 79049 57928` (`https://wa.me/917904957928`), additional mobile numbers (`+91 96299 13107`, `+91 99408 91503`, `+91 99949 31449`), landlines (`0421-4250841`, `0421-4261154`), Instagram URL (`https://www.instagram.com/maheshdesigners_online_/`).
  - **Catalog & Media:** 69 structured records (`MD-PROD-001` to `MD-PROD-069`), 64 single-post cover images (`posts/images/`), and 250 carousel images across 62 carousel folders (`carousels/`), totaling 316 verified local media binaries with 0 corrupted files.
- **Questionable / Conflicting Fields Flagged for Guardrails:**
  1. **Conflicting Postal Codes:** `profile/business_info.md` and `profile/profile.json` list `#12/1, Thanisha Complex, Municipal Office Road Cross Street... Tirupur, Tamil Nadu - 641604 / 641602`. Because `641604` and `641602` conflict, customer-facing demo surfaces must show **`Tirupur, Tamil Nadu`** (and mark the full street/PIN as pending owner confirmation).
  2. **Overlapping Raw Category Tags:** Keyword extraction tagged almost every saree with `"Running Fabric / Material"` (because captions mention the word `"fabric"` or `"material"`) and tagged sarees like `MD-PROD-024`, `026`, `032`, `048` with `"Bridal / Designer Blouse"`. However, each record's `original_caption` contains an explicit `Category: saree`, `Category: Chudithar Material`, or `Category: fabric` line that cleanly resolves the primary category.
  3. **Spurious Size Values:** Five records (`MD-PROD-004`, `014`, `051`, `053`, etc.) have `"sizes": ["s"]` due to substring matching in scraped metadata. Sarees and unstitched materials do not use `S/M/L` apparel sizing; all spurious size arrays are omitted from customer UI.
  4. **File Extension vs. Binary Format Mismatch:** Many `.jpg` and `.png` files in `posts/images/`, `carousels/`, and `profile_picture/` are actually `WEBP`-encoded binaries (`RIFF....WEBP`). Our asset pipeline inspects magic bytes and generates true optimized WebP/PNG outputs in `public/assets/`.
  5. **Cover vs. Carousel Slide 01 Duplication:** For all 62 products with carousels, `posts/images/<slug>.jpg` has the exact same SHA-256 hash as `carousels/<slug>/<slug>_slide_01.jpg` (62 duplicate SHA-256 groups). Product galleries deduplicate `slide_01` against the cover so every gallery shows only unique frames (typically 4 unique shots per product).

---

## Prompt 002: Identify the Actual Customer & Shopping Journeys

### Primary Visitor Persona
- **Profile:** A discerning shopper looking for sarees, unstitched salwar/chudithar dress materials, or running fabrics for festive occasions, family celebrations, or everyday ethnic wear—most likely arriving from Instagram (`@maheshdesigners_online_`) on a smartphone (`390px` viewport) or laptop (`1440px`).
- **Priorities:**
  1. Inspect authentic textile photography (weave, zari border, pallu, and paired unstitched sets) without visual clutter.
  2. Immediately understand factual INR prices, fabric families, and product SKU codes.
  3. Save favorites, assemble a shopping bag for comparison, or send a prefilled WhatsApp inquiry (`+91 79049 57928`) to the boutique without being forced into accounts or complicated flows.

### Three Core Shopping Journeys
1. **Curated Category Discovery -> Bag -> Demo Checkout:**
   `Home (/)` → `Sarees (/collections/sarees)` → Filter by `Banarasi` or `Tussar` → `Tussar Banaras Saree (MD-PROD-001)` → Inspect 4 deduplicated gallery frames → `Add to Bag` → `Bag (/bag)` → `Demo Checkout (/checkout-demo)` → Preview non-transactional summary.
2. **Instagram Code / Fabric Lookup -> Direct WhatsApp Inquiry:**
   `Home (/)` → `Search (/search?q=SKU052MAUVAPUR` or `Chanderi)` → Open `Mul Chanderi Pearl & Thread Work (MD-PROD-060)` → Click `Enquire on WhatsApp` with prefilled product name, price (`₹1,895`), and code (`SKU007MUSYEL`).
3. **Wishlist Comparison Across Categories:**
   Browse `Sarees` and `Dress Materials` → Save `MD-PROD-036 (Soft Banarasi)` and `MD-PROD-063 (Fancy Chanderi Thread & Mirror Work)` to `Wishlist (/wishlist)` → Compare side-by-side in browser-local storage → Move chosen piece to Bag.

---

## Prompt 003: One-Sentence Brand Position
- **Factual Brand Position:** *Mahesh Designers is a Tirupur-based saree, unstitched dress-material, and running-fabric boutique offering a curated selection of Banarasi, Tussar, Chanderi, cotton, and silk textiles.*
- **Creative Direction Tagline (Editorial Expression, Not a Factual Claim):** *An elegant edit of sarees and fabrics.*

---

## Prompt 004: Establish the Demo-Only Boundary
- This repository is a **client-facing frontend design concept and interactive prototype**, not a live order-taking commercial store.
- **Strict Exclusions:** No backend server, no database, no user authentication/login, no real payment gateway (no UPI/card/COD collection), no live inventory reservation, no outbound form submission APIs, and no admin/ERP panels.
- All bag, wishlist, search, filter, and checkout-preview interactions run 100% locally in the browser with clear demo disclosures.

---

## Prompts 005 & 006: Audit of All 69 Catalog Records & Quarantine Registry

| Classification | Count | Product IDs | Handling Rule |
| :--- | :--- | :--- | :--- |
| **Approved Photographed Retail Products** | **62** | `MD-PROD-001`–`040`, `042`–`043`, `045`–`057`, `059`–`065` | Included in customer-facing collections, search, and featured grids with deduplicated local media. |
| **Quarantined Incomplete / Test Entries** | **3** | `MD-PROD-041` (`Testing`, `₹9900.00`, 1 image, no category/SKU)<br>`MD-PROD-044` (`Wedding Collection Combo`, `₹1140.00`, 1 image, unverified combo metadata)<br>`MD-PROD-058` (`Cotton Fabric Thread Work`, `₹395.00`, **0 local images**, no SKU) | Excluded from all customer-facing grids, search results, and featured sections. Preserved in `src/data/quarantinedRecords.ts` for owner review. |
| **Public Collection Reference Records** | **4** | `MD-PROD-066` (`PUBLIC-REF-001`)<br>`MD-PROD-067` (`PUBLIC-REF-002`)<br>`MD-PROD-068` (`PUBLIC-REF-003`)<br>`MD-PROD-069` (`PUBLIC-REF-004`) | Non-purchasable public index references (`price: null`, `media_files: []`). Flagged as reference records only; never rendered as purchasable SKUs. |
| **Total Archive Records** | **69** | `MD-PROD-001` through `MD-PROD-069` | Raw `products/products.json` remains 100% unmodified. |

---

## Prompts 007 & 008: Image Families & Honest Overhead Flat-Lay Direction
- **Image Families Audited:**
  - `profile/profile_picture/maheshdesigners_online__brand_logo.png`: Genuine circular purple-and-gold MD monogram + wordmark.
  - `posts/images/*.jpg`: 64 primary cover images (62 approved + `MD-PROD-041` + `MD-PROD-044`).
  - `carousels/<slug>/*_slide_01..04.jpg`: 250 carousel slides across 62 products. In all 62 cases, `slide_01` is byte-identical (same SHA-256) to the `posts/images/` cover and is deduplicated so product galleries show 3–4 unique frames (`cover`, `slide_02`, `slide_03`, `slide_04`).
  - `catalog_by_item/`: Convenient per-item copies (`MD-PROD-001` to `069`); kept as archival reference while `public/assets/products/` serves optimized responsive WebP variants.
- **Honest Photographic Direction:**
  - The archive photographs are **overhead flat-lay folded textiles** styled with marigold/rose petals, wooden trays, jewelry props, or hanger flat-lays—not fashion-model campaign portraits.
  - Our layout uses **contained editorial split panels**, balanced 4:5 / 3:4 frames, and careful `object-position` / `object-fit` rules so saree borders, zari pallus, and unstitched top/dupatta pairings remain intact without stretching or pretending model photography exists.

---

## Prompt 009: Data Confidence Ledger

| Field / Claim | Source Confidence | Evidence in ZIP | UI Presentation Rule |
| :--- | :--- | :--- | :--- |
| **Product ID (`MD-PROD-001`..`069`)** | `HIGH (Verified)` | `products/products.json` | Used for deterministic routing, asset keys, and audit traceability. |
| **Original Product Title** | `HIGH (Verified)` | `products/products.json` (`product_name`) | Preserved verbatim in data model (`sourceTitle`); normalized to clean Title Case in `displayTitle`. |
| **Product Code / SKU** | `HIGH (Where Present)` | `products/products.json` (`product_code`) | 59 of 62 approved products have exact SKUs (e.g., `SKU052MAUVAPUR`). 3 approved items (`MD-PROD-013`, `065`, and `047`/`051` sharing `SKU008`) handle null or shared codes gracefully. Omit code row when `null`. |
| **Price (INR)** | `HIGH (Verified)` | `products/products.json` (`price`) | Formatted in `en-IN` INR (`₹2,795`). No fake MRP strikethroughs or discount badges. |
| **Fabric / Material Unit (Metres vs. Piece)** | `UNVERIFIED (Owner Confirmation Needed)` | Not specified for `MD-PROD-049` (`₹545`) or `MD-PROD-050` (`₹595`) | Display discreet *"Confirm unit / length with boutique"* note on Fabrics; never assume per-metre pricing. |
| **Primary Merchandise Category** | `HIGH (Verified via Caption)` | `original_caption` (`Category: saree` / `Chudithar Material` / `fabric`) | Mapped cleanly to **Sarees** (52), **Dress Materials** (8), and **Fabrics** (2). |
| **Fabric Family Tags** | `MEDIUM-HIGH (Verified from Title & Caption)` | `fabrics_materials` + `product_name` | Normalized into 8 source-backed facets: `Banarasi`, `Tussar`, `Chanderi`, `Cotton`, `Silk`, `Tissue`, `Linen`, `Organza`, `Muslin`, `Jute`. Never claim `"100% pure"` certification. |
| **Colors** | `LOW (Sparse in Source)` | `colors` non-null on only 13 of 62 items | Stored as optional metadata; omitted as a mandatory filter facet so shoppers are never misled by incomplete color tags. |
| **Sizes / Variants / Stock Counts** | `UNAVAILABLE` | `sizes` is `null` or spurious `["s"]`; no stock counts | No apparel size selectors (`XS–XXL`), no stock counters (`"Only 2 left"`). |
| **WhatsApp & Instagram Contacts** | `HIGH (Verified)` | `+91 79049 57928`, `@maheshdesigners_online_` | Linked directly with clear external-link cues. |
| **Street Address & Postal Code** | `CONFLICTING PIN (641604 vs 641602)` | `profile/business_info.md` | Show **`Tirupur, Tamil Nadu`** in public UI; note full street/PIN in owner confirmation checklist. |
| **Shipping, Returns, Taxes, Care** | `UNVERIFIED (Owner Confirmation Needed)` | `delivery_details: null` | Explicitly stated as requiring boutique confirmation; no invented return windows, free-shipping promises, or wash instructions. |

---

## Prompt 010: Clean Naming Without Changing Identity
- Preserve `sourceTitle` (e.g., `"ORAGANZA SAREE"`, `"BANARASHI TUSSAR SAREE"`, `"JAMDANI CHANDERI SAREE 40"`, `"kotta doria"`, `"TREAD WORK MUSLIN FABRIC"`, `"MUL CHANDERI PEARL& THREAD WORK"`) and `productCode` untouched in every product record.
- Format `displayTitle` cleanly for editorial legibility:
  - `"ORAGANZA SAREE"` → `"Organza Saree"` (retaining raw `"ORAGANZA SAREE"` in source metadata)
  - `"BANARASHI TUSSAR SAREE"` → `"Banarasi Tussar Saree"`
  - `"JAMDANI CHANDERI SAREE 40"` → `"Jamdani Chanderi Saree"`
  - `"kotta doria"` → `"Kota Doria Saree"`
  - `"kalamkari cotton"` → `"Kalamkari Cotton Saree"`
  - `"TREAD WORK MUSLIN FABRIC"` → `"Thread Work Muslin Dress Material"` (with raw title preserved)
  - `"MUL CHANDERI PEARL& THREAD WORK"` → `"Mul Chanderi Pearl & Thread Work"`
  - Where multiple items share the same base title (e.g., three `"Banarasi Tussar Saree"` or four `"Zari Cotton Saree"`), each has a deterministic unique slug (`banarasi-tussar-saree-md-prod-003`, `banarasi-tussar-saree-md-prod-004`) and displays its distinct SKU (`SKU050BLU`, `SKU049VIO`) so identity is unmistakable.

---

## Prompt 011: Supportable First-Level Categories
1. **Sarees (`/collections/sarees`)** — 52 photographed sarees across Banarasi, Tussar, Chanderi, Soft Tissue, Organza, Kota, Jamdani, Jute, and Cotton weaves.
2. **Dress Materials (`/collections/dress-materials`)** — 8 photographed unstitched salwar/chudithar material sets (`MD-PROD-051`, `059`, `060`, `061`, `062`, `063`, `064`, `065`) featuring Mul Chanderi, Vichitra Silk, Muslin Cotton, and Semi Rawsilk with pearl, mirror, zari, and thread work.
3. **Fabrics (`/collections/fabrics`)** — 2 photographed running/craft fabric entries (`MD-PROD-049` Banaras Fabric and `MD-PROD-050` Sana Silk Fabric), with unit/measurement clearly marked for boutique confirmation.

---

## Prompts 012–019: Journey, Restraint Test, Route Architecture & Benchmarks

### Minimum Viable Journey (Prompt 012)
`Home (/)` → `Collection (/collections, /collections/:category)` → `Product (/products/:slug)` → `Bag (/bag)` → `Demo Checkout (/checkout-demo)`, supported by `Search (/search)`, `Wishlist (/wishlist)`, and optional `WhatsApp Enquiry`.

### Luxury Restraint Test (Prompt 013)
- **Rejected:** Dense deal strips, popups, blinking offers, auto-scrolling tickers, mega-menu clutter, fake discount badges, star ratings, and loud gradients.
- **Enforced:** One dominant message per section, generous warm-ivory (`#F8F6F1`) negative space around textile photography, and a single primary plum (`#4C205A`) CTA per view.

### Planned Site Routes (Prompt 014)
| Route | Customer Purpose |
| :--- | :--- |
| `/` | Editorial homepage: split hero (`MD-PROD-001`), 3 category introductions, Selected Sarees, Vichitra Silk editorial story, Chanderi Edit, Occasion capsule, Fabric exploration strip, and Boutique WhatsApp assistance. |
| `/collections` | Calm "Shop All" gateway introducing Sarees, Dress Materials, and Fabrics alongside curated fabric edits and full filterable catalog. |
| `/collections/sarees` | Dedicated Sarees landing with editorial intro (`MD-PROD-004` / `036`) and 52 filterable sarees. |
| `/collections/dress-materials` | Dedicated Unstitched Dress Materials landing (`MD-PROD-060` / `063`) and 8 material sets. |
| `/collections/fabrics` | Dedicated Fabrics landing (`MD-PROD-049` / `050`) with transparent unit-confirmation note. |
| `/products/:slug` | Spacious split Product Detail Page (PDP) with deduplicated thumbnail gallery, lightbox zoom, factual price, SKU code, source-backed fabric details, quantity stepper (1–10), Add to Bag, and prefilled WhatsApp enquiry. |
| `/search` | Minimal instant search across titles, source names, SKUs, categories, and confirmed fabrics with facet filtering. |
| `/wishlist` | Browser-local saved items grid with immediate remove and product navigation. |
| `/bag` | Calm browser-local shopping bag with quantity editing (1–10), factual INR subtotal, and clear demo-checkout disclosure. |
| `/checkout-demo` | Non-transactional checkout walkthrough & receipt-style `DEMO PREVIEW` summary with optional WhatsApp inquiry handoff. |
| `/our-story` | Factual, understated editorial story of Mahesh Designers in Tirupur illustrated with authentic archive detail photography. |
| `/contact` | Minimalist contact page featuring verified WhatsApp (`+91 79049 57928`), Instagram (`@maheshdesigners_online_`), Tirupur location note, and local-only message preview form. |
| `/policies` | Transparent policy overview & FAQ explaining that shipping, returns, measurements, and care require boutique confirmation prior to live launch. |
| `*` (404) | Warm, helpful not-found state with direct paths back to Shop All and Sarees. |

### Content Truth Rules & Product-Specific Proof (Prompts 015 & 016)
- Zero claims of same-day delivery, guaranteed handloom/silk mark certification, limited stock urgency, free shipping, discounts, customer counts, or verified reviews.
- Product cards prioritize the real textile photograph (occupying >75% of card area), clean title, factual INR price, verified fabric badge/subtitle, and subtle wishlist heart.

### Baseline Visual References & Four-Width Review Checklist (Prompts 017 & 018)
- **Color Tokens:** Warm Ivory (`#F8F6F1`), Paper (`#FFFEFA`), Deep Ink (`#241C24`), Muted Charcoal (`#5C534E`), Rich Plum (`#4C205A`), Warm Taupe (`#B5A99C`), Muted Gold (`#B99B63`).
- **Review Widths:**
  - `1440px` (Wide Desktop): 1320px max container, 4-column product grid, 58%/42% split PDP.
  - `1024px` (Laptop): Balanced 3-column product grid, comfortable split hero and PDP.
  - `768px` (Tablet): 2-column product grid, composed stacked/split transitions, touch-friendly controls.
  - `390px` & `360px` (Mobile Smartphone): 2-column product cards with generous breathing room, thumb-friendly 44px tap targets, focus-managed navigation and filter sheets, zero horizontal overflow.

### Working Demo Scope Agreement (Prompt 019)
- Route navigation, query-synced filtering, sorting, instant search, lightbox gallery, localStorage wishlist & bag persistence, inline checkout form validation, and `DEMO PREVIEW` order summary all function interactively in the browser.

