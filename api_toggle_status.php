<?php
header('Content-Type: application/json; charset=utf-8');
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id']) && isset($data['da_mua'])) {
    try {
        $pdo = new PDO("mysql:host=127.0.0.1;dbname=shop_db;charset=utf8mb4", "root", "", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $sql = "UPDATE products SET da_mua = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['da_mua'], $data['id']]);
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu dữ liệu ID hoặc Trạng thái']);
}
?>