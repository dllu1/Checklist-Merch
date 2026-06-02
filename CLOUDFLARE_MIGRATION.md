# Cloudflare Migration Notes

## D1 Data Import

From Supabase Dashboard, export `categories` and `products` as CSV files, then place them at:

```text
exports/categories.csv
exports/products.csv
```

Generate D1-compatible SQL:

```powershell
node scripts\supabase-csv-to-d1.js --categories exports\categories.csv --products exports\products.csv --out d1-seed.sql
```

Import locally:

```powershell
npx.cmd wrangler d1 execute merch_db --file d1-seed.sql --local
```

Import remotely:

```powershell
npx.cmd wrangler d1 execute merch_db --file d1-seed.sql --remote
```

## R2 Presigned URLs

The app can return direct R2 presigned URLs for audio and images. Configure these secrets in Cloudflare Pages:

```powershell
npx.cmd wrangler pages secret put R2_ACCOUNT_ID
npx.cmd wrangler pages secret put R2_ACCESS_KEY_ID
npx.cmd wrangler pages secret put R2_SECRET_ACCESS_KEY
```

For local development, add the same values to `.dev.vars`.

If these values are missing, `/api/audio/access-url` and `/api/images/access-url` fall back to authenticated Function proxy URLs so local dev still works.

Bucket names are configured in `wrangler.toml`:

```toml
[vars]
R2_AUDIO_BUCKET_NAME = "merch-audio"
R2_PRODUCT_IMAGES_BUCKET_NAME = "merch-product-images"
```

## R2 Asset Upload

Upload local image/audio folders to R2:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\upload-r2-local-assets.ps1
```

By default this uploads:

```text
images/* -> merch-product-images/images/*
audio/*  -> merch-audio/tracks/*
```

To upload Supabase Storage exports, point the script at those folders:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\upload-r2-local-assets.ps1 -ImagesDir .\exports\product-images -AudioDir .\exports\audio
```

Keep object keys aligned with database values:

```text
products.hinh_san_pham = images/hoodie.jpg
R2 object key          = images/hoodie.jpg
```

## Product Image Cleanup

The API automatically deletes old R2 product images when:

- a product is deleted
- a product image is replaced

Only object keys under `products/` are eligible for automatic cleanup. Static fallback images under `images/` are never deleted.

Manual dry-run cleanup:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\cleanup-unused-product-images.ps1 -Remote
```

Note: this script requires a Wrangler version that supports `wrangler r2 object list`. If your Wrangler only supports `get`, `put`, and `delete`, use automatic cleanup through the app or delete unused `products/` objects manually in the Cloudflare R2 dashboard.

Actually delete unused `products/` objects:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\cleanup-unused-product-images.ps1 -Remote -Execute
```
