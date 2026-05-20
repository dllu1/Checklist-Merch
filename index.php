<?php
declare(strict_types=1);
require __DIR__ . '/_layout.php';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="public/march7th.png?v=20260520">
    <link rel="shortcut icon" type="image/png" href="public/march7th.png?v=20260520">
    <title>Checklist Merch · Frost & Petal</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<?php render_bg(); ?>

<div class="container">
    <?php render_hero('all', 'Checklist Merch', 'Bộ sưu tập merch chủ đề tinh thể băng & cánh hoa anh đào. Theo dõi từng món của <em>March 7th</em> và các nhân vật yêu thích khác.'); ?>

    <div class="toolbar-sentinel" aria-hidden="true"></div>
    <div class="toolbar">
        <button class="btn-add" id="btn-add-product"><span class="lbl-full">Thêm Sản Phẩm Mới</span><span class="lbl-short">Thêm mới</span></button>

        <div class="filters">
            <select id="filter-category" onchange="loadData()">
                <option value="">-- Tất cả Category --</option>
            </select>

            <input type="number" id="min-price" placeholder="Giá từ…" oninput="loadData()">
            <input type="number" id="max-price" placeholder="Đến giá…" oninput="loadData()">

            <select id="filter-status" onchange="loadData()">
                <option value="">-- Trạng thái --</option>
                <option value="1">Đã mua</option>
                <option value="0">Chưa mua</option>
            </select>

            <select id="sort-by" onchange="loadData()">
                <option value="ngay_them-DESC">Mới nhất trước</option>
                <option value="ngay_them-ASC">Cũ nhất trước</option>
                <option value="gia-ASC">Giá tăng dần</option>
                <option value="gia-DESC">Giá giảm dần</option>
                <option value="ten_san_pham-ASC">Tên (A-Z)</option>
                <option value="ten_nhan_vat-ASC">Nhân vật (A-Z)</option>
                <option value="so_luong-DESC">Số lượng (Giảm dần)</option>
                <option value="so_luong-ASC">Số lượng (Tăng dần)</option>
            </select>
        </div>

        <div class="cat-row">
            <div class="cat-bar" id="cat-bar" role="tablist" aria-label="Lọc nhanh theo danh mục">
                <button type="button" class="cat-chip" data-cat="" data-active="true">✦ Tất cả <span class="num" id="cat-count-all">0</span></button>
            </div>
            <div class="search-bar">
                <svg class="search-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M20 20 L16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                <input type="text" id="search-char" class="search-input" placeholder="Tìm nhân vật…" autocomplete="off">
                <button type="button" class="search-clear" id="search-clear" aria-label="Xoá tìm kiếm" hidden>✕</button>
            </div>
        </div>
    </div>

    <div class="sec-head">
        <h2>Tất cả sản phẩm <span class="count" id="product-count">0 MÓN</span></h2>
        <div class="legend">
            <span><span class="swatch" style="background: var(--pink)"></span> March 7th</span>
            <span><span class="swatch" style="background: var(--ice)"></span> Khác</span>
            <span><span class="swatch" style="background: var(--mint)"></span> Đã mua</span>
        </div>
    </div>

    <div id="product-list" class="product-grid">
        <p class="empty-state">Đang tải dữ liệu...</p>
    </div>

    <?php render_footer(); ?>
</div>

<!-- ===== Product Modal (pm-* design) ===== -->
<div id="product-modal" class="modal-overlay">
    <div class="pm-petals" aria-hidden="true">
        <?php for ($i = 0; $i < 14; $i++): ?>
            <span class="pm-petal" style="left: <?= ($i * 7) % 100 ?>%; animation-delay: <?= -$i * 0.7 ?>s; animation-duration: <?= 7 + ($i % 5) ?>s;"></span>
        <?php endfor; ?>
    </div>

    <div class="modal-content" id="draggable-modal">
        <header class="modal-header" id="modal-drag-handle">
            <div class="pm-head-left">
                <div class="pm-head-icon">✿</div>
                <div>
                    <div class="pm-eyebrow" id="modal-eyebrow">NEW · MERCH</div>
                    <h2 id="modal-title">Thêm Sản Phẩm Mới</h2>
                </div>
            </div>
            <button type="button" class="close-btn" onclick="closeModal()" aria-label="Đóng">✕</button>
        </header>

        <div class="modal-body">
            <form id="product-form" onsubmit="submitForm(event)">
                <input type="hidden" id="form-id" name="id">
                <input type="hidden" id="form-glyph" name="glyph" value="✿">

                <!-- Tên sản phẩm (full width) -->
                <div class="pm-field pm-col-2">
                    <label class="pm-lbl" for="form-ten">Tên sản phẩm <span class="pm-req">*</span></label>
                    <input id="form-ten" name="ten_san_pham" class="pm-input" type="text"
                           placeholder="VD: Standee March 7th Mùa Hè" required>
                </div>

                <!-- Giá + Số lượng -->
                <div class="pm-field">
                    <label class="pm-lbl" for="form-gia">Giá (VNĐ) <span class="pm-req">*</span></label>
                    <div class="pm-input-wrap">
                        <input id="form-gia" name="gia" class="pm-input" type="number" min="0"
                               placeholder="150000" required>
                        <span class="pm-suffix">₫</span>
                    </div>
                </div>
                <div class="pm-field">
                    <label class="pm-lbl">Số lượng</label>
                    <div class="pm-stepper">
                        <button type="button" class="pm-step" id="qty-dec" aria-label="Giảm">−</button>
                        <input id="form-soluong" name="so_luong" class="pm-input pm-input-center"
                               type="number" min="1" value="1" required>
                        <button type="button" class="pm-step" id="qty-inc" aria-label="Tăng">+</button>
                    </div>
                </div>

                <!-- Danh mục + Nhân vật -->
                <div class="pm-field">
                    <label class="pm-lbl" for="form-category">Danh mục</label>
                    <select id="form-category" name="category_id" class="pm-input pm-select"></select>
                </div>
                <div class="pm-field">
                    <label class="pm-lbl" for="form-nhanvat">Nhân vật</label>
                    <input id="form-nhanvat" name="ten_nhan_vat" class="pm-input" type="text"
                           placeholder="VD: March 7th, Evernight, Kafka, Yaoguang…">
                </div>

                <!-- Shop + Người mua -->
                <div class="pm-field">
                    <label class="pm-lbl" for="form-shop">Tên shop bán</label>
                    <input id="form-shop" name="shop_ban" class="pm-input" type="text"
                           placeholder="VD: Shop Mihoyo, Taobao…">
                </div>
                <div class="pm-field">
                    <label class="pm-lbl" for="form-nguoimua">Người mua</label>
                    <input id="form-nguoimua" name="nguoi_mua" class="pm-input" type="text"
                           placeholder="Nhập tên người mua…">
                </div>

                <!-- Glyph picker (full width) -->
                <div class="pm-field pm-col-2">
                    <label class="pm-lbl">Biểu tượng</label>
                    <div class="pm-glyphs" id="glyph-picker" role="radiogroup">
                        <?php foreach (["✿", "❀", "🌸", "❄", "✦", "✧", "★", "♡"] as $g): ?>
                            <button type="button" class="pm-glyph" data-glyph="<?= htmlspecialchars($g, ENT_QUOTES) ?>" role="radio"><?= $g ?></button>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Drop zone image (full width) -->
                <div class="pm-field pm-col-2">
                    <label class="pm-lbl">Hình ảnh</label>
                    <div class="pm-drop" id="pm-drop">
                        <div class="pm-drop-default" id="pm-drop-default">
                            <div class="pm-drop-ico">
                                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="pm-up" x1="0" x2="1" y1="0" y2="1">
                                            <stop offset="0%" stop-color="#ff7eb0"/>
                                            <stop offset="100%" stop-color="#6fc7ff"/>
                                        </linearGradient>
                                    </defs>
                                    <circle cx="12" cy="12" r="11" fill="rgba(255,126,176,0.08)" stroke="url(#pm-up)" stroke-width="1.4" stroke-dasharray="2 3"/>
                                    <path d="M12 7 V16 M8 11 L12 7 L16 11" stroke="url(#pm-up)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                </svg>
                            </div>
                            <div class="pm-drop-text">
                                <b>Click hoặc kéo ảnh vào đây</b>
                                <span>PNG · JPG · WebP — tối đa 5MB</span>
                            </div>
                        </div>
                        <div class="pm-drop-prev" id="pm-drop-prev" hidden>
                            <img id="pm-prev-img" src="" alt="">
                            <div class="pm-drop-meta">
                                <div class="pm-drop-name" id="pm-prev-name">—</div>
                                <div class="pm-drop-size" id="pm-prev-size">— · Click hoặc kéo file khác để thay</div>
                            </div>
                            <button type="button" class="pm-drop-x" id="pm-drop-x" aria-label="Xoá ảnh">×</button>
                        </div>
                        <input id="form-hinh" name="hinh_san_pham" type="file" accept="image/*" hidden>
                    </div>
                </div>
            </form>
        </div>

        <footer class="modal-footer">
            <button type="button" class="pm-btn pm-cancel" onclick="closeModal()">Hủy</button>
            <button type="button" class="pm-btn pm-save" onclick="submitForm()">
                ✦ <span id="save-label">Lưu Dữ Liệu</span>
            </button>
        </footer>
    </div>
</div>

<?php require __DIR__ . '/music_player.php'; ?>
<?php require __DIR__ . '/background_picker.php'; ?>

<script src="app.js"></script>
</body>
</html>
