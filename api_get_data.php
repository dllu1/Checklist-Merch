<?php
// Bật hiển thị lỗi trong quá trình phát triển (có thể tắt khi deploy)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Cấu hình header trả về JSON và cho phép tiếng Việt
header('Content-Type: application/json; charset=utf-8');

// 1. Kết nối Database bằng PDO
$host = '127.0.0.1';
$db   = 'shop_db';
$user = 'root';
$pass = ''; // Điền mật khẩu MySQL nếu có
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối DB: ' . $e->getMessage()]);
    exit;
}

$isMarch7th = isset($_GET['is_march_7th']) ? $_GET['is_march_7th'] : '0'; // 1: Trang March 7th, 0: Trang chung
$categoryId = isset($_GET['category_id']) ? $_GET['category_id'] : '';
$minPrice   = isset($_GET['min_price']) ? $_GET['min_price'] : '';
$maxPrice   = isset($_GET['max_price']) ? $_GET['max_price'] : '';
$daMua      = isset($_GET['da_mua']) ? $_GET['da_mua'] : '';
$sortBy     = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'ngay_them';
$order      = isset($_GET['order']) ? $_GET['order'] : 'DESC';

$allowedSortColumns = ['gia', 'ten_san_pham', 'ten_nhan_vat', 'ngay_them', 'so_luong'];
$allowedOrders = ['ASC', 'DESC'];
if (!in_array($sortBy, $allowedSortColumns)) $sortBy = 'ngay_them';
if (!in_array(strtoupper($order), $allowedOrders)) $order = 'DESC';

$whereClauses = ["1=1"];
$params = [];

if ($isMarch7th === '1') {
    $whereClauses[] = "ten_nhan_vat = 'March 7th'";
} else {
    $whereClauses[] = "ten_nhan_vat != 'March 7th'";
}

if ($categoryId !== '') {
    $whereClauses[] = "category_id = ?";
    $params[] = $categoryId;
}

if ($minPrice !== '') {
    $whereClauses[] = "gia >= ?";
    $params[] = $minPrice;
}
if ($maxPrice !== '') {
    $whereClauses[] = "gia <= ?";
    $params[] = $maxPrice;
}

if ($daMua !== '') {
    $whereClauses[] = "da_mua = ?";
    $params[] = $daMua;
}

$whereSql = implode(' AND ', $whereClauses);

try {
    $sqlProducts = "
        SELECT p.*, c.ten_danh_muc 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE $whereSql 
        ORDER BY p.$sortBy $order
    ";
    $stmt = $pdo->prepare($sqlProducts);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    $sqlTotals = "
        SELECT 
            SUM(gia * so_luong) AS tong_toan_bo,
            SUM(CASE WHEN da_mua = 1 THEN gia * so_luong ELSE 0 END) AS tong_da_mua,
            SUM(CASE WHEN da_mua = 0 THEN gia * so_luong ELSE 0 END) AS tong_chua_mua
        FROM products p
        WHERE $whereSql
    ";
    $stmtTotals = $pdo->prepare($sqlTotals);
    $stmtTotals->execute($params);
    $totals = $stmtTotals->fetch();

    $totals = [
        'tong_toan_bo'  => isset($totals['tong_toan_bo']) ? $totals['tong_toan_bo'] : 0,
        'tong_da_mua'   => isset($totals['tong_da_mua']) ? $totals['tong_da_mua'] : 0,
        'tong_chua_mua' => isset($totals['tong_chua_mua']) ? $totals['tong_chua_mua'] : 0
    ];

    // 6. Trả kết quả về Frontend
    echo json_encode([
        'status'   => 'success',
        'products' => $products,
        'totals'   => $totals
    ]);

} catch (\PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi truy vấn: ' . $e->getMessage()]);
}
?>