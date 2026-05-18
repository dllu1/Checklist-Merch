<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

try {
    $data = json_decode(file_get_contents('php://input') ?: '', true, flags: JSON_THROW_ON_ERROR);

    $id     = (int) ($data['id']     ?? 0);
    $daMua  = isset($data['da_mua']) ? (int) $data['da_mua'] : null;

    if ($id <= 0 || $daMua === null) {
        json_error('Thiếu dữ liệu ID hoặc Trạng thái');
    }

    $stmt = db()->prepare('UPDATE products SET da_mua = ? WHERE id = ?');
    $stmt->execute([$daMua, $id]);

    json_response(['status' => 'success']);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
