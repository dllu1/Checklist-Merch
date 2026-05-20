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
    <title>March 7th · Checklist Merch</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<?php render_bg(); ?>

<div class="container">
    <?php render_hero('march', 'March 7th', 'Bộ sưu tập riêng cho <em>March 7th</em> &amp; <em>Evernight</em> — từ standee, sticker đến figure limited. Mỗi món là một mảnh ký ức của Astral Express.'); ?>

    <?php render_product_toolbar(); ?>

    <div class="sec-head">
        <h2>Bộ sưu tập March 7th <span class="count" id="product-count">0 MÓN</span></h2>
        <div class="legend">
            <span><span class="swatch" style="background: var(--pink)"></span> March 7th</span>
            <span><span class="swatch" style="background: var(--mint)"></span> Đã mua</span>
            <span><span class="swatch" style="background: var(--gold)"></span> Chưa mua</span>
        </div>
    </div>

    <div id="product-list" class="product-grid">
        <p class="empty-state">Đang tải dữ liệu...</p>
    </div>

    <?php render_footer(); ?>
</div>

<?php render_product_modal(); ?>

<script src="supabase-config.js"></script>
<?php require __DIR__ . '/music_player.php'; ?>
<script type="module">
    import { initApp } from './app.js';
    import './soft_nav.js';
    initApp();
</script>
</body>
</html>
