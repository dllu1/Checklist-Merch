# Anime Merch Checklist Manager

Private merch checklist app using PHP-rendered pages plus Supabase for Auth, Postgres data, and Storage.

## Stack

- Frontend: PHP templates, CSS, Vanilla JavaScript modules
- Auth: Supabase Auth, email + password
- Database: Supabase Postgres
- Storage: Supabase Storage buckets `product-images` and `audio`

The old PHP/MySQL API layer has been removed. The app reads and writes data through Supabase with Row Level Security.

## Supabase Setup

1. Create a Supabase project.
2. In Authentication, keep Email/Password enabled.
3. Create user accounts for you and your friend.
4. Open the Supabase SQL Editor and run `supabase_schema.sql`.
5. Upload product images to the private `product-images` bucket.
6. Upload music files to the private `audio` bucket.
7. Update `supabase-config.js`:

```js
window.MERCH_SUPABASE = {
    url: 'https://YOUR_PROJECT_REF.supabase.co',
    publishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
};
```

Use the publishable/anon key only. Never put the service role key in browser code.

## Data Migration Notes

- `shop_db.sql` is kept only as the old MySQL export/reference.
- Migrate rows from old `categories` and `products` into Supabase tables.
- For product images, store the Supabase object path in `products.hinh_san_pham`, for example:

```text
products/your-file-id.webp
```

- Existing local paths like `images/hoodie.jpg` can still display locally, but should be migrated to Storage before deployment.

## Deployment

For the least code churn, deploy the PHP files to a free PHP host such as InfinityFree and let Supabase handle Auth/DB/Storage.

Required files to upload:

- `*.php`
- `*.js`
- `style.css`
- `public/`
- `supabase-config.js`

Do not upload the deleted old API files. They are no longer used.

## Removed Feature

Dynamic background upload/selection has been removed to preserve Supabase Storage quota. The app always uses the original animated background rendered by `_layout.php`.
