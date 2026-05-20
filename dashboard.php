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
    <title>Dashboard · Checklist Merch</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<?php render_bg(); ?>

<div class="container">
    <?php render_hero('dash', 'Dashboard', 'Tổng quan ngân sách merch — chia thành nhóm <em>March 7th &amp; Evernight</em> và các nhân vật khác. Theo dõi đã chi, còn lại, và tổng cộng.'); ?>

    <div class="dash">
        <!-- March 7th column -->
        <div class="dash-col march">
            <h3><span class="badge">✿</span> March 7th &amp; Evernight</h3>
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

<script src="supabase-config.js"></script>
<script type="module" src="dashboard.js"></script>
<?php require __DIR__ . '/music_player.php'; ?>
</body>
</html>
