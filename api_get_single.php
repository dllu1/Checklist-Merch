<?php
header('Content-Type: application/json; charset=utf-8'); // Ép buộc trả về JSON
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=shop_db;charset=utf8mb4", "root", "", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $id = isset($_GET['id']) ? $_GET['id'] : 0;

    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        echo json_encode(['status' => 'success', 'product' => $product]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Không tìm thấy sản phẩm']);
    }
} catch (Throwable $e) {
    // Bắt toàn bộ lỗi và báo về JS thay vì in ra màn hình HTML
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>