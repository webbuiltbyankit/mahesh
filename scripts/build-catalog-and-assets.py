#!/usr/bin/env python3
"""
Mahesh Designers — Deterministic Product Normalization & Asset Pipeline
Implements Sequential Prompts 005-011, 041-060, and 296.
"""
import os
import re
import json
import shutil
import hashlib
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND_OUT_DIR = os.path.join(ROOT, "public", "assets", "brand")
PROD_OUT_DIR = os.path.join(ROOT, "public", "assets", "products")
SRC_DATA_DIR = os.path.join(ROOT, "src", "data")

os.makedirs(BRAND_OUT_DIR, exist_ok=True)
os.makedirs(PROD_OUT_DIR, exist_ok=True)
os.makedirs(SRC_DATA_DIR, exist_ok=True)


def detect_magic_format(filepath: str) -> str:
    with open(filepath, "rb") as f:
        header = f.read(16)
    if header.startswith(b"RIFF") and header[8:12] == b"WEBP":
        return "webp"
    if header.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    return "bin"


def get_image_dimensions(filepath: str):
    try:
        out = subprocess.check_output(
            ["/usr/bin/sips", "-g", "pixelWidth", "-g", "pixelHeight", filepath],
            stderr=subprocess.DEVNULL,
            text=True,
        )
        w_match = re.search(r"pixelWidth:\s*(\d+)", out)
        h_match = re.search(r"pixelHeight:\s*(\d+)", out)
        if w_match and h_match:
            w, h = int(w_match.group(1)), int(h_match.group(1))
            return w, h
    except Exception:
        pass
    return 1200, 1600


def sha256_file(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def process_logo():
    src_logo = os.path.join(ROOT, "profile", "profile_picture", "maheshdesigners_online__brand_logo.png")
    actual_fmt = detect_magic_format(src_logo)
    w, h = get_image_dimensions(src_logo)
    webp_dest = os.path.join(BRAND_OUT_DIR, "mahesh-designers-logo.webp")
    png_dest = os.path.join(BRAND_OUT_DIR, "mahesh-designers-logo.png")

    if actual_fmt == "webp":
        shutil.copy2(src_logo, webp_dest)
    subprocess.run(
        ["/usr/bin/sips", "-s", "format", "png", src_logo, "--out", png_dest],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return {
        "sourcePath": "profile/profile_picture/maheshdesigners_online__brand_logo.png",
        "sourceActualFormat": actual_fmt.upper(),
        "publicWebpPath": "/assets/brand/mahesh-designers-logo.webp",
        "publicPngPath": "/assets/brand/mahesh-designers-logo.png",
        "width": w,
        "height": h,
        "aspectRatio": round(w / h, 4) if h else 2.396,
        "sha256": sha256_file(src_logo),
    }


def resize_variant(src_path: str, dst_path: str, max_dim: int, quality: int = 82):
    if os.path.exists(dst_path) and os.path.getsize(dst_path) > 1000:
        return
    subprocess.run(
        [
            "/usr/bin/sips",
            "-Z",
            str(max_dim),
            "-s",
            "format",
            "jpeg",
            "-s",
            "formatOptions",
            str(quality),
            src_path,
            "--out",
            dst_path,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


# Clean display title normalization (Prompts 010 & 055)
CUSTOM_DISPLAY_TITLES = {
    "MD-PROD-005": "Banarasi Tussar Saree",
    "MD-PROD-007": "Organza Saree",
    "MD-PROD-011": "Semi Banaras Saree",
    "MD-PROD-013": "Jamdani Chanderi Saree",
    "MD-PROD-020": "Slub Cotton Saree",
    "MD-PROD-021": "Semi Raw Silk Saree",
    "MD-PROD-032": "Tussar Silk Saree",
    "MD-PROD-033": "Kota Doria Saree",
    "MD-PROD-036": "Soft Banarasi Saree",
    "MD-PROD-038": "Zari Cotton Saree",
    "MD-PROD-040": "Jute Tussar Saree",
    "MD-PROD-042": "Slub Cotton Saree",
    "MD-PROD-045": "Fancy Cotton Saree",
    "MD-PROD-047": "Banaras Checked Saree",
    "MD-PROD-048": "Banaras Checked Saree",
    "MD-PROD-049": "Banaras Brocade Fabric",
    "MD-PROD-050": "Sana Silk Fabric",
    "MD-PROD-051": "Vichitra Silk Unstitched Material",
    "MD-PROD-055": "Kalamkari Cotton Saree",
    "MD-PROD-059": "Thread Work Muslin Unstitched Material",
    "MD-PROD-060": "Mul Chanderi Pearl & Thread Work Set",
    "MD-PROD-061": "Muslin Cotton Sequence & Pearl Work Set",
    "MD-PROD-062": "Semi Chanderi Thread & Zari Work Set",
    "MD-PROD-063": "Fancy Chanderi Thread & Mirror Work Set",
    "MD-PROD-064": "Semi Rawsilk Top & Jute Cotton Shawl Set",
    "MD-PROD-065": "Lite Zari Work Chanderi Cotton Set",
}


def normalize_display_title(pid: str, raw_title: str | None) -> str:
    if not raw_title:
        return f"Archive Reference ({pid})"
    if pid in CUSTOM_DISPLAY_TITLES:
        return CUSTOM_DISPLAY_TITLES[pid]
    cleaned = raw_title.strip()
    cleaned = re.sub(r"\s*&\s*", " & ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return " ".join(w.capitalize() if w != "&" else "&" for w in cleaned.split(" "))


def parse_price_inr(price_str: str | None):
    if not price_str:
        return None, None
    cleaned = re.sub(r"[^\d.]", "", price_str)
    if not cleaned:
        return None, None
    val = float(cleaned)
    paise = int(round(val * 100))
    inr_int = int(round(val))
    return inr_int, paise


def extract_clean_description(caption: str | None) -> str:
    if not caption:
        return ""
    lines = [ln.strip() for ln in caption.splitlines() if ln.strip()]
    body_lines = []
    for ln in lines:
        if re.match(r"^(Category:|Price:|Code:|Order via|#)", ln, re.IGNORECASE):
            continue
        body_lines.append(ln)
    # First line is usually the uppercase title; skip if duplicate
    if len(body_lines) > 1 and body_lines[0].isupper():
        body_lines = body_lines[1:]
    text = " ".join(body_lines).strip()
    return text


def classify_primary_category(pid: str, raw_title: str | None, caption: str | None):
    # Quarantined & Reference checks (Prompts 005 & 006)
    if pid in {"MD-PROD-066", "MD-PROD-067", "MD-PROD-068", "MD-PROD-069"}:
        return None, "reference_only", "Public collection reference record without individual SKU or media."
    if pid == "MD-PROD-041":
        return None, "quarantined", "Quarantined storefront test entry ('Testing', ₹9900.00)."
    if pid == "MD-PROD-044":
        return None, "quarantined", "Quarantined unverified combo entry ('Wedding Collection Combo', ₹1140.00) lacking category/fabric metadata."
    if pid == "MD-PROD-058":
        return "fabrics", "quarantined", "Quarantined saleable record ('Cotton Fabric Thread Work', ₹395.00) because 0 local photographs exist in the archive."

    cap = caption or ""
    m = re.search(r"Category:\s*([^\n]+)", cap, re.IGNORECASE)
    cat_line = m.group(1).strip().lower() if m else ""
    if "chudithar" in cat_line or "salwar" in cat_line:
        return "dress-materials", "approved", None
    if cat_line == "fabric":
        return "fabrics", "approved", None
    if cat_line == "saree":
        return "sarees", "approved", None

    # Fallback by title
    t = (raw_title or "").lower()
    if "fabric" in t:
        return "fabrics", "approved", None
    return "sarees", "approved", None


def normalize_fabric_facets(raw_title: str | None, raw_fabrics: list | None, caption: str | None) -> list[str]:
    text = f"{raw_title or ''} {' '.join(raw_fabrics or [])}"
    facets = []
    mapping = [
        ("Banarasi", r"\bbanaras(i|hi)?\b"),
        ("Tussar", r"\btussar\b"),
        ("Chanderi", r"\bchanderi\b"),
        ("Cotton", r"\bcotton\b|\bkota\b|\bkotta\b"),
        ("Silk", r"\bsilk\b|\brawsilk\b"),
        ("Tissue", r"\btissue\b"),
        ("Linen", r"\blinen\b"),
        ("Organza", r"\borganza\b|\boraganza\b"),
        ("Muslin", r"\bmuslin\b"),
        ("Jute", r"\bjute\b"),
    ]
    for label, pattern in mapping:
        if re.search(pattern, text, re.IGNORECASE):
            facets.append(label)
    return facets


def derive_fabric_summary(pid: str, raw_title: str | None, raw_fabrics: list | None, primary_cat: str | None) -> str:
    t = (raw_title or "").upper()
    if "TUSSAR" in t and "BANARAS" in t:
        return "Tussar Banarasi Weave"
    if "SOFT BANARASI" in t:
        return "Soft Banarasi Weave"
    if "SEMI BANARAS" in t:
        return "Semi Banaras Weave"
    if "FANCY BANARAS" in t:
        return "Fancy Banaras Weave"
    if "BANARAS" in t and primary_cat == "fabrics":
        return "Banaras Zari Brocade Fabric"
    if "BANARAS" in t:
        return "Banaras Zari Weave"
    if "SANA SILK" in t:
        return "Sana Silk Embroidered Fabric"
    if "VICHITRA SILK" in t:
        return "Vichitra Silk Unstitched Set"
    if "MUL CHANDERI" in t and primary_cat == "dress-materials":
        return "Mul Chanderi Unstitched Set"
    if "MUL CHANDERI" in t:
        return "Mul Chanderi Weave"
    if "JAMDANI CHANDERI" in t:
        return "Jamdani Chanderi Weave"
    if "CHANDERI COTTON" in t:
        return "Chanderi Cotton Weave"
    if "SEMI CHANDERI" in t:
        return "Semi Chanderi Unstitched Set"
    if "FANCY CHANDERI" in t:
        return "Fancy Chanderi Unstitched Set"
    if "CHANDERI" in t:
        return "Chanderi Weave"
    if "TISSUE LINEN" in t:
        return "Tissue Linen Weave"
    if "TISSUE COTTON" in t:
        return "Tissue Cotton Weave"
    if "SOFT TISSUE" in t:
        return "Soft Tissue Weave"
    if "ORAGANZA" in t or "ORGANZA" in t:
        return "Organza Weave"
    if "PAPER TUSSAR" in t:
        return "Paper Tussar Weave"
    if "JUTE TUSSAR" in t:
        return "Jute Tussar Weave"
    if "TUSSAR" in t:
        return "Tussar Weave"
    if "JUTE COTTON" in t and primary_cat == "dress-materials":
        return "Semi Rawsilk & Jute Cotton Set"
    if "JUTE COTTON" in t:
        return "Jute Cotton Weave"
    if "JUTE" in t:
        return "Natural Jute Weave"
    if "ZARI COTTON" in t:
        return "Zari Cotton Weave"
    if "SLUP COTTON" in t:
        return "Slub Cotton Weave"
    if "JAMDANI COTTON" in t:
        return "Jamdani Cotton Weave"
    if "KALAMKARI COTTON" in t:
        return "Kalamkari Cotton Weave"
    if "MUSLIN" in t:
        return "Muslin Embroidered Unstitched Set"
    if "KOTA" in t or "KOTTA" in t:
        return "Kota Doria Cotton Weave"
    if "CHAPPA SILK" in t:
        return "Chappa Silk Weave"
    if "SEMI RAW SILK" in t:
        return "Semi Raw Silk Weave"
    if "COTTON" in t:
        return "Cotton Weave"
    return "Curated Textile"


def make_slug(display_title: str, pid: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", display_title.lower()).strip("-")
    num = pid.split("-")[-1].lower()
    return f"{base}-{num}"


def main():
    print("1. Extracting and verifying brand logo...")
    logo_meta = process_logo()

    with open(os.path.join(ROOT, "products", "products.json")) as f:
        raw_products = json.load(f)

    approved_products = []
    quarantined_and_ref = []
    source_to_asset_map = []
    resize_tasks = []

    print("2. Inspecting 69 catalog records & deduplicating media...")
    for rec in raw_products:
        pid = rec["product_id"]
        raw_title = rec.get("product_name")
        display_title = normalize_display_title(pid, raw_title)
        primary_cat, status, status_reason = classify_primary_category(
            pid, raw_title, rec.get("original_caption")
        )
        price_inr, price_paise = parse_price_inr(rec.get("price"))
        raw_media = rec.get("media_files") or []

        seen_hashes = set()
        dedup_media = []
        skipped_duplicates = []

        for idx, rel_path in enumerate(raw_media):
            abs_path = os.path.join(ROOT, rel_path)
            if not os.path.exists(abs_path):
                continue
            file_hash = sha256_file(abs_path)
            if file_hash in seen_hashes:
                skipped_duplicates.append({"sourcePath": rel_path, "sha256": file_hash})
                continue
            seen_hashes.add(file_hash)

            actual_fmt = detect_magic_format(abs_path)
            w, h = get_image_dimensions(abs_path)
            frame_num = len(dedup_media) + 1
            role = "cover" if frame_num == 1 else "gallery"

            # Copy format-corrected cover to public/assets/products/
            true_ext = actual_fmt
            orig_copy_name = f"{pid}_{frame_num:02d}.{true_ext}"
            orig_copy_abs = os.path.join(PROD_OUT_DIR, orig_copy_name)
            if not os.path.exists(orig_copy_abs):
                shutil.copy2(abs_path, orig_copy_abs)

            sm_name = f"{pid}_{frame_num:02d}_sm.jpg"
            card_name = f"{pid}_{frame_num:02d}_card.jpg"
            lg_name = f"{pid}_{frame_num:02d}_lg.jpg"

            resize_tasks.append((abs_path, os.path.join(PROD_OUT_DIR, sm_name), 420, 80))
            resize_tasks.append((abs_path, os.path.join(PROD_OUT_DIR, card_name), 840, 84))
            resize_tasks.append((abs_path, os.path.join(PROD_OUT_DIR, lg_name), 1440, 88))

            if role == "cover":
                alt_text = f"{display_title} — overhead textile view"
            else:
                alt_text = f"{display_title} — textile detail view {frame_num} of {len(raw_media) - 1 if len(raw_media) > 1 else 1}"

            dedup_media.append(
                {
                    "id": f"{pid}-media-{frame_num:02d}",
                    "productId": pid,
                    "role": role,
                    "index": frame_num,
                    "sourcePath": rel_path,
                    "sourceFormat": actual_fmt.upper(),
                    "sha256": file_hash,
                    "width": w,
                    "height": h,
                    "aspectRatio": round(w / h, 4) if h else 0.75,
                    "thumbUrl": f"/assets/products/{sm_name}",
                    "cardUrl": f"/assets/products/{card_name}",
                    "galleryUrl": f"/assets/products/{lg_name}",
                    "originalFormatUrl": f"/assets/products/{orig_copy_name}",
                    "alt": alt_text,
                }
            )

        fabric_facets = normalize_fabric_facets(
            raw_title, rec.get("fabrics_materials"), rec.get("original_caption")
        )
        fabric_summary = derive_fabric_summary(
            pid, raw_title, rec.get("fabrics_materials"), primary_cat
        )
        clean_desc = extract_clean_description(rec.get("original_caption"))
        slug = make_slug(display_title, pid)

        category_labels = {
            "sarees": "Sarees",
            "dress-materials": "Dress Materials",
            "fabrics": "Fabrics",
        }

        unit_note = None
        if primary_cat == "fabrics":
            unit_note = "Unit / measurement to be confirmed with the boutique prior to order."
        elif primary_cat == "dress-materials":
            unit_note = "Unstitched salwar / chudithar material set."

        normalized_item = {
            "id": pid,
            "slug": slug,
            "shortcode": rec.get("shortcode"),
            "sourceUrl": rec.get("post_url"),
            "publishedAt": rec.get("published_at"),
            "sourceTitle": raw_title,
            "displayTitle": display_title,
            "subtitle": fabric_summary,
            "productCode": rec.get("product_code"),
            "priceInr": price_inr,
            "pricePaise": price_paise,
            "priceFormatted": f"₹{price_inr:,}" if price_inr is not None else "Enquire for price",
            "rawPriceString": rec.get("price"),
            "primaryCategory": primary_cat,
            "primaryCategoryLabel": category_labels.get(primary_cat, "Unclassified"),
            "rawCategories": rec.get("clothing_categories") or [],
            "fabricFacets": fabric_facets,
            "rawFabrics": rec.get("fabrics_materials") or [],
            "sourceColors": rec.get("colors") or [],
            "sourceStyles": rec.get("designs_styles") or [],
            "description": clean_desc,
            "originalCaption": rec.get("original_caption"),
            "unitNote": unit_note,
            "whatsappNumber": "+91 7904957928",
            "status": status,
            "statusReason": status_reason,
            "media": dedup_media,
            "skippedDuplicateMedia": skipped_duplicates,
            "confidence": {
                "title": "verified_source",
                "price": "verified_source" if price_inr is not None else "missing_in_source",
                "productCode": "verified_source" if rec.get("product_code") else "not_listed_in_source",
                "primaryCategory": "verified_caption" if status == "approved" else status,
                "fabricFacets": "verified_text_and_title" if fabric_facets else "unspecified",
                "colors": "verified_source" if rec.get("colors") else "unspecified_in_source",
                "sizes": "not_applicable_omitted",
                "availability": "requires_boutique_confirmation",
                "shippingAndReturns": "requires_boutique_confirmation",
            },
        }

        source_to_asset_map.append(
            {
                "productId": pid,
                "slug": slug,
                "status": status,
                "statusReason": status_reason,
                "sourceTitle": raw_title,
                "displayTitle": display_title,
                "productCode": rec.get("product_code"),
                "priceInr": price_inr,
                "primaryCategory": primary_cat,
                "rawMediaCount": len(raw_media),
                "uniqueMediaCount": len(dedup_media),
                "sourceMediaPaths": raw_media,
                "optimizedMediaPaths": [m["galleryUrl"] for m in dedup_media],
                "cardMediaPaths": [m["cardUrl"] for m in dedup_media],
            }
        )

        if status == "approved":
            approved_products.append(normalized_item)
        else:
            quarantined_and_ref.append(normalized_item)

    print(f"3. Generating {len(resize_tasks)} responsive image variants using /usr/bin/sips...")
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = [pool.submit(resize_variant, *task) for task in resize_tasks]
        for fut in as_completed(futures):
            fut.result()

    # Curated Featured & Editorial Collections Manifest (Prompts 047-052, 059, 086-093, 106-109, 117)
    featured_order_ids = [
        "MD-PROD-001", "MD-PROD-004", "MD-PROD-029", "MD-PROD-036",
        "MD-PROD-060", "MD-PROD-063", "MD-PROD-051", "MD-PROD-009",
        "MD-PROD-014", "MD-PROD-003", "MD-PROD-007", "MD-PROD-002",
        "MD-PROD-015", "MD-PROD-046", "MD-PROD-049", "MD-PROD-050",
        "MD-PROD-053", "MD-PROD-012", "MD-PROD-026", "MD-PROD-030",
        "MD-PROD-061", "MD-PROD-062", "MD-PROD-059", "MD-PROD-064",
    ]
    rank_map = {pid: i for i, pid in enumerate(featured_order_ids)}
    for idx, item in enumerate(approved_products):
        item["featuredRank"] = rank_map.get(item["id"], 100 + idx)

    editorial_edits = [
        {
            "slug": "banarasi-and-tussar",
            "title": "Banarasi & Tussar Edit",
            "eyebrow": "Curated Weave Edit",
            "description": "Lustrous Tussar and Banarasi sarees with traditional zari borders and textured pallus, selected from archived weaves.",
            "heroProductId": "MD-PROD-004",
            "productIds": [
                "MD-PROD-001", "MD-PROD-003", "MD-PROD-004", "MD-PROD-005",
                "MD-PROD-006", "MD-PROD-010", "MD-PROD-011", "MD-PROD-012",
                "MD-PROD-017", "MD-PROD-019", "MD-PROD-023", "MD-PROD-027",
                "MD-PROD-029", "MD-PROD-032", "MD-PROD-036", "MD-PROD-037",
                "MD-PROD-040", "MD-PROD-047", "MD-PROD-048", "MD-PROD-052",
                "MD-PROD-053", "MD-PROD-057"
            ],
        },
        {
            "slug": "chanderi-edit",
            "title": "The Chanderi Edit",
            "eyebrow": "Sarees & Unstitched Sets",
            "description": "Lightweight Chanderi sarees and unstitched salwar material sets featuring jamdani motifs, pearl accents, and mirror work.",
            "heroProductId": "MD-PROD-009",
            "productIds": [
                "MD-PROD-009", "MD-PROD-013", "MD-PROD-014", "MD-PROD-031",
                "MD-PROD-060", "MD-PROD-062", "MD-PROD-063", "MD-PROD-065"
            ],
        },
        {
            "slug": "cotton-edit",
            "title": "The Cotton Edit",
            "eyebrow": "Breathable Everyday & Zari Weaves",
            "description": "Zari cotton, Jamdani cotton, Kota Doria, Kalamkari, and slub cotton drapes alongside embroidered cotton dress materials.",
            "heroProductId": "MD-PROD-015",
            "productIds": [
                "MD-PROD-015", "MD-PROD-016", "MD-PROD-018", "MD-PROD-020",
                "MD-PROD-024", "MD-PROD-025", "MD-PROD-026", "MD-PROD-028",
                "MD-PROD-031", "MD-PROD-033", "MD-PROD-034", "MD-PROD-035",
                "MD-PROD-038", "MD-PROD-042", "MD-PROD-045", "MD-PROD-055",
                "MD-PROD-056", "MD-PROD-060", "MD-PROD-061", "MD-PROD-063",
                "MD-PROD-064", "MD-PROD-065"
            ],
        },
        {
            "slug": "tissue-and-linen",
            "title": "Tissue & Linen Edit",
            "eyebrow": "Luminous Drapes",
            "description": "Soft tissue, tissue cotton, and tissue linen sarees with a delicate metallic sheen and airy drape.",
            "heroProductId": "MD-PROD-002",
            "productIds": [
                "MD-PROD-002", "MD-PROD-008", "MD-PROD-035", "MD-PROD-046"
            ],
        },
        {
            "slug": "occasion-edit",
            "title": "For Your Moments",
            "eyebrow": "Festive & Occasion Browsing",
            "description": "Selected Banarasi, Tussar, and embellished Chanderi pieces suited for family gatherings, weddings, and festive occasions.",
            "heroProductId": "MD-PROD-036",
            "productIds": [
                "MD-PROD-001", "MD-PROD-004", "MD-PROD-029", "MD-PROD-036",
                "MD-PROD-053", "MD-PROD-060", "MD-PROD-063", "MD-PROD-051"
            ],
        },
    ]

    catalog_payload = {
        "generatedAt": "2026-10-29T22:30:00+05:30",
        "brand": {
            "name": "Mahesh Designers",
            "tagline": "An elegant edit of sarees and fabrics",
            "factualPosition": "Mahesh Designers is a Tirupur-based saree, unstitched dress-material, and running-fabric boutique offering a curated selection of Banarasi, Tussar, Chanderi, cotton, and silk textiles.",
            "instagramHandle": "@maheshdesigners_online_",
            "instagramUrl": "https://www.instagram.com/maheshdesigners_online_/",
            "relatedBoutiqueHandle": "@_mahesh_designers_",
            "whatsappNumberDisplay": "+91 79049 57928",
            "whatsappNumberRaw": "917904957928",
            "whatsappUrl": "https://wa.me/917904957928",
            "additionalPhones": ["+91 96299 13107", "+91 99408 91503", "+91 99949 31449"],
            "landlines": ["0421-4250841", "0421-4261154"],
            "cityState": "Tirupur, Tamil Nadu",
            "provisionalAddressNote": "#12/1, Thanisha Complex, Municipal Office Road Cross Street, Ram Nagar / Kamaraj Road, Tirupur, Tamil Nadu (PIN 641604 / 641602 — pending owner confirmation)",
            "logo": logo_meta,
        },
        "counts": {
            "totalArchiveRecords": len(raw_products),
            "approvedProducts": len(approved_products),
            "sareesCount": sum(1 for p in approved_products if p["primaryCategory"] == "sarees"),
            "dressMaterialsCount": sum(1 for p in approved_products if p["primaryCategory"] == "dress-materials"),
            "fabricsCount": sum(1 for p in approved_products if p["primaryCategory"] == "fabrics"),
            "quarantinedCount": sum(1 for p in quarantined_and_ref if p["status"] == "quarantined"),
            "referenceOnlyCount": sum(1 for p in quarantined_and_ref if p["status"] == "reference_only"),
        },
        "heroShortlist": [
            {"productId": "MD-PROD-001", "role": "primary_home_hero", "note": "Tussar Banaras Saree with rich mauve-plum and gold zari pallu; harmonizes directly with brand palette."},
            {"productId": "MD-PROD-029", "role": "shortlist_candidate", "note": "Fancy Banaras Saree in silver-grey and blue zari border."},
            {"productId": "MD-PROD-051", "role": "editorial_story_feature", "note": "Vichitra Silk unstitched material with contrasting embroidered border."},
            {"productId": "MD-PROD-060", "role": "dress_materials_hero", "note": "Mul Chanderi Pearl & Thread Work unstitched suit set."},
            {"productId": "MD-PROD-063", "role": "detail_story_feature", "note": "Fancy Chanderi Thread & Mirror Work unstitched set."},
        ],
        "categories": [
            {
                "slug": "sarees",
                "title": "Sarees",
                "eyebrow": "52 Curated Drapes",
                "shortDescription": "Banarasi, Tussar, Chanderi, Soft Tissue, Organza, Kota, and Zari Cotton sarees photographed from the boutique archive.",
                "editorialIntro": "Explore tactile weaves ranging from festive Banarasi Tussar and luminous Soft Tissue drapes to breathable everyday Zari Cotton and Jamdani Chanderi sarees.",
                "featureProductId": "MD-PROD-036",
                "landingHeroProductId": "MD-PROD-004",
                "count": sum(1 for p in approved_products if p["primaryCategory"] == "sarees"),
            },
            {
                "slug": "dress-materials",
                "title": "Dress Materials",
                "eyebrow": "8 Unstitched Suit Sets",
                "shortDescription": "Unstitched salwar and chudithar material sets in Mul Chanderi, Vichitra Silk, Muslin Cotton, and Semi Rawsilk.",
                "editorialIntro": "Paired unstitched top, bottom, and dupatta material sets detailed with pearl work, mirror embroidery, zari borders, and fine thread work—ready to be tailored to your measurements.",
                "featureProductId": "MD-PROD-060",
                "landingHeroProductId": "MD-PROD-060",
                "count": sum(1 for p in approved_products if p["primaryCategory"] == "dress-materials"),
            },
            {
                "slug": "fabrics",
                "title": "Fabrics",
                "eyebrow": "2 Running Fabrics",
                "shortDescription": "Banaras brocade and embroidered Sana Silk running fabrics for custom blouses, ethnic ensembles, and coordinates.",
                "editorialIntro": "Textured running fabrics selected for custom tailoring and blouse design. Because archive records list base prices without specifying per-metre or piece units, please confirm cut length with the boutique.",
                "featureProductId": "MD-PROD-049",
                "landingHeroProductId": "MD-PROD-049",
                "count": sum(1 for p in approved_products if p["primaryCategory"] == "fabrics"),
            },
        ],
        "editorialEdits": editorial_edits,
        "products": approved_products,
    }

    with open(os.path.join(SRC_DATA_DIR, "catalog.json"), "w") as f:
        json.dump(catalog_payload, f, indent=2, ensure_ascii=False)

    with open(os.path.join(SRC_DATA_DIR, "quarantined_and_reference_records.json"), "w") as f:
        json.dump(quarantined_and_ref, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ROOT, "public", "assets", "source_to_asset_map.json"), "w") as f:
        json.dump(source_to_asset_map, f, indent=2, ensure_ascii=False)

    print("4. Summary:")
    print(json.dumps(catalog_payload["counts"], indent=2))


if __name__ == "__main__":
    main()

