const currentPath = window.location.pathname;
const isMarch7thPage = currentPath.includes('march7th.php') ? 1 : 0;

// Characters that share the March 7th group (filter scope + dashboard column).
const MARCH_GROUP = ['march 7th', 'evernight'];
function isInMarchGroup(name) {
    return MARCH_GROUP.includes((name || '').trim().toLowerCase());
}

let CATEGORIES = []; // populated by loadCategories()
let CAT_COUNTS = {}; // { category_id: count }

function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function pickGlyph(catName) {
    if (!catName) return '✿';
    const lower = catName.toLowerCase();
    if (lower.includes('standee') || lower.includes('poster')) return '✿';
    if (lower.includes('sticker')) return '✦';
    if (lower.includes('acrylic')) return '❄';
    if (lower.includes('móc') || lower.includes('keychain') || lower.includes('huy')) return '♡';
    if (lower.includes('áo') || lower.includes('apparel') || lower.includes('trang phục')) return '★';
    if (lower.includes('gối') || lower.includes('plush')) return '❀';
    if (lower.includes('figure')) return '🌸';
    if (lower.includes('pin') || lower.includes('badge')) return '✧';
    if (lower.includes('artbook') || lower.includes('book')) return '✦';
    return '✿';
}

async function loadData() {
    const categoryId = document.getElementById('filter-category').value;
    const minPrice   = document.getElementById('min-price').value;
    const maxPrice   = document.getElementById('max-price').value;
    const status     = document.getElementById('filter-status').value;
    const search     = document.getElementById('search-char')?.value.trim() ?? '';

    const sortValue = document.getElementById('sort-by').value;
    const [sortBy, order] = sortValue.split('-');

    const url = new URL('api_get_data.php', window.location.origin + window.location.pathname);
    url.searchParams.append('is_march_7th', isMarch7thPage);
    url.searchParams.append('category_id', categoryId);
    url.searchParams.append('min_price', minPrice);
    url.searchParams.append('max_price', maxPrice);
    url.searchParams.append('da_mua', status);
    url.searchParams.append('search', search);
    url.searchParams.append('sort_by', sortBy);
    url.searchParams.append('order', order);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            if (document.getElementById('tong-toan-bo')) {
                document.getElementById('tong-toan-bo').innerText  = formatCurrency(data.totals.tong_toan_bo);
                document.getElementById('tong-da-mua').innerText   = formatCurrency(data.totals.tong_da_mua);
                document.getElementById('tong-chua-mua').innerText = formatCurrency(data.totals.tong_chua_mua);
            }

            // refresh quick-access counts from the (filter-ignored) all-products view
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

    const countEl = document.getElementById('product-count');
    if (countEl) countEl.textContent = `${products.length} MÓN`;

    if (products.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">Không tìm thấy món nào — thử bỏ bớt bộ lọc hoặc thêm một sản phẩm mới.</p>';
        return;
    }

    products.forEach((p, index) => {
        const categoryName = p.ten_danh_muc ? p.ten_danh_muc : 'Chưa phân loại';

        const isBought   = p.da_mua == 1;
        const nextStatus = isBought ? 0 : 1;
        const isMarch    = isInMarchGroup(p.ten_nhan_vat);

        const cardClasses = ['product-card'];
        if (isBought) cardClasses.push('status-bought');
        if (isMarch)  cardClasses.push('is-march');

        const badgeClass = isBought ? 'badge-status badge-da-mua' : 'badge-status badge-chua-mua';
        const badgeText  = isBought ? '✓ Đã mua' : '◷ Chưa mua';

        const glyph = pickGlyph(categoryName);
        const imgTag = p.hinh_san_pham
            ? `<img class="card-img" src="${escapeHtml(p.hinh_san_pham)}" alt="${escapeHtml(p.ten_san_pham)}"
                    onerror="this.outerHTML='<div class=\\'card-img-placeholder\\'>${glyph}</div>'">`
            : `<div class="card-img-placeholder">${glyph}</div>`;

        const nhanVatTag = p.ten_nhan_vat
            ? `<span><span class="k">Nhân vật</span><b>${escapeHtml(p.ten_nhan_vat)}</b></span>` : '';
        const nguoiMuaTag = `<span><span class="k">Người mua</span><b>${escapeHtml(p.nguoi_mua || 'Chưa có')}</b></span>`;

        const marchTag = isMarch ? ` <span class="march-tag">✿ ${escapeHtml(p.ten_nhan_vat)}</span>` : '';

        const tongTienSanPham = p.gia * p.so_luong;

        const html = `
            <article class="${cardClasses.join(' ')}" style="animation-delay: ${index * 0.04}s">
                ${imgTag}

                <div class="card-body">
                    <h3 class="card-title">${escapeHtml(p.ten_san_pham)}${marchTag}</h3>
                    <p class="card-price">${formatCurrency(p.gia)}</p>

                    <div class="card-meta">
                        <span><span class="k">Số lượng</span><b>${p.so_luong}</b></span>
                        <span><span class="k">Tổng</span><b>${formatCurrency(tongTienSanPham)}</b></span>
                        <span><span class="k">Loại</span><b>${escapeHtml(categoryName)}</b></span>
                        <span><span class="k">Shop</span><b>${escapeHtml(p.shop_ban || 'Chưa rõ')}</b></span>
                        ${nhanVatTag}
                        ${nguoiMuaTag}
                    </div>

                    <button class="${badgeClass}" onclick="toggleBuyStatus(${p.id}, ${nextStatus})">
                        ${badgeText}
                    </button>
                </div>

                <div class="card-actions">
                    <button class="btn-edit-card"   onclick="editProduct(${p.id})">✎ Sửa</button>
                    <button class="btn-delete-card" onclick="deleteProduct(${p.id})">✕ Xóa</button>
                </div>
            </article>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    });
}

async function toggleBuyStatus(id, newStatus) {
    try {
        const response = await fetch('api_toggle_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, da_mua: newStatus })
        });

        const result = await response.json();
        if (result.status === 'success') {
            loadData();
        } else {
            alert("Lỗi cập nhật trạng thái!");
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

window.onload = () => {
    loadCategories().then(() => {
        loadData();
        loadCategoryCounts();
    });
};

/* ─── Modal: open/close + form helpers ─── */
function openModal(isEdit = false, productData = null) {
    const overlay = document.getElementById("product-modal");
    overlay.classList.add('active');
    overlay.style.display = '';

    const titleEl   = document.getElementById('modal-title');
    const eyebrowEl = document.getElementById('modal-eyebrow');
    const saveLbl   = document.getElementById('save-label');

    if (isEdit && productData) {
        titleEl.textContent   = 'Sửa Sản Phẩm';
        eyebrowEl.textContent = 'EDIT · MERCH';
        saveLbl.textContent   = 'Cập nhật';
        document.getElementById("form-id").value       = productData.id;
        document.getElementById("form-ten").value      = productData.ten_san_pham || '';
        document.getElementById("form-gia").value      = productData.gia || '';
        document.getElementById("form-soluong").value  = productData.so_luong || 1;
        document.getElementById("form-category").value = productData.category_id || '';
        document.getElementById("form-nhanvat").value  = productData.ten_nhan_vat || 'March 7th';
        document.getElementById("form-shop").value     = productData.shop_ban || '';
        document.getElementById("form-nguoimua").value = productData.nguoi_mua || '';
        document.getElementById("form-glyph").value    = productData.glyph || '✿';

        syncGlyphPicker();
        resetDropZone();
    } else {
        titleEl.textContent   = 'Thêm Sản Phẩm Mới';
        eyebrowEl.textContent = 'NEW · MERCH';
        saveLbl.textContent   = 'Lưu Dữ Liệu';
        document.getElementById("product-form").reset();
        document.getElementById("form-id").value      = "";
        document.getElementById("form-glyph").value   = '✿';
        document.getElementById("form-soluong").value = 1;
        // Don't force-set ten_nhan_vat — let the input keep its default value
        // (empty on index, "March 7th" on the dedicated march7th page).

        syncGlyphPicker();
        resetDropZone();
    }
    // Reset draggable position
    const modal = document.getElementById('draggable-modal');
    modal.style.left = '';
    modal.style.top  = '';
    modal.style.transform = '';
}

function closeModal() {
    const overlay = document.getElementById("product-modal");
    overlay.classList.remove('active');
    overlay.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

/* ─── Glyph picker ─── */
function syncGlyphPicker() {
    const current = document.getElementById('form-glyph').value;
    document.querySelectorAll('#glyph-picker .pm-glyph').forEach(g => {
        g.setAttribute('data-active', g.dataset.glyph === current ? 'true' : 'false');
    });
}
document.addEventListener('click', (e) => {
    const g = e.target.closest('#glyph-picker .pm-glyph');
    if (!g) return;
    document.getElementById('form-glyph').value = g.dataset.glyph;
    syncGlyphPicker();
});

/* ─── Quantity stepper ─── */
document.addEventListener('click', (e) => {
    const dec = e.target.closest('#qty-dec');
    const inc = e.target.closest('#qty-inc');
    if (!dec && !inc) return;
    const input = document.getElementById('form-soluong');
    let v = parseInt(input.value || '1', 10) || 1;
    if (dec) v = Math.max(1, v - 1);
    if (inc) v = v + 1;
    input.value = v;
});

/* ─── Drop zone ─── */
function resetDropZone() {
    const file = document.getElementById('form-hinh');
    if (file) file.value = '';
    const def = document.getElementById('pm-drop-default');
    const prev = document.getElementById('pm-drop-prev');
    if (def)  def.hidden = false;
    if (prev) prev.hidden = true;
}
function showFilePreview(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    document.getElementById('pm-prev-img').src = url;
    document.getElementById('pm-prev-name').textContent = file.name;
    document.getElementById('pm-prev-size').textContent = `${(file.size / 1024).toFixed(1)} KB · Click hoặc kéo file khác để thay`;
    document.getElementById('pm-drop-default').hidden = true;
    document.getElementById('pm-drop-prev').hidden = false;
}
document.addEventListener('click', (e) => {
    if (e.target.closest('#pm-drop-x')) {
        e.stopPropagation();
        resetDropZone();
        return;
    }
    if (e.target.closest('#pm-drop')) {
        document.getElementById('form-hinh').click();
    }
});
document.addEventListener('change', (e) => {
    if (e.target.id === 'form-hinh') {
        const f = e.target.files?.[0];
        if (f) showFilePreview(f);
    }
});
document.addEventListener('dragover', (e) => {
    const drop = e.target.closest('#pm-drop');
    if (!drop) return;
    e.preventDefault();
    drop.setAttribute('data-over', 'true');
});
document.addEventListener('dragleave', (e) => {
    const drop = e.target.closest('#pm-drop');
    if (!drop) return;
    drop.setAttribute('data-over', 'false');
});
document.addEventListener('drop', (e) => {
    const drop = e.target.closest('#pm-drop');
    if (!drop) return;
    e.preventDefault();
    drop.setAttribute('data-over', 'false');
    const f = e.dataTransfer.files?.[0];
    if (f) {
        const file = document.getElementById('form-hinh');
        const dt = new DataTransfer();
        dt.items.add(f);
        file.files = dt.files;
        showFilePreview(f);
    }
});

/* ─── Add product button + backdrop close ─── */
const addBtn = document.getElementById('btn-add-product');
if (addBtn) addBtn.addEventListener('click', () => openModal(false));

const overlayEl = document.getElementById('product-modal');
if (overlayEl) {
    overlayEl.addEventListener('mousedown', (e) => {
        if (e.target === overlayEl) closeModal();
    });
}

/* ─── Modal drag ─── */
const modalContent = document.getElementById("draggable-modal");
const modalHeader  = document.getElementById("modal-drag-handle");

let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

if (modalHeader && modalContent) {
    modalHeader.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);
}

function dragStart(e) {
    if (e.target.closest('button')) return; // don't drag from buttons
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
}
function dragEnd() { isDragging = false; }
function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    xOffset = currentX;
    yOffset = currentY;
    modalContent.style.transform = `translate(${currentX}px, ${currentY}px)`;
}

async function submitForm(e) {
    if (e) e.preventDefault();

    const form = document.getElementById("product-form");
    if (!form.reportValidity()) return;
    const formData = new FormData(form);

    try {
        const response = await fetch('api_save_product.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            closeModal();
            loadData();
            loadCategoryCounts();
            alert("Đã lưu dữ liệu thành công!");
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
    }
}

async function editProduct(id) {
    const response = await fetch(`api_get_single.php?id=${id}`);
    const data = await response.json();
    if (data.status === 'success') {
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
                loadData();
                loadCategoryCounts();
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

        if (data.status !== 'success') return;
        CATEGORIES = data.categories;

        const filterSelect = document.getElementById('filter-category');
        const formSelect   = document.getElementById('form-category');

        let filterHtml = '<option value="">-- Tất cả Category --</option>';
        let formHtml   = '<option value="">-- Chọn danh mục --</option>';

        CATEGORIES.forEach(cat => {
            const option = `<option value="${cat.id}">${escapeHtml(cat.ten_danh_muc)}</option>`;
            filterHtml += option;
            formHtml   += option;
        });

        if (filterSelect) filterSelect.innerHTML = filterHtml;
        if (formSelect)   formSelect.innerHTML   = formHtml;

        renderCatBar();
    } catch (error) {
        console.error("Lỗi tải danh mục:", error);
    }
}

/* ─── Quick-access category chips ─── */
async function loadCategoryCounts() {
    // Fetch ALL products (no filter except is_march page-scope) to count per category
    try {
        const url = new URL('api_get_data.php', window.location.origin + window.location.pathname);
        url.searchParams.append('is_march_7th', isMarch7thPage);
        const r = await fetch(url);
        const d = await r.json();
        if (d.status !== 'success') return;
        CAT_COUNTS = { all: d.products.length };
        for (const p of d.products) {
            const cid = p.category_id;
            if (cid != null) CAT_COUNTS[cid] = (CAT_COUNTS[cid] || 0) + 1;
        }
        renderCatBar();
    } catch (e) {
        console.error('Lỗi đếm category:', e);
    }
}

function renderCatBar() {
    const bar = document.getElementById('cat-bar');
    if (!bar) return;
    const active = document.getElementById('filter-category').value || '';

    let html = `<button type="button" class="cat-chip" data-cat="" data-active="${active === '' ? 'true' : 'false'}">✦ Tất cả <span class="num">${CAT_COUNTS.all ?? 0}</span></button>`;
    CATEGORIES.forEach(cat => {
        const count = CAT_COUNTS[cat.id] ?? 0;
        const isActive = String(active) === String(cat.id);
        html += `<button type="button" class="cat-chip" data-cat="${cat.id}" data-active="${isActive ? 'true' : 'false'}">${escapeHtml(cat.ten_danh_muc)} <span class="num">${count}</span></button>`;
    });
    bar.innerHTML = html;
}

document.addEventListener('click', (e) => {
    const chip = e.target.closest('#cat-bar .cat-chip');
    if (!chip) return;
    const cid = chip.dataset.cat;
    const sel = document.getElementById('filter-category');
    sel.value = cid;
    document.querySelectorAll('#cat-bar .cat-chip').forEach(c => {
        c.setAttribute('data-active', c.dataset.cat === cid ? 'true' : 'false');
    });
    loadData();
});

/* ─── Realtime character search (debounced AJAX) ─── */
let searchDebounceTimer = null;
const searchInput = document.getElementById('search-char');
const searchClearBtn = document.getElementById('search-clear');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        // Toggle clear button visibility
        if (searchClearBtn) searchClearBtn.hidden = searchInput.value === '';
        // Debounce so we don't fire on every keystroke — but still feel instant
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(loadData, 250);
    });
}
if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchClearBtn.hidden = true;
        searchInput.focus();
        loadData();
    });
}

/* Sticky-compact toolbar on scroll */
window.addEventListener('scroll', () => {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;
    if (window.scrollY > 80) {
        toolbar.classList.add('compact');
    } else {
        toolbar.classList.remove('compact');
    }
});
