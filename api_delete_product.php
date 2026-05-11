<?php
$pdo = new PDO("mysql:host=127.0.0.1;dbname=shop_db;charset=utf8mb4", "root", "", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$data['id']]);
    echo json_encode(['status' => 'success']);
}
?>