<?php
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=shop_db;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false // Giúp PDO bắt lỗi kiểu dữ liệu nghiêm ngặt hơn
    ]);

    $id = isset($_POST['id']) ? $_POST['id'] : '';
    $ten = isset($_POST['ten_san_pham']) ? $_POST['ten_san_pham'] : '';

    $giaRaw = isset($_POST['gia']) ? $_POST['gia'] : 0;
    $gia = str_replace(',', '.', $giaRaw);

    $soluong = (!empty($_POST['so_luong'])) ? $_POST['so_luong'] : 1;

    $category_id = (!empty($_POST['category_id'])) ? $_POST['category_id'] : null;

    $nhanvat = isset($_POST['ten_nhan_vat']) ? $_POST['ten_nhan_vat'] : '';
    $shop = isset($_POST['shop_ban']) ? $_POST['shop_ban'] : '';
    $nguoi_mua = isset($_POST['nguoi_mua']) ? $_POST['nguoi_mua'] : '';

    $hinh_path = "";
    if (isset($_FILES['hinh_san_pham']) && $_FILES['hinh_san_pham']['error'] === UPLOAD_ERR_OK) {
        if (!is_dir('images')) if (!mkdir('images', 0777, true) && !is_dir('images')) {
            throw new \RuntimeException(sprintf('Directory "%s" was not created', 'images'));
        }
        $tmp_name = $_FILES['hinh_san_pham']['tmp_name'];
        $name = basename($_FILES['hinh_san_pham']['name']);
        $new_name = time() . "_" . $name;
        move_uploaded_file($tmp_name, "images/" . $new_name);
        $hinh_path = "images/" . $new_name;
    }

    if ($id) {
        if ($hinh_path) {
            $sql = "UPDATE products SET ten_san_pham=?, gia=?, so_luong=?, category_id=?, ten_nhan_vat=?, shop_ban=?, nguoi_mua=?, hinh_san_pham=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$ten, $gia, $soluong, $category_id, $nhanvat, $shop, $nguoi_mua, $hinh_path, $id]);
        } else {
            $sql = "UPDATE products SET ten_san_pham=?, gia=?, so_luong=?, category_id=?, ten_nhan_vat=?, shop_ban=?, nguoi_mua=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$ten, $gia, $soluong, $category_id, $nhanvat, $shop, $nguoi_mua, $id]);
        }
    } else {
        $sql = "INSERT INTO products (ten_san_pham, gia, so_luong, category_id, ten_nhan_vat, shop_ban, nguoi_mua, hinh_san_pham, da_mua) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$ten, $gia, $soluong, $category_id, $nhanvat, $shop, $nguoi_mua, $hinh_path]);
    }


    echo json_encode(['status' => 'success']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi Database: ' . $e->getMessage()]);
}
?>