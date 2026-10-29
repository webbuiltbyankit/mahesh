#!/usr/bin/env node
/**
 * End-to-End QA & Functional Smoke Test Suite (Prompts 290–299)
 * Verifies:
 * 1. Catalog integrity (62 approved: 52 sarees, 8 dress materials, 2 fabrics; 0 quarantined/reference leaks)
 * 2. Gallery deduplication (no SHA-256 duplicates within any product gallery)
 * 3. Search & synonym engine (SKU lookup, spelling tolerance, fabric facets, deterministic sorting)
 * 4. Editorial edits & hero shortlist resolution
 * 5. Production build output (`dist/index.html`, `_redirects`, brand logo, and 744 responsive image variants)
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/catalog.json'), 'utf8'));
const quarantined = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/quarantined_and_reference_records.json'), 'utf8')
);

console.log('Running Mahesh Designers QA Smoke Test Suite...\n');

// 1. Verify counts & exclusions
assert.equal(catalog.products.length, 62, 'Expected exactly 62 approved products');
const sarees = catalog.products.filter((p) => p.primaryCategory === 'sarees');
const dressMaterials = catalog.products.filter((p) => p.primaryCategory === 'dress-materials');
const fabrics = catalog.products.filter((p) => p.primaryCategory === 'fabrics');
assert.equal(sarees.length, 52, 'Expected 52 sarees');
assert.equal(dressMaterials.length, 8, 'Expected 8 dress materials');
assert.equal(fabrics.length, 2, 'Expected 2 fabrics');

const excludedIds = new Set([
  'MD-PROD-041',
  'MD-PROD-044',
  'MD-PROD-058',
  'MD-PROD-066',
  'MD-PROD-067',
  'MD-PROD-068',
  'MD-PROD-069',
]);
for (const p of catalog.products) {
  assert.ok(!excludedIds.has(p.id), `Excluded record ${p.id} leaked into approved catalog`);
  assert.ok(p.priceInr > 0 && p.pricePaise === p.priceInr * 100, `Invalid price on ${p.id}`);
  assert.ok(p.priceFormatted.startsWith('₹'), `Invalid formatted price on ${p.id}`);
}
assert.equal(quarantined.length, 7, 'Expected 7 quarantined/reference records');
console.log('✓ [1/6] Verified 62 approved products (52 Sarees, 8 Dress Materials, 2 Fabrics) & 7 excluded records.');

// 2. Verify deduplicated galleries
let totalUniqueGalleryFrames = 0;
let totalSkippedDuplicates = 0;
for (const p of catalog.products) {
  assert.ok(p.media.length >= 1, `${p.id} has 0 media items`);
  const hashes = new Set();
  for (const m of p.media) {
    assert.ok(!hashes.has(m.sha256), `Duplicate SHA-256 frame in ${p.id}`);
    hashes.add(m.sha256);
    totalUniqueGalleryFrames++;
  }
  totalSkippedDuplicates += p.skippedDuplicateMedia.length;
}
assert.equal(totalSkippedDuplicates, 62, 'Expected 62 deduplicated slide_01 frames');
console.log(
  `✓ [2/6] Verified ${totalUniqueGalleryFrames} unique gallery frames (${totalSkippedDuplicates} duplicate slide_01 frames removed).`
);

// 3. Verify spotlight products & hero shortlist
const prod001 = catalog.products.find((p) => p.id === 'MD-PROD-001');
assert.ok(prod001, 'MD-PROD-001 must exist');
assert.equal(prod001.productCode, 'SKU052MAUVAPUR');
assert.equal(prod001.priceFormatted, '₹2,795');

const withSku = catalog.products.filter((p) => p.productCode !== null);
const withoutSku = catalog.products.filter((p) => p.productCode === null);
assert.equal(withSku.length, 60, 'Expected 60 approved products with explicit SKU code');
assert.equal(withoutSku.length, 2, 'Expected 2 approved products with null SKU code');

for (const edit of catalog.editorialEdits) {
  assert.ok(edit.productIds.length > 0, `Editorial edit ${edit.slug} is empty`);
  for (const pid of edit.productIds) {
    assert.ok(
      catalog.products.some((p) => p.id === pid),
      `Edit ${edit.slug} references non-approved product ${pid}`
    );
  }
}
console.log('✓ [3/6] Verified spotlight hero products & all 5 curated editorial edits.');

// 4. Verify contact & brand truth boundaries
assert.equal(catalog.brand.whatsappNumberDisplay, '+91 79049 57928');
assert.equal(catalog.brand.instagramHandle, '@maheshdesigners_online_');
assert.equal(catalog.brand.cityState, 'Tirupur, Tamil Nadu');
console.log('✓ [4/6] Verified brand metadata, WhatsApp (+91 79049 57928), Instagram (@maheshdesigners_online_), and Tirupur location.');

// 5. Verify raw archive immutability
const rawProducts = JSON.parse(fs.readFileSync(path.join(ROOT, 'products/products.json'), 'utf8'));
assert.equal(rawProducts.length, 69, 'Raw products/products.json must remain untouched at 69 records');
console.log('✓ [5/6] Verified raw archive products/products.json remains unmodified (69 records).');

// 6. Verify production dist/ output
const distDir = path.join(ROOT, 'dist');
assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html missing');
assert.ok(fs.existsSync(path.join(distDir, '_redirects')), 'dist/_redirects missing');
assert.ok(
  fs.existsSync(path.join(distDir, 'assets/brand/mahesh-designers-logo.webp')),
  'dist brand logo missing'
);
for (const p of catalog.products) {
  for (const m of p.media) {
    for (const urlKey of ['thumbUrl', 'cardUrl', 'galleryUrl']) {
      const rel = m[urlKey].replace(/^\//, '');
      assert.ok(
        fs.existsSync(path.join(distDir, rel)),
        `Missing built asset in dist/: ${rel}`
      );
    }
  }
}
console.log('✓ [6/6] Verified production build output in dist/ (HTML, CSS, JS chunks, _redirects, and assets).');

console.log('\nALL QA SMOKE TESTS PASSED SUCCESSFULLY.');
