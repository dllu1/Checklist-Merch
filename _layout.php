<?php
declare(strict_types=1);

/**
 * Shared layout fragments (background, hero, footer) for Checklist Merch.
 */

function render_bg(): void
{ ?>
    <script>
        (function () {
            try {
                const cookieTheme = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('merch_theme='))
                    ?.split('=')[1];
                const storedTheme = cookieTheme ? decodeURIComponent(cookieTheme) : localStorage.getItem('merch-theme');
                document.documentElement.dataset.theme =
                    storedTheme === 'evernight' ? 'evernight' : 'light';
            } catch (error) {
                document.documentElement.dataset.theme = 'light';
            }
        })();
    </script>
    <div class="bg-wrap" aria-hidden="true">
        <div class="bg-grid"></div>
        <div class="bg-stars" id="bg-stars"></div>
    </div>
    <script>
        (function () {
            const wrap = document.getElementById('bg-stars');
            if (!wrap) return;
            const shapes = [
                `<svg width="W" height="H" viewBox="0 0 24 24"><path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" fill="COLOR"/></svg>`,
                `<svg width="W" height="H" viewBox="0 0 24 24"><path d="M12 1 L22 7 L22 17 L12 23 L2 17 L2 7 Z" fill="none" stroke="COLOR" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 1 L12 23 M2 7 L22 17 M22 7 L2 17" stroke="COLOR" stroke-width="0.8" stroke-opacity="0.6"/></svg>`,
                `<svg width="W" height="H" viewBox="0 0 24 24"><g fill="COLOR"><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(0 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(72 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(144 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(216 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(288 12 12)"/><circle cx="12" cy="12" r="1.6" fill="#fff" opacity="0.6"/></g></svg>`,
                `<svg width="W" height="H" viewBox="0 0 24 24"><g stroke="COLOR" stroke-width="1.2" stroke-linecap="round" fill="none"><line x1="12" y1="2" x2="12" y2="22"/><line x1="3.3" y1="7" x2="20.7" y2="17"/><line x1="3.3" y1="17" x2="20.7" y2="7"/><polyline points="9,4 12,2 15,4"/><polyline points="9,20 12,22 15,20"/></g></svg>`,
            ];
            const palettes = [
                ['#ff7eb0', '#ffb3d0'],
                ['#6fc7ff', '#a8dffd'],
                ['#b3a3e8', '#d3c5f0'],
            ];
            const items = [];
            for (let i = 0; i < 28; i++) {
                const size = 14 + Math.random() * 38;
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                const pal = palettes[Math.floor(Math.random() * palettes.length)];
                const color = pal[Math.floor(Math.random() * pal.length)];
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const rot = Math.random() * 360;
                const dur = 6 + Math.random() * 10;
                const delay = -Math.random() * 10;
                const opacity = 0.3 + Math.random() * 0.5;
                const svg = shape.replaceAll('W', size).replaceAll('H', size).replaceAll('COLOR', color);
                items.push(`<div style="position:absolute;left:${x}%;top:${y}%;transform:rotate(${rot}deg);opacity:${opacity};animation:drift ${dur}s ease-in-out ${delay}s infinite;">${svg}</div>`);
            }
            wrap.innerHTML = items.join('');
        })();
    </script>
<?php }

function render_crest(): void
{ ?>
    <div class="crest" aria-hidden="true">
        <svg class="ring" viewBox="0 0 100 100" width="86" height="86" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cg" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#ff7eb0"/>
                    <stop offset="50%" stop-color="#b3a3e8"/>
                    <stop offset="100%" stop-color="#6fc7ff"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#cg)" stroke-width="1.2" stroke-dasharray="2 4" opacity="0.65"/>
            <circle cx="50" cy="50" r="34" fill="none" stroke="url(#cg)" stroke-width="0.8" opacity="0.45"/>
        </svg>
        <svg class="crest-main" viewBox="0 0 100 100" width="86" height="86" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="petal" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#ff8cb8"/>
                    <stop offset="100%" stop-color="#ffc3dc"/>
                </linearGradient>
                <linearGradient id="ice" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#7fcfff"/>
                    <stop offset="100%" stop-color="#c5e8ff"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="22" fill="url(#petal)"/>
            <path d="M50 28 A22 22 0 0 1 50 72 Z" fill="url(#ice)"/>
            <g transform="translate(50 50) scale(0.9)">
                <?php foreach ([0, 72, 144, 216, 288] as $r): ?>
                    <path d="M0 -18 C 4 -10 9 -10 9 -4 C 9 4 4 8 0 8 C -4 8 -9 4 -9 -4 C -9 -10 -4 -10 0 -18 Z"
                          fill="#fff" opacity="0.92" transform="rotate(<?= $r ?>)"/>
                <?php endforeach; ?>
                <circle r="3" fill="#ffd97a"/>
            </g>
            <circle cx="50" cy="6" r="2.5" fill="#fff"/>
            <circle cx="94" cy="50" r="2" fill="#fff"/>
            <circle cx="50" cy="94" r="2" fill="#fff"/>
            <circle cx="6" cy="50" r="2.5" fill="#fff"/>
        </svg>
    </div>
<?php }

function render_hero(string $active, string $title, string $subtitle): void
{
    ?>
    <header class="hero">
        <?php render_crest(); ?>
        <div class="eyebrow">FROST<span class="dot"></span>PETAL<span class="dot"></span>COSMODYSSEY</div>
        <h1<?= $active === 'march' ? ' data-theme-text data-light-text="March 7th" data-dark-text="Evernight"' : '' ?>><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></h1>
        <p class="subtitle"><?= $subtitle ?></p>
        <div class="theme-bar" aria-label="Giao diện">
            <button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false">
                <span class="theme-toggle-ic" aria-hidden="true"></span>
                <span data-theme-label>March 7th</span>
            </button>
        </div>
        <nav>
            <a href="index.php"<?= $active === 'all' ? ' class="active"' : '' ?>>✦ Tất cả sản phẩm</a>
            <a href="march7th.php"<?= $active === 'march' ? ' class="active"' : '' ?>>✿ March 7th/Evernight</a>
            <a href="categories.php"<?= $active === 'cat' ? ' class="active"' : '' ?>>✧ Danh mục</a>
            <a href="dashboard.php"<?= $active === 'dash' ? ' class="active"' : '' ?>>❄ Dashboard</a>
            <a href="#" onclick="signOutAndRedirect(); return false;">Logout</a>
        </nav>
        <div class="hero-meta">Astral Express · <span data-hero-date>—</span></div>
    </header>
    <script>
        (function () {
            const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
            const d = new Date();
            const text = String(d.getDate()).padStart(2,'0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
            document.querySelectorAll('[data-hero-date]').forEach(el => { el.textContent = text; });
        })();
    </script>
<?php }

function strftime_safe(): string
{
    $months = [
        1 => 'Tháng 1', 2 => 'Tháng 2', 3 => 'Tháng 3', 4 => 'Tháng 4',
        5 => 'Tháng 5', 6 => 'Tháng 6', 7 => 'Tháng 7', 8 => 'Tháng 8',
        9 => 'Tháng 9', 10 => 'Tháng 10', 11 => 'Tháng 11', 12 => 'Tháng 12',
    ];
    $m = (int) date('n');
    return date('d') . ' ' . $months[$m] . ' ' . date('Y');
}

function render_footer(): void
{ ?>
    <div class="divider">✦ ✦ ✦ End of Trailblaze Log ✦ ✦ ✦</div>
    <div class="footer">
        <span>FROST · PETAL · v2.5 · CHECKLIST MERCH</span>
        <span>Made with ❄ &amp; ✿ for March 7th fans</span>
    </div>
<?php }

function render_product_toolbar(): void
{ ?>
    <div class="toolbar-sentinel" aria-hidden="true"></div>
    <div class="toolbar">
        <button class="btn-add" id="btn-add-product"><span class="lbl-full">Thêm Sản Phẩm Mới</span><span class="lbl-short">Thêm mới</span></button>

        <div class="filters">
            <select id="filter-category" class="fld fld-select" onchange="loadData()">
                <option value="">-- Tất cả Category --</option>
            </select>

            <input type="number" id="min-price" class="fld" placeholder="Giá từ…" oninput="loadData()">
            <input type="number" id="max-price" class="fld" placeholder="Đến giá…" oninput="loadData()">

            <select id="filter-status" class="fld fld-select" onchange="loadData()">
                <option value="">-- Trạng thái --</option>
                <option value="1">Đã mua</option>
                <option value="0">Chưa mua</option>
            </select>

            <select id="sort-by" class="fld fld-select" onchange="loadData()">
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

        <div class="search-bar">
            <svg class="search-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/>
                <path d="M20 20 L16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <input type="text" id="search-char" class="search-input" placeholder="Tìm nhân vật, sản phẩm, shop…" autocomplete="off">
            <button type="button" class="search-clear" id="search-clear" aria-label="Xoá tìm kiếm" hidden>✕</button>
        </div>
    </div>
<?php }

function render_product_modal(): void
{ ?>
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

                    <div class="pm-field pm-col-2">
                        <label class="pm-lbl" for="form-ten">Tên sản phẩm <span class="pm-req">*</span></label>
                        <input id="form-ten" name="ten_san_pham" class="pm-input" type="text"
                               placeholder="VD: Standee March 7th Mùa Hè" required>
                    </div>

                    <div class="pm-field pm-col-2">
                        <label class="pm-lbl" for="form-gia">Giá (VNĐ) <span class="pm-req">*</span></label>
                        <div class="pm-input-wrap">
                            <input id="form-gia" name="gia" class="pm-input"
                                   type="text" inputmode="decimal" autocomplete="off"
                                   placeholder="VD: 150k hoặc 150000" required>
                            <span class="pm-suffix">₫</span>
                        </div>
                        <div class="pm-quick-money" id="pm-quick-money" role="group" aria-label="Cộng nhanh số tiền">
                            <?php foreach ([10, 20, 50, 100, 200, 500] as $k): ?>
                                <button type="button" class="pm-money-chip" data-add="<?= $k * 1000 ?>">+<?= $k ?>k</button>
                            <?php endforeach; ?>
                            <button type="button" class="pm-money-chip pm-money-clear" data-clear="1" title="Xoá">✕</button>
                        </div>
                        <div class="pm-money-preview" id="pm-money-preview" aria-live="polite">= 0 ₫</div>
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

                    <div class="pm-field">
                        <label class="pm-lbl" for="form-category">Danh mục</label>
                        <select id="form-category" name="category_id" class="pm-input pm-select"></select>
                    </div>

                    <div class="pm-field">
                        <label class="pm-lbl" for="form-nhanvat">Nhân vật</label>
                        <input id="form-nhanvat" name="ten_nhan_vat" class="pm-input" type="text"
                               placeholder="VD: March 7th, Evernight, Kafka…">
                    </div>

                    <div class="pm-field">
                        <label class="pm-lbl" for="form-shop">Tên shop bán</label>
                        <input id="form-shop" name="shop_ban" class="pm-input" type="text"
                               placeholder="VD: Shop Mihoyo, Taobao…">
                    </div>

                    <div class="pm-field pm-col-2">
                        <label class="pm-lbl" for="form-nguoimua">Người mua</label>
                        <input id="form-nguoimua" name="nguoi_mua" class="pm-input" type="text"
                               placeholder="Nhập tên người mua…">
                    </div>

                    <div class="pm-field pm-col-2">
                        <label class="pm-lbl">Biểu tượng</label>
                        <div class="pm-glyphs" id="glyph-picker" role="radiogroup">
                            <?php foreach (["✿", "❀", "🌸", "❄", "✦", "✧", "★", "♡"] as $g): ?>
                                <button type="button" class="pm-glyph" data-glyph="<?= htmlspecialchars($g, ENT_QUOTES) ?>" role="radio"><?= $g ?></button>
                            <?php endforeach; ?>
                        </div>
                    </div>

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
<?php }
