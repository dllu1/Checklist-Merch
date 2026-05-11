<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Tổng Quan Ngân Sách</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 40px;
        }
        .section-title {
            grid-column: 1 / -1;
            text-align: center;
            font-family: 'Baloo 2', cursive;
            color: var(--pink-deep);
            font-size: 1.8rem;
            margin-bottom: 10px;
        }
        .dashboard-column {
            background: rgba(255, 255, 255, 0.6);
            padding: 25px;
            border-radius: var(--radius-lg);
            border: 2px solid var(--pink-pale);
        }
        .dashboard-column h2 {
            text-align: center;
            margin-bottom: 20px;
            font-family: 'Baloo 2', cursive;
        }
        @media (max-width: 768px) {
            .dashboard-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
<div class="container">
    <header>
        <h1>Bảng Điều Khiển Tài Chính</h1>
        <nav>
            <a href="index.php">Tất cả sản phẩm</a>
            <a href="march7th.php">Chỉ March 7th</a>
            <a href="dashboard.php" class="active">Dashboard</a>
        </nav>
    </header>

    <div class="dashboard-grid">
        <div class="dashboard-column">
            <h2>🌸 March 7th</h2>
            <div class="summary-cards" style="grid-template-columns: 1fr; gap: 15px;">
                <div class="card card-total">
                    <h3>Tổng Cộng</h3>
                    <p id="m7-total">0 ₫</p>
                </div>
                <div class="card card-bought">
                    <h3>Đã Mua</h3>
                    <p id="m7-bought">0 ₫</p>
                </div>
                <div class="card card-unbought">
                    <h3>Chưa Mua</h3>
                    <p id="m7-unbought">0 ₫</p>
                </div>
            </div>
        </div>

        <div class="dashboard-column">
            <h2>✨ Sản phẩm khác</h2>
            <div class="summary-cards" style="grid-template-columns: 1fr; gap: 15px;">
                <div class="card card-total" style="background: linear-gradient(135deg, var(--blue-main), var(--blue-deep))">
                    <h3>Tổng Cộng</h3>
                    <p id="others-total">0 ₫</p>
                </div>
                <div class="card card-bought">
                    <h3>Đã Mua</h3>
                    <p id="others-bought">0 ₫</p>
                </div>
                <div class="card card-unbought">
                    <h3>Chưa Mua</h3>
                    <p id="others-unbought">0 ₫</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

    async function loadDashboard() {
        try {
            const response = await fetch('api_dashboard.php');
            const data = await response.json();
            if (data.status === 'success') {
                // Đổ dữ liệu March 7th
                document.getElementById('m7-total').innerText = formatCurrency(data.march7th.total);
                document.getElementById('m7-bought').innerText = formatCurrency(data.march7th.bought);
                document.getElementById('m7-unbought').innerText = formatCurrency(data.march7th.unbought);

                // Đổ dữ liệu Sản phẩm khác
                document.getElementById('others-total').innerText = formatCurrency(data.others.total);
                document.getElementById('others-bought').innerText = formatCurrency(data.others.bought);
                document.getElementById('others-unbought').innerText = formatCurrency(data.others.unbought);
            }
        } catch (error) {
            console.error("Lỗi tải dashboard:", error);
        }
    }
    window.onload = loadDashboard;
</script>
</body>
</html>