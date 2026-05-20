# Deploy Checklist Merch lên Cloudflare Pages

## 1. Build static

```powershell
.\build.ps1
```

Output ra `dist/`. Mỗi lần đổi PHP/CSS/JS phải build lại.

## 2. Deploy

### Cách A — Direct Upload (nhanh nhất, không cần Git)
1. Vào https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**.
2. Đặt project name (vd `frost-petal-merch`).
3. Kéo thả toàn bộ folder `dist/` vào.
4. Bấm **Deploy site**.

### Cách B — Git connect (auto rebuild khi push)
1. Push folder `merch/` lên GitHub.
2. Cloudflare Pages → **Connect to Git** → chọn repo.
3. Build settings:
   - **Framework preset**: None
   - **Build command**: bỏ trống (Cloudflare không có PHP runtime)
   - **Build output directory**: `dist`
4. Vì CF không có PHP, bạn cần build local rồi commit `dist/` lên repo, HOẶC dùng GitHub Actions chạy `php` + `pwsh` rồi push artifact. Đơn giản nhất: build local + commit `dist/`.

## 3. Sau khi có domain (vd `frost-petal-merch.pages.dev`)

### Supabase
**Authentication → URL Configuration**:
- *Site URL*: `https://frost-petal-merch.pages.dev`
- *Redirect URLs*: thêm `https://frost-petal-merch.pages.dev/**`

**Storage → Policies**: đảm bảo bucket `audio` và `product-images` có policy phù hợp (chỉ authenticated user upload).

**Authentication → Settings → Bot and abuse protection**: domain mới sẽ tự work vì hCaptcha kiểm theo site key, không theo origin. Nhưng kiểm tra lại ở hCaptcha dashboard.

### hCaptcha
https://dashboard.hcaptcha.com → site của bạn → **Settings** → **Hostnames** → thêm `frost-petal-merch.pages.dev`.

### (Tùy chọn) Custom domain
Cloudflare Pages → project → **Custom domains** → add domain bạn sở hữu. Nhớ cập nhật lại Supabase URLs & hCaptcha hostnames cho domain mới.

## 4. Bảo mật trước khi public

- [ ] Bật **Row Level Security** cho mọi table trong Supabase và viết policy.
- [ ] `supabase-config.js` chỉ chứa **publishable/anon key**, KHÔNG bao giờ là `service_role`.
- [ ] Test login + upload nhạc trên domain production.
- [ ] Test CORS: mở DevTools console khi truy cập trang, không có lỗi `cors` hay `403` từ Supabase.

## Cấu trúc dist/

```
dist/
├── _headers              # security headers cho Cloudflare
├── *.html                # 4 trang static
├── *.js                  # JS modules
├── style.css
├── public/march7th.png
└── images/*.jpg          # placeholder ảnh, ảnh thật từ Supabase Storage
```
