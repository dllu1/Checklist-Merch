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
    <title>Danh mục · Checklist Merch</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<?php render_bg(); ?>

<div class="container">
    <?php render_hero('cat', 'Quản lý danh mục', 'Thêm, sửa, xoá các loại sản phẩm (standee, sticker, móc khoá…). Số lượng sản phẩm trong mỗi danh mục được cập nhật theo thời gian thực.'); ?>

    <section class="cat-panel">
        <form class="cat-add-form" id="cat-add-form" autocomplete="off">
            <input type="text" id="cat-new-name" class="fld" placeholder="Tên danh mục mới (vd: Sticker)" required>
            <button type="submit" class="btn-add"><span class="lbl-full">Thêm danh mục</span><span class="lbl-short">Thêm</span></button>
        </form>

        <div id="cat-list" class="cat-list">
            <div class="cat-list-empty">Đang tải danh mục…</div>
        </div>
    </section>

    <?php render_footer(); ?>
</div>

<script src="supabase-config.js"></script>
<?php require __DIR__ . '/music_player.php'; ?>
<script type="module">
    import { initCategoriesPage } from './categories.js';
    import './soft_nav.js';
    initCategoriesPage();
</script>
</body>
</html>
