const currentPath = window.location.pathname;
const isMarch7thPage = currentPath.includes('march7th.php') ? 1 : 0;

function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

async function loadData() {
    const categoryId = document.getElementById('filter-category').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const status = document.getElementById('filter-status').value;

    const sortValue = document.getElementById('sort-by').value;
    const [sortBy, order] = sortValue.split('-');

    const url = new URL('api_get_data.php', window.location.origin + window.location.pathname);
    url.searchParams.append('is_march_7th', isMarch7thPage);
    url.searchParams.append('category_id', categoryId);
    url.searchParams.append('min_price', minPrice);
    url.searchParams.append('max_price', maxPrice);
    url.searchParams.append('da_mua', status);
    url.searchParams.append('sort_by', sortBy);
    url.searchParams.append('order', order);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            if (document.getElementById('tong-toan-bo')) {
                document.getElementById('tong-toan-bo').innerText = formatCurrency(data.totals.tong_toan_bo);
                document.getElementById('tong-da-mua').innerText = formatCurrency(data.totals.tong_da_mua);
                document.getElementById('tong-chua-mua').innerText = formatCurrency(data.totals.tong_chua_mua);
            }

            renderProducts(data.products);
        } else {
            console.error("Lỗi từ server:", data.message);
        }
    } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
    }
}

function renderProducts(products) {
    const listContainer = document.getElementById('product-list');
    listContainer.innerHTML = '';

    if (products.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">Không có sản phẩm nào khớp với bộ lọc.</p>';
        return;
    }

    products.forEach((p, index) => {
        const categoryName = p.ten_danh_muc ? p.ten_danh_muc : 'Chưa phân loại';

        const isBought   = p.da_mua == 1;
        const nextStatus = isBought ? 0 : 1;
        const cardClass  = isBought ? 'product-card status-bought' : 'product-card';
        const badgeClass = isBought ? 'badge-status badge-da-mua'  : 'badge-status badge-chua-mua';
        const badgeText  = isBought ? '✓ Đã mua'                   : '⏳ Chưa mua';

        const imgTag = p.hinh_san_pham
            ? `<img class="card-img" src="${p.hinh_san_pham}" alt="${p.ten_san_pham}"
                    onerror="this.outerHTML='<div class=\\'card-img-placeholder\\'>🌸</div>'">`
            : `<div class="card-img-placeholder">🌸</div>`;

        const nhanVatTag = p.ten_nhan_vat
            ? `<span>Nhân vật: <b>${p.ten_nhan_vat}</b></span>` : '';
        const nguoiMuaTag = p.nguoi_mua
            ? `<span>Người mua: <b>${p.nguoi_mua}</b></span>`
            : `<span>Người mua: <b>Chưa có</b></span>`;

        // TÍNH TỔNG TIỀN CHO TỪNG SẢN PHẨM (Giá x Số lượng)
        const tongTienSanPham = p.gia * p.so_luong;

        const html = `
            <div class="${cardClass}" style="animation-delay: ${index * 0.05}s">
                ${imgTag}

                <div class="card-body">
                    <p class="card-title">${p.ten_san_pham}</p>
                    <p class="card-price">${formatCurrency(p.gia)}</p>
                    
                    <div class="card-meta">
                        <span>Số lượng: <b>${p.so_luong}</b></span>
                        <span>Tổng: <b style="color: var(--pink-deep);">${formatCurrency(tongTienSanPham)}</b></span>
                        
                        <span>Loại: <b>${categoryName}</b></span>
                        <span>Shop: <b>${p.shop_ban}</b></span>
                        ${nhanVatTag}
                        ${nguoiMuaTag}
                    </div>
                    
                    <button class="${badgeClass}" onclick="toggleBuyStatus(${p.id}, ${nextStatus})">
                        ${badgeText}
                    </button>
                </div>

                <div class="card-actions">
                    <button class="btn-edit-card"   onclick="editProduct(${p.id})">✏️ Sửa</button>
                    <button class="btn-delete-card" onclick="deleteProduct(${p.id})">🗑️ Xóa</button>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    });
}

async function toggleBuyStatus(id, newStatus) {
    try {
        const response = await fetch('api_toggle_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Gửi trực tiếp biến newStatus lên server
            body: JSON.stringify({ id: id, da_mua: newStatus })
        });

        const result = await response.json();
        if (result.status === 'success') {
            loadData(); // Cập nhật thành công thì tải lại dữ liệu để đổi màu nút
        } else {
            alert("Lỗi cập nhật trạng thái!");
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

function editProduct(id) {
    console.log("Sửa sản phẩm:", id);
    // Logic mở Modal Form sửa sẽ nằm ở đây
}

function deleteProduct(id) {
    if(confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        console.log("Xóa sản phẩm:", id);
        // Logic gọi API xóa sẽ nằm ở đây
    }
}

window.onload = () => {
    loadCategories();
    loadData();
};

const modalContent = document.getElementById("draggable-modal");
const modalHeader = document.getElementById("modal-drag-handle");

let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

modalHeader.addEventListener("mousedown", dragStart);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("mousemove", drag);

function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === modalHeader || e.target.tagName === 'H2') {
        isDragging = true;
    }
}
function dragEnd(e) { initialX = currentX; initialY = currentY; isDragging = false; }
function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        // Tắt transform translateX(-50%) của CSS khi bắt đầu kéo để tránh xung đột tọa độ
        modalContent.style.transform = "none";
        modalContent.style.left = currentX + "px";
        modalContent.style.top = currentY + "px";
    }
}

function openModal(isEdit = false, productData = null) {
    document.getElementById("product-modal").style.display = "block";
    const form = document.getElementById("product-form");

    if (isEdit && productData) {
        document.getElementById("modal-title").innerText = "Sửa Sản Phẩm";
        document.getElementById("form-id").value = productData.id;
        document.getElementById("form-ten").value = productData.ten_san_pham;
        document.getElementById("form-gia").value = productData.gia;
        document.getElementById("form-soluong").value = productData.so_luong;
        document.getElementById("form-category").value = productData.category_id || '';
        document.getElementById("form-nhanvat").value = productData.ten_nhan_vat;
        document.getElementById("form-shop").value = productData.shop_ban;
        document.getElementById("form-nguoimua").value = productData.nguoi_mua || '';
    } else {
        document.getElementById("modal-title").innerText = "Thêm Sản Phẩm Mới";
        form.reset();
        document.getElementById("form-id").value = "";
    }
}

function closeModal() {
    document.getElementById("product-modal").style.display = "none";
}

document.getElementById('btn-add-product').addEventListener('click', () => openModal(false));

async function submitForm(e) {
    e.preventDefault(); // Chặn việc reload lại trang

    const formElement = document.getElementById("product-form");
    const formData = new FormData(formElement); // Dùng FormData để hỗ trợ upload File Ảnh

    try {
        const response = await fetch('api_save_product.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            closeModal();
            loadData(); // Tải lại danh sách và giật lại tổng tiền
            alert("Đã lưu dữ liệu thành công!");
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
    }
}

async function editProduct(id) {
    // Để có dữ liệu fill vào form, ta có thể fetch lại thông tin sản phẩm này,
    // hoặc đơn giản hơn là lấy từ database trực tiếp. (Ở đây giả lập fetch thông tin 1 sản phẩm)
    const response = await fetch(`api_get_single.php?id=${id}`);
    const data = await response.json();
    if(data.status === 'success') {
        openModal(true, data.product);
    }
}

async function deleteProduct(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        try {
            const response = await fetch('api_delete_product.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const result = await response.json();
            if (result.status === 'success') {
                loadData(); // Cập nhật lại giao diện
            }
        } catch (error) {
            console.error("Lỗi xóa:", error);
        }
    }
}

async function loadCategories() {
    try {
        const response = await fetch('api_get_categories.php');
        const data = await response.json();

        if (data.status === 'success') {
            const filterSelect = document.getElementById('filter-category');
            const formSelect = document.getElementById('form-category');

            // Giữ lại option mặc định trên cùng
            let filterHtml = '<option value="">-- Tất cả Category --</option>';
            let formHtml = '<option value="">-- Chọn danh mục --</option>';

            // Chạy vòng lặp để tạo các <option> từ DB
            data.categories.forEach(cat => {
                const option = `<option value="${cat.id}">${cat.ten_danh_muc}</option>`;
                filterHtml += option;
                formHtml += option;
            });

            // Gắn vào giao diện
            if(filterSelect) filterSelect.innerHTML = filterHtml;
            if(formSelect) formSelect.innerHTML = formHtml;
        }
    } catch (error) {
        console.error("Lỗi tải danh mục:", error);
    }
}

window.addEventListener('scroll', () => {
    const toolbar = document.querySelector('.toolbar');
    if (window.scrollY > 60) {
        toolbar.classList.add('compact');
    } else {
        toolbar.classList.remove('compact');
    }
});