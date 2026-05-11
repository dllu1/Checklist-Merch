<?php
header('Content-Type: application/json; charset=utf-8');
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=shop_db;charset=utf8mb4", "root", "", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    // Lấy toàn bộ danh mục, sắp xếp theo tên A-Z
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY ten_danh_muc ASC");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'categories' => $categories]);
} catch (Exception $e) { // Dùng Exception cho tương thích PHP 5.6
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>