<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

try {
    $pdo = db();

    $summarySql = <<<SQL
        SELECT
            COALESCE(SUM(gia * so_luong), 0)                                       AS total,
            COALESCE(SUM(CASE WHEN da_mua = 1 THEN gia * so_luong ELSE 0 END), 0)  AS bought,
            COALESCE(SUM(CASE WHEN da_mua = 0 THEN gia * so_luong ELSE 0 END), 0)  AS unbought,
            COUNT(*)                                                               AS count,
            COALESCE(SUM(so_luong), 0)                                             AS qty,
            COALESCE(SUM(CASE WHEN da_mua = 1 THEN 1 ELSE 0 END), 0)               AS done_count
        FROM products
        WHERE ten_nhan_vat
    SQL;

    $march7th = $pdo->query("$summarySql = 'March 7th'")->fetch();
    $others   = $pdo->query("$summarySql != 'March 7th' OR ten_nhan_vat IS NULL")->fetch();

    // Recent activity — 5 latest products with category name
    $recentSql = <<<SQL
        SELECT p.id, p.ten_san_pham, p.gia, p.so_luong, p.da_mua, p.ten_nhan_vat,
               p.shop_ban, p.ngay_them, c.ten_danh_muc
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.ngay_them DESC, p.id DESC
        LIMIT 5
    SQL;
    $recent = $pdo->query($recentSql)->fetchAll();

    json_response([
        'status'   => 'success',
        'march7th' => $march7th,
        'others'   => $others,
        'recent'   => $recent,
    ]);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
