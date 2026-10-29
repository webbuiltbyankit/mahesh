# Manual Import Fallback Inbox (`manual_import_inbox/`)

When live unauthenticated scraping of `https://www.instagram.com/maheshdesigners_online_/` is blocked by Instagram's login wall or sandbox network isolation, you can drop owner-supplied media or official Instagram data exports directly into this folder and re-run:

```bash
python3 run_extraction.py
```

## Supported Owner-Supplied Inputs
1. **Official Instagram Data Export ("Download Your Information" JSON format):**
   - Copy `posts_1.json` (or `reels.json`) and the accompanying media folders into `manual_import_inbox/`.
2. **Saved Browser JSON Payload (`web_profile_info.json`):**
   - If the store owner saves the JSON response from `https://www.instagram.com/api/v1/users/web_profile_info/?username=maheshdesigners_online_` into this folder, the script will parse all profile counts, bio, posts, carousels, and captions automatically.
3. **Direct Product Images / Videos:**
   - Drop any `.jpg`, `.png`, `.webp`, or `.mp4` files here.
   - Optionally place a matching `.txt` file with the same filename stem (e.g., `saree_01.jpg` + `saree_01.txt`) containing the Instagram caption; the parser will automatically extract fabric, color, category, price, and WhatsApp ordering details into `products.json` and `react_vite_catalog.json`.
