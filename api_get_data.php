<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);

const ALLOWED_SORT_COLUMNS = ['gia', 'ten_san_pham', 'ten_nhan_vat', 'ngay_them', 'so_luong'];
const ALLOWED_ORDERS       = ['ASC', 'DESC'];

try {
    $pdo = db();
} catch (Throwable $e) {
    json_error('Lỗi kết nối DB: ' . $e->getMessage(), 500);
}

$isMarch7th = ($_GET['is_march_7th'] ?? '0') === '1';
$categoryId = $_GET['category_id'] ?? '';
$minPrice   = $_GET['min_price']    ?? '';
$maxPrice   = $_GET['max_price']    ?? '';
$daMua      = $_GET['da_mua']       ?? '';
$search     = trim((string)($_GET['search'] ?? ''));
$sortByRaw  = $_GET['sort_by']      ?? 'ngay_them';
$orderRaw   = strtoupper($_GET['order'] ?? 'DESC');

$sortBy = in_array($sortByRaw, ALLOWED_SORT_COLUMNS, true) ? $sortByRaw : 'ngay_them';
$order  = in_array($orderRaw, ALLOWED_ORDERS, true) ? $orderRaw : 'DESC';

$whereClauses = [
    $isMarch7th
        ? "ten_nhan_vat = 'March 7th'"
        : "(ten_nhan_vat != 'March 7th' OR ten_nhan_vat IS NULL)",
];
$params = [];

if ($categoryId !== '') {
    $whereClauses[] = 'category_id = ?';
    $params[]       = $categoryId;
}
if ($minPrice !== '') {
    $whereClauses[] = 'gia >= ?';
    $params[]       = $minPrice;
}
if ($maxPrice !== '') {
    $whereClauses[] = 'gia <= ?';
    $params[]       = $maxPrice;
}
if ($daMua !== '') {
    $whereClauses[] = 'da_mua = ?';
    $params[]       = $daMua;
}
if ($search !== '') {
    $whereClauses[] = 'ten_nhan_vat LIKE ?';
    $params[]       = '%' . $search . '%';
}

$whereSql = implode(' AND ', $whereClauses);

try {
    $stmt = $pdo->prepare(<<<SQL
        SELECT p.*, c.ten_danh_muc
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE $whereSql
        ORDER BY p.$sortBy $order
    SQL);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    $stmtTotals = $pdo->prepare(<<<SQL
        SELECT
            SUM(gia * so_luong)                                      AS tong_toan_bo,
            SUM(CASE WHEN da_mua = 1 THEN gia * so_luong ELSE 0 END) AS tong_da_mua,
            SUM(CASE WHEN da_mua = 0 THEN gia * so_luong ELSE 0 END) AS tong_chua_mua
        FROM products p
        WHERE $whereSql
    SQL);
    $stmtTotals->execute($params);
    $totals = $stmtTotals->fetch() ?: [];

    json_response([
        'status'   => 'success',
        'products' => $products,
        'totals'   => [
            'tong_toan_bo'  => $totals['tong_toan_bo']  ?? 0,
            'tong_da_mua'   => $totals['tong_da_mua']   ?? 0,
            'tong_chua_mua' => $totals['tong_chua_mua'] ?? 0,
        ],
    ]);
} catch (Throwable $e) {
    json_error('Lỗi truy vấn: ' . $e->getMessage(), 500);
}
