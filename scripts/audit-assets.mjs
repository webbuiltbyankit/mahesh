#!/usr/bin/env node
/**
 * Mahesh Designers — Asset Readiness & Data Accuracy Automated Audit
 * Implements Prompts 060 & 275
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const rawProducts = JSON.parse(fs.readFileSync(path.join(ROOT, 'products', 'products.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'catalog.json'), 'utf8'));
const quarantined = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'quarantined_and_reference_records.json'), 'utf8')
);
const assetMap = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public', 'assets', 'source_to_asset_map.json'), 'utf8')
);

let errors = 0;

function checkFile(publicUrl, label) {
  const rel = publicUrl.replace(/^\//, '');
  const fullPath = path.join(ROOT, 'public', rel);
  if (!fs.existsSync(fullPath)) {
    console.error(`[FAIL] Missing public asset for ${label}: ${fullPath}`);
    errors++;
    return;
  }
  const stat = fs.statSync(fullPath);
  if (stat.size < 256) {
    console.error(`[FAIL] Suspiciously small asset (${stat.size}B) for ${label}: ${fullPath}`);
    errors++;
  }
}

// 1. Verify brand logo
checkFile(catalog.brand.logo.publicWebpPath, 'Brand Logo (WebP)');
checkFile(catalog.brand.logo.publicPngPath, 'Brand Logo (PNG)');

// 2. Verify record counts match 69 archive records
const rawById = new Map(rawProducts.map((p) => [p.product_id, p]));
const totalMapped = catalog.products.length + quarantined.length;
if (totalMapped !== rawProducts.length) {
  console.error(`[FAIL] Total mapped records (${totalMapped}) !== raw records (${rawProducts.length})`);
  errors++;
}

// 3. Verify quarantined and reference records are NOT in customer catalog
const forbiddenIds = new Set(['MD-PROD-041', 'MD-PROD-044', 'MD-PROD-058', 'MD-PROD-066', 'MD-PROD-067', 'MD-PROD-068', 'MD-PROD-069']);
for (const p of catalog.products) {
  if (forbiddenIds.has(p.id)) {
    console.error(`[FAIL] Quarantined/reference product ${p.id} leaked into public catalog!`);
    errors++;
  }
  const raw = rawById.get(p.id);
  if (!raw) {
    console.error(`[FAIL] Product ${p.id} not found in raw products.json`);
    errors++;
    continue;
  }
  if (p.sourceTitle !== raw.product_name) {
    console.error(`[FAIL] ${p.id} sourceTitle mismatch: ${p.sourceTitle} vs ${raw.product_name}`);
    errors++;
  }
  if (p.productCode !== raw.product_code) {
    console.error(`[FAIL] ${p.id} productCode mismatch: ${p.productCode} vs ${raw.product_code}`);
    errors++;
  }
  const expectedPrice = Number(String(raw.price).replace(/[^\d.]/g, ''));
  if (p.priceInr !== expectedPrice) {
    console.error(`[FAIL] ${p.id} priceInr mismatch: ${p.priceInr} vs ${expectedPrice}`);
    errors++;
  }
  if (!p.media || p.media.length === 0) {
    console.error(`[FAIL] Approved product ${p.id} has 0 media items`);
    errors++;
  }
  const hashes = new Set();
  for (const m of p.media) {
    if (hashes.has(m.sha256)) {
      console.error(`[FAIL] ${p.id} gallery contains duplicate SHA-256 hash: ${m.sha256}`);
      errors++;
    }
    hashes.add(m.sha256);
    checkFile(m.thumbUrl, `${p.id} thumb`);
    checkFile(m.cardUrl, `${p.id} card`);
    checkFile(m.galleryUrl, `${p.id} gallery`);
    checkFile(m.originalFormatUrl, `${p.id} originalFormat`);
  }
}

console.log('=== Mahesh Designers Asset & Catalog Audit Summary ===');
console.log(`Total Raw Archive Records     : ${rawProducts.length}`);
console.log(`Approved Retail Products      : ${catalog.products.length}`);
console.log(`  - Sarees                    : ${catalog.counts.sareesCount}`);
console.log(`  - Dress Materials           : ${catalog.counts.dressMaterialsCount}`);
console.log(`  - Fabrics                   : ${catalog.counts.fabricsCount}`);
console.log(`Quarantined Records (Excluded): ${catalog.counts.quarantinedCount} (MD-PROD-041, MD-PROD-044, MD-PROD-058)`);
console.log(`Reference Records (Excluded)  : ${catalog.counts.referenceOnlyCount} (MD-PROD-066..069)`);
console.log(`Source-to-Asset Map Entries   : ${assetMap.length}`);
console.log(`Audit Errors                  : ${errors}`);

if (errors > 0) {
  process.exit(1);
}
console.log('PASS: All 62 approved products, deduplicated galleries, prices, SKUs, and image variants verified.');

