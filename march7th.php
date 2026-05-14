<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checklist Merch Anime</title>
    <link rel="stylesheet" href="style.css"> </head>
<body>

<div class="container">
    <header>
        <h1>Checklist Merch</h1>
        <nav>
            <a href="index.php">Tất cả sản phẩm</a>
            <a href="march7th.php" class="active">Chỉ March 7th</a>
            <a href="dashboard.php">Dashboard</a> </nav>
    </header>

    <div class="toolbar">
        <button class="btn-add" id="btn-add-product">+ Thêm Sản Phẩm Mới</button>

        <div class="filters">
            <select id="filter-category" onchange="loadData()">
                <option value="">-- Tất cả Category --</option>
            </select>

            <input type="number" id="min-price" placeholder="Giá từ..." oninput="loadData()">
            <input type="number" id="max-price" placeholder="Đến giá..." oninput="loadData()">

            <select id="filter-status" onchange="loadData()">
                <option value="">-- Trạng thái --</option>
                <option value="1">Đã mua</option>
                <option value="0">Chưa mua</option>
            </select>

            <select id="sort-by" onchange="loadData()">
                <option value="ngay_them-DESC">Mới nhất trước</option>
                <option value="ngay_them-ASC">Cũ nhất trước</option>
                <option value="gia-ASC">Giá tăng dần</option>
                <option value="gia-DESC">Giá giảm dần</option>
                <option value="ten_san_pham-ASC">Tên (A-Z)</option>
                <option value="ten_nhan_vat-ASC">Nhân vật (A-Z)</option>
                <option value="so_luong-DESC">Số lượng (Giảm dần)</option>
                <option value="so_luong-ASC">Số lượng (Tăng dần)</option>
            </select>
        </div>
    </div>

    <div id="product-list" class="product-grid">
        <p>Đang tải dữ liệu...</p>
    </div>
</div>

<div id="product-modal" class="modal-overlay">
    <div class="modal-content" id="draggable-modal">
        <div class="modal-header" id="modal-drag-handle">
            <h2 id="modal-title">Thêm Sản Phẩm Mới</h2>
            <span class="close-btn" onclick="closeModal()">&times;</span>
        </div>

        <div class="modal-body">
            <form id="product-form" onsubmit="submitForm(event)">
                <input type="hidden" id="form-id" name="id"> <div class="form-group">
                    <label>Tên Sản Phẩm (*):</label>
                    <input type="text" id="form-ten" name="ten_san_pham" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Giá (VNĐ) (*):</label>
                        <input type="number" id="form-gia" name="gia" required>
                    </div>
                    <div class="form-group">
                        <label>Số lượng:</label>
                        <input type="number" id="form-soluong" name="so_luong" value="1" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Danh mục (Category_id):</label>
                        <select id="form-category" name="category_id">
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nhân vật:</label>
                        <input type="text" id="form-nhanvat" name="ten_nhan_vat">
                    </div>
                </div>

                <div class="form-group">
                    <label>Tên Shop bán:</label>
                    <input type="text" id="form-shop" name="shop_ban">
                </div>

                <div class="form-group">
                    <label>Người mua:</label>
                    <input type="text" id="form-nguoimua" name="nguoi_mua" placeholder="Nhập tên người mua...">
                </div>

                <div class="form-group">
                    <label>Hình ảnh (Tải file lên):</label>
                    <input type="file" id="form-hinh" name="hinh_san_pham" accept="image/*">
                </div>

                <button type="submit" class="btn-save">Lưu Dữ Liệu</button>
            </form>
        </div>
    </div>
</div>

<script src="app.js"></script>
</body>
</html>