<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

ini_set('display_errors', '0');

const IMAGE_DIR = __DIR__ . '/images';

function save_uploaded_image(): string
{
    $file = $_FILES['hinh_san_pham'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
        return '';
    }

    if (!is_dir(IMAGE_DIR) && !mkdir(IMAGE_DIR, 0777, true) && !is_dir(IMAGE_DIR)) {
        throw new RuntimeException('Không tạo được thư mục images');
    }

    $safeName = basename($file['name']);
    $newName  = time() . '_' . $safeName;
    $target   = IMAGE_DIR . '/' . $newName;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        throw new RuntimeException('Không lưu được file ảnh');
    }

    return 'images/' . $newName;
}

try {
    $pdo = db();

    $id          = isset($_POST['id']) && $_POST['id'] !== '' ? (int) $_POST['id'] : 0;
    $ten         = trim((string) ($_POST['ten_san_pham'] ?? ''));
    $gia         = (float) str_replace(',', '.', (string) ($_POST['gia'] ?? '0'));
    $soluong     = max(1, (int) ($_POST['so_luong'] ?? 1));
    $categoryId  = !empty($_POST['category_id']) ? (int) $_POST['category_id'] : null;
    $nhanvat     = trim((string) ($_POST['ten_nhan_vat'] ?? ''));
    $shop        = trim((string) ($_POST['shop_ban']     ?? ''));
    $nguoiMua    = trim((string) ($_POST['nguoi_mua']    ?? ''));
    $hinhPath    = save_uploaded_image();

    match (true) {
        $id > 0 && $hinhPath !== '' => $pdo
            ->prepare('UPDATE products SET ten_san_pham=?, gia=?, so_luong=?, category_id=?, ten_nhan_vat=?, shop_ban=?, nguoi_mua=?, hinh_san_pham=? WHERE id=?')
            ->execute([$ten, $gia, $soluong, $categoryId, $nhanvat, $shop, $nguoiMua, $hinhPath, $id]),

        $id > 0 => $pdo
            ->prepare('UPDATE products SET ten_san_pham=?, gia=?, so_luong=?, category_id=?, ten_nhan_vat=?, shop_ban=?, nguoi_mua=? WHERE id=?')
            ->execute([$ten, $gia, $soluong, $categoryId, $nhanvat, $shop, $nguoiMua, $id]),

        default => $pdo
            ->prepare('INSERT INTO products (ten_san_pham, gia, so_luong, category_id, ten_nhan_vat, shop_ban, nguoi_mua, hinh_san_pham, da_mua) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)')
            ->execute([$ten, $gia, $soluong, $categoryId, $nhanvat, $shop, $nguoiMua, $hinhPath]),
    };

    json_response(['status' => 'success']);
} catch (Throwable $e) {
    json_error('Lỗi Database: ' . $e->getMessage(), 500);
}
