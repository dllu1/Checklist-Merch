<?php
// api_dashboard.php
header('Content-Type: application/json; charset=utf-8');
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=shop_db;charset=utf8mb4", "root", "", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    // 1. Tính toán cho mục March 7th
    $sqlM7 = "SELECT 
                SUM(gia * so_luong) AS total,
                SUM(CASE WHEN da_mua = 1 THEN gia * so_luong ELSE 0 END) AS bought,
                SUM(CASE WHEN da_mua = 0 THEN gia * so_luong ELSE 0 END) AS unbought
              FROM products WHERE ten_nhan_vat = 'March 7th'";
    $stmtM7 = $pdo->query($sqlM7);
    $dataM7 = $stmtM7->fetch(PDO::FETCH_ASSOC);

    // 2. Tính toán cho các mục còn lại
    $sqlOthers = "SELECT 
                    SUM(gia * so_luong) AS total,
                    SUM(CASE WHEN da_mua = 1 THEN gia * so_luong ELSE 0 END) AS bought,
                    SUM(CASE WHEN da_mua = 0 THEN gia * so_luong ELSE 0 END) AS unbought
                  FROM products WHERE ten_nhan_vat != 'March 7th' OR ten_nhan_vat IS NULL";
    $stmtOthers = $pdo->query($sqlOthers);
    $dataOthers = $stmtOthers->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'march7th' => $dataM7,
        'others' => $dataOthers
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>