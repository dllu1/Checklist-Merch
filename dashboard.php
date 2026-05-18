<?php
declare(strict_types=1);
require __DIR__ . '/_layout.php';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard · Checklist Merch</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<?php render_bg(); ?>

<div class="container">
    <?php render_hero('dash', 'Dashboard', 'Tổng quan ngân sách merch — chia thành <em>March 7th</em> và các nhân vật khác. Theo dõi đã chi, còn lại, và tổng cộng.'); ?>

    <div class="dash">
        <!-- March 7th column -->
        <div class="dash-col march">
            <h3><span class="badge">✿</span> March 7th</h3>
            <div class="stat-grid">
                <div class="stat stat-total pink">
                    <div class="stat-bg" aria-hidden="true">
                        <svg width="140" height="140" viewBox="0 0 100 100" style="right:-30px;bottom:-30px;opacity:0.18">
                            <circle cx="50" cy="50" r="48" fill="#fff"/>
                            <circle cx="50" cy="50" r="32" fill="none" stroke="#fff" stroke-width="1.2"/>
                        </svg>
                        <svg width="56" height="56" viewBox="0 0 24 24" style="left:20px;bottom:14px;opacity:0.22" fill="#fff">
                            <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z"/>
                        </svg>
                    </div>
                    <div class="stat-head">
                        <span class="ic">✦</span>
                        <span class="stat-label">Tổng cộng</span>
                    </div>
                    <div class="stat-amount"><span id="m7-total">0</span><span class="cur"> ₫</span></div>
                    <div class="stat-meta" id="m7-total-meta">— · —</div>
                </div>

                <div class="stat stat-bought pink">
                    <div class="stat-bg" aria-hidden="true">
                        <svg width="140" height="140" viewBox="0 0 100 100" style="right:-30px;bottom:-30px;opacity:0.18">
                            <circle cx="50" cy="50" r="48" fill="#fff"/>
                            <circle cx="50" cy="50" r="32" fill="none" stroke="#fff" stroke-width="1.2"/>
                        </svg>
                    </div>
                    <div class="stat-head">
                        <span class="ic">✓</span>
                        <span class="stat-label">Đã mua</span>
                    </div>
                    <div class="stat-amount"><span id="m7-bought">0</span><span class="cur"> ₫</span></div>
                    <div class="stat-meta" id="m7-bought-meta">— đã hoàn thành</div>
                    <div class="progress"><div class="fill" id="m7-progress" style="width:0%"></div></div>
                </div>

                <div class="stat stat-pending">
                    <div class="stat-head">
                        <span class="ic">🛒</span>
                        <span class="stat-label">Chưa mua</span>
                    </div>
                    <div class="stat-amount"><span id="m7-unbought">0</span><span class="cur"> ₫</span></div>
                    <div class="stat-meta" id="m7-unbought-meta">— món còn lại</div>
                </div>
            </div>
        </div>

        <!-- Others column -->
        <div class="dash-col other">
            <h3><span class="badge">❄</span> Sản phẩm khác</h3>
            <div class="stat-grid">
                <div class="stat stat-total ice">
                    <div class="stat-bg" aria-hidden="true">
                        <svg width="140" height="140" viewBox="0 0 100 100" style="right:-30px;bottom:-30px;opacity:0.18">
                            <circle cx="50" cy="50" r="48" fill="#fff"/>
                            <circle cx="50" cy="50" r="32" fill="none" stroke="#fff" stroke-width="1.2"/>
                        </svg>
                        <svg width="56" height="56" viewBox="0 0 24 24" style="left:20px;bottom:14px;opacity:0.22" fill="#fff" stroke="#fff">
                            <g stroke-width="1.6" stroke-linecap="round" fill="none">
                                <line x1="12" y1="2" x2="12" y2="22"/>
                                <line x1="3.3" y1="7" x2="20.7" y2="17"/>
                                <line x1="3.3" y1="17" x2="20.7" y2="7"/>
                            </g>
                        </svg>
                    </div>
                    <div class="stat-head">
                        <span class="ic">❄</span>
                        <span class="stat-label">Tổng cộng</span>
                    </div>
                    <div class="stat-amount"><span id="others-total">0</span><span class="cur"> ₫</span></div>
                    <div class="stat-meta" id="others-total-meta">— · —</div>
                </div>

                <div class="stat stat-bought ice">
                    <div class="stat-bg" aria-hidden="true">
                        <svg width="140" height="140" viewBox="0 0 100 100" style="right:-30px;bottom:-30px;opacity:0.18">
                            <circle cx="50" cy="50" r="48" fill="#fff"/>
                            <circle cx="50" cy="50" r="32" fill="none" stroke="#fff" stroke-width="1.2"/>
                        </svg>
                    </div>
                    <div class="stat-head">
                        <span class="ic">✓</span>
                        <span class="stat-label">Đã mua</span>
                    </div>
                    <div class="stat-amount"><span id="others-bought">0</span><span class="cur"> ₫</span></div>
                    <div class="stat-meta" id="others-bought-meta">— đã hoàn thành</div>
                    <div class="progress"><div class="fill" id="others-progress" style="width:0%"></div></div>
                </div>

                <div class="stat stat-pending">
                    <div class="stat-head">
                        <span class="ic">🛒</span>
                        <span class="stat-label">Chưa mua</span>
                    </div>
                    <div class="stat-amount"><span id="others-unbought">0</span><span class="cur"> ₫</span></div>
                    <div class="stat-meta" id="others-unbought-meta">— món còn lại</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent activity -->
    <section class="recent">
        <h4>
            <span>Hoạt động gần đây</span>
            <span>5 mục mới nhất</span>
        </h4>
        <div class="recent-list" id="recent-list">
            <div class="recent-item"><div class="ri-ic">✿</div><div><div class="ri-name">Đang tải…</div></div><div></div><div></div></div>
        </div>
    </section>

    <?php render_footer(); ?>
</div>

<script>
    const fmtVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));

    function pickGlyph(catName) {
        if (!catName) return '✿';
        const lower = catName.toLowerCase();
        if (lower.includes('standee') || lower.includes('poster')) return '✿';
        if (lower.includes('sticker')) return '✦';
        if (lower.includes('acrylic')) return '❄';
        if (lower.includes('móc') || lower.includes('keychain') || lower.includes('huy')) return '♡';
        if (lower.includes('áo') || lower.includes('apparel') || lower.includes('trang phục')) return '★';
        if (lower.includes('gối') || lower.includes('plush')) return '❀';
        if (lower.includes('figure')) return '🌸';
        if (lower.includes('pin') || lower.includes('badge')) return '✧';
        if (lower.includes('artbook') || lower.includes('book')) return '✦';
        return '✿';
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function fillGroup(prefix, data) {
        const total = Number(data.total || 0);
        const bought = Number(data.bought || 0);
        const unbought = Number(data.unbought || 0);
        const count = Number(data.count || 0);
        const qty = Number(data.qty || 0);
        const done = Number(data.done_count || 0);

        document.getElementById(`${prefix}-total`).textContent    = fmtVND(total);
        document.getElementById(`${prefix}-bought`).textContent   = fmtVND(bought);
        document.getElementById(`${prefix}-unbought`).textContent = fmtVND(unbought);

        document.getElementById(`${prefix}-total-meta`).textContent    = `${count} món · ${qty} đơn vị`;
        document.getElementById(`${prefix}-bought-meta`).textContent   = `${done}/${count} đã hoàn thành`;
        document.getElementById(`${prefix}-unbought-meta`).textContent = `${count - done} món còn lại`;

        const pct = total > 0 ? (bought / total) * 100 : 0;
        document.getElementById(`${prefix}-progress`).style.width = `${pct}%`;
    }

    function renderRecent(items) {
        const list = document.getElementById('recent-list');
        if (!items || items.length === 0) {
            list.innerHTML = '<div class="recent-item"><div class="ri-ic">✿</div><div><div class="ri-name">Chưa có hoạt động</div></div><div></div><div></div></div>';
            return;
        }
        list.innerHTML = items.map(p => {
            const total = Number(p.gia) * Number(p.so_luong);
            const glyph = pickGlyph(p.ten_danh_muc);
            const date  = p.ngay_them ? String(p.ngay_them).slice(0, 10) : '—';
            const dotCls = Number(p.da_mua) === 1 ? 'b' : 'p';
            const cat = p.ten_danh_muc || 'Chưa phân loại';
            const shop = p.shop_ban || 'Chưa rõ';
            return `
                <div class="recent-item">
                    <div class="ri-ic">${glyph}</div>
                    <div>
                        <div class="ri-name">${escapeHtml(p.ten_san_pham)}</div>
                        <div class="ri-meta">${escapeHtml(cat)} · ${escapeHtml(shop)} · ${escapeHtml(date)}</div>
                    </div>
                    <div class="ri-price">${fmtVND(total)} ₫</div>
                    <div class="ri-dot ${dotCls}" title="${dotCls === 'b' ? 'Đã mua' : 'Chưa mua'}"></div>
                </div>
            `;
        }).join('');
    }

    async function loadDashboard() {
        try {
            const response = await fetch('api_dashboard.php');
            const data = await response.json();
            if (data.status === 'success') {
                fillGroup('m7', data.march7th);
                fillGroup('others', data.others);
                renderRecent(data.recent || []);
            }
        } catch (error) {
            console.error("Lỗi tải dashboard:", error);
        }
    }
    window.onload = loadDashboard;
</script>

<?php require __DIR__ . '/music_player.php'; ?>
</body>
</html>
