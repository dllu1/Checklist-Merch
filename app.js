import {
    SUPABASE_CONFIGURED,
    supabase,
    requireSession,
    signOutAndRedirect,
    fetchProducts,
    fetchCategories,
    getSignedUrl,
    makeStoragePath,
    escapeHtml,
} from './supabase_client.js';

const currentPath = window.location.pathname;
const isMarch7thPage = currentPath.includes('march7th.php');

const MARCH_GROUP = ['march 7th', 'evernight'];
const PRODUCT_IMAGE_BUCKET = 'product-images';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

let CATEGORIES = [];
let CAT_COUNTS = {};
let ALL_PRODUCTS = [];

function isInMarchGroup(name) {
    return MARCH_GROUP.includes((name || '').trim().toLowerCase());
}

function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(number) || 0);
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
    if (lower.includes('figure')) return '✿';
    if (lower.includes('pin') || lower.includes('badge')) return '✧';
    if (lower.includes('artbook') || lower.includes('book')) return '✦';
    return '✿';
}

function getScopedProducts(products) {
    return products.filter(p => isMarch7thPage
        ? isInMarchGroup(p.ten_nhan_vat)
        : !isInMarchGroup(p.ten_nhan_vat));
}

function applyFilters(products) {
    const categoryId = document.getElementById('filter-category')?.value || '';
    const minPrice = document.getElementById('min-price')?.value || '';
    const maxPrice = document.getElementById('max-price')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    const search = document.getElementById('search-char')?.value.trim().toLowerCase() || '';

    return products.filter(p => {
        if (categoryId !== '' && String(p.category_id || '') !== categoryId) return false;
        if (minPrice !== '' && Number(p.gia) < Number(minPrice)) return false;
        if (maxPrice !== '' && Number(p.gia) > Number(maxPrice)) return false;
        if (status !== '' && Number(p.da_mua ? 1 : 0) !== Number(status)) return false;
        if (search !== '' && !String(p.ten_nhan_vat || '').toLowerCase().includes(search)) return false;
        return true;
    });
}

function sortProducts(products) {
    const sortValue = document.getElementById('sort-by')?.value || 'ngay_them-DESC';
    const [sortBy, order] = sortValue.split('-');
    const dir = order === 'ASC' ? 1 : -1;

    return [...products].sort((a, b) => {
        const av = a[sortBy] ?? '';
        const bv = b[sortBy] ?? '';
        if (['gia', 'so_luong'].includes(sortBy)) return (Number(av) - Number(bv)) * dir;
        return String(av).localeCompare(String(bv), 'vi', { numeric: true, sensitivity: 'base' }) * dir;
    });
}

function updateTotals(products) {
    if (!document.getElementById('tong-toan-bo')) return;

    const totals = products.reduce((acc, p) => {
        const total = Number(p.gia || 0) * Number(p.so_luong || 0);
        acc.all += total;
        if (p.da_mua) acc.bought += total;
        else acc.pending += total;
        return acc;
    }, { all: 0, bought: 0, pending: 0 });

    document.getElementById('tong-toan-bo').innerText = formatCurrency(totals.all);
    document.getElementById('tong-da-mua').innerText = formatCurrency(totals.bought);
    document.getElementById('tong-chua-mua').innerText = formatCurrency(totals.pending);
}

async function loadData() {
    try {
        ALL_PRODUCTS = await fetchProducts();
        const scoped = getScopedProducts(ALL_PRODUCTS);
        const filtered = sortProducts(applyFilters(scoped));
        updateTotals(filtered);
        await renderProducts(filtered);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        showLoadError(error.message);
    }
}

function showLoadError(message) {
    const listContainer = document.getElementById('product-list');
    if (!listContainer) return;
    listContainer.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
}

async function renderProducts(products) {
    const listContainer = document.getElementById('product-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const countEl = document.getElementById('product-count');
    if (countEl) countEl.textContent = `${products.length} MÓN`;

    if (products.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">Không tìm thấy món nào.</p>';
        return;
    }

    const cards = await Promise.all(products.map(async (p, index) => {
        const categoryName = p.ten_danh_muc || 'Chưa phân loại';
        const isBought = Boolean(p.da_mua);
        const nextStatus = isBought ? 0 : 1;
        const isMarch = isInMarchGroup(p.ten_nhan_vat);
        const glyph = pickGlyph(categoryName);
        const imgUrl = await getSignedUrl(PRODUCT_IMAGE_BUCKET, p.hinh_san_pham);

        const cardClasses = ['product-card'];
        if (isBought) cardClasses.push('status-bought');
        if (isMarch) cardClasses.push('is-march');

        const badgeClass = isBought ? 'badge-status badge-da-mua' : 'badge-status badge-chua-mua';
        const badgeText = isBought ? '✓ Đã mua' : '◇ Chưa mua';
        const imgTag = imgUrl
            ? `<img class="card-img" src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.ten_san_pham)}" onerror="this.outerHTML='<div class=\\'card-img-placeholder\\'>${glyph}</div>'">`
            : `<div class="card-img-placeholder">${glyph}</div>`;

        const nhanVatTag = p.ten_nhan_vat
            ? `<span><span class="k">Nhân vật</span><b>${escapeHtml(p.ten_nhan_vat)}</b></span>`
            : '';
        const nguoiMuaTag = `<span><span class="k">Người mua</span><b>${escapeHtml(p.nguoi_mua || 'Chưa có')}</b></span>`;
        const marchTag = isMarch ? ` <span class="march-tag">✿ ${escapeHtml(p.ten_nhan_vat)}</span>` : '';
        const tongTienSanPham = Number(p.gia || 0) * Number(p.so_luong || 0);

        return `
            <article class="${cardClasses.join(' ')}" style="animation-delay: ${index * 0.04}s">
                ${imgTag}
                <div class="card-body">
                    <h3 class="card-title">${escapeHtml(p.ten_san_pham)}${marchTag}</h3>
                    <p class="card-price">${formatCurrency(p.gia)}</p>
                    <div class="card-meta">
                        <span><span class="k">Số lượng</span><b>${Number(p.so_luong || 0)}</b></span>
                        <span><span class="k">Tổng</span><b>${formatCurrency(tongTienSanPham)}</b></span>
                        <span><span class="k">Loại</span><b>${escapeHtml(categoryName)}</b></span>
                        <span><span class="k">Shop</span><b>${escapeHtml(p.shop_ban || 'Chưa rõ')}</b></span>
                        ${nhanVatTag}
                        ${nguoiMuaTag}
                    </div>
                    <button class="${badgeClass}" onclick="toggleBuyStatus(${p.id}, ${nextStatus})">${badgeText}</button>
                </div>
                <div class="card-actions">
                    <button class="btn-edit-card" onclick="editProduct(${p.id})">✎ Sửa</button>
                    <button class="btn-delete-card" onclick="deleteProduct(${p.id})">✕ Xóa</button>
                </div>
            </article>
        `;
    }));

    listContainer.innerHTML = cards.join('');
}

async function toggleBuyStatus(id, newStatus) {
    try {
        const { error } = await supabase
            .from('products')
            .update({ da_mua: newStatus === 1 })
            .eq('id', id);
        if (error) throw error;
        await loadData();
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Lỗi cập nhật trạng thái!');
    }
}

function openModal(isEdit = false, productData = null) {
    const overlay = document.getElementById('product-modal');
    overlay.classList.add('active');
    overlay.style.display = '';

    const titleEl = document.getElementById('modal-title');
    const eyebrowEl = document.getElementById('modal-eyebrow');
    const saveLbl = document.getElementById('save-label');

    if (isEdit && productData) {
        titleEl.textContent = 'Sửa Sản Phẩm';
        eyebrowEl.textContent = 'EDIT · MERCH';
        saveLbl.textContent = 'Cập nhật';
        document.getElementById('form-id').value = productData.id;
        document.getElementById('form-ten').value = productData.ten_san_pham || '';
        document.getElementById('form-gia').value = productData.gia || '';
        document.getElementById('form-soluong').value = productData.so_luong || 1;
        document.getElementById('form-category').value = productData.category_id || '';
        document.getElementById('form-nhanvat').value = productData.ten_nhan_vat || 'March 7th';
        document.getElementById('form-shop').value = productData.shop_ban || '';
        document.getElementById('form-nguoimua').value = productData.nguoi_mua || '';
        document.getElementById('form-glyph').value = productData.glyph || '✿';
        syncGlyphPicker();
        resetDropZone();
    } else {
        titleEl.textContent = 'Thêm Sản Phẩm Mới';
        eyebrowEl.textContent = 'NEW · MERCH';
        saveLbl.textContent = 'Lưu Dữ Liệu';
        document.getElementById('product-form').reset();
        document.getElementById('form-id').value = '';
        document.getElementById('form-glyph').value = '✿';
        document.getElementById('form-soluong').value = 1;
        if (isMarch7thPage) document.getElementById('form-nhanvat').value = 'March 7th';
        syncGlyphPicker();
        resetDropZone();
    }

    const modal = document.getElementById('draggable-modal');
    modal.style.left = '';
    modal.style.top = '';
    modal.style.transform = '';
}

function closeModal() {
    const overlay = document.getElementById('product-modal');
    overlay.classList.remove('active');
    overlay.style.display = 'none';
}

function syncGlyphPicker() {
    const current = document.getElementById('form-glyph').value;
    document.querySelectorAll('#glyph-picker .pm-glyph').forEach(g => {
        g.setAttribute('data-active', g.dataset.glyph === current ? 'true' : 'false');
    });
}

function resetDropZone() {
    const file = document.getElementById('form-hinh');
    if (file) file.value = '';
    const def = document.getElementById('pm-drop-default');
    const prev = document.getElementById('pm-drop-prev');
    if (def) def.hidden = false;
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

async function uploadProductImage(file) {
    if (!file) return '';
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Chỉ chấp nhận JPG, PNG, WebP hoặc GIF.');
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
        throw new Error('Ảnh rỗng hoặc vượt quá 5MB.');
    }

    const path = makeStoragePath(file, 'products');
    const { error } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return path;
}

async function submitForm(e) {
    if (e) e.preventDefault();

    const form = document.getElementById('product-form');
    if (!form.reportValidity()) return;

    try {
        const id = Number(document.getElementById('form-id').value || 0);
        const file = document.getElementById('form-hinh').files?.[0] || null;
        const imagePath = await uploadProductImage(file);

        const categoryValue = document.getElementById('form-category').value;
        const payload = {
            ten_san_pham: document.getElementById('form-ten').value.trim(),
            gia: Number(document.getElementById('form-gia').value || 0),
            so_luong: Math.max(1, Number(document.getElementById('form-soluong').value || 1)),
            category_id: categoryValue ? Number(categoryValue) : null,
            ten_nhan_vat: document.getElementById('form-nhanvat').value.trim() || null,
            shop_ban: document.getElementById('form-shop').value.trim(),
            nguoi_mua: document.getElementById('form-nguoimua').value.trim() || null,
        };

        if (imagePath) payload.hinh_san_pham = imagePath;

        const result = id > 0
            ? await supabase.from('products').update(payload).eq('id', id)
            : await supabase.from('products').insert({ ...payload, da_mua: false });

        if (result.error) throw result.error;
        closeModal();
        await loadData();
        await loadCategoryCounts();
        alert('Đã lưu dữ liệu thành công!');
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
        alert(`Lỗi: ${error.message}`);
    }
}

async function editProduct(id) {
    const product = ALL_PRODUCTS.find(p => Number(p.id) === Number(id));
    if (product) openModal(true, product);
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        await loadData();
        await loadCategoryCounts();
    } catch (error) {
        console.error('Lỗi xóa:', error);
        alert(`Lỗi xóa: ${error.message}`);
    }
}

async function loadCategories() {
    try {
        CATEGORIES = await fetchCategories();
        const filterSelect = document.getElementById('filter-category');
        const formSelect = document.getElementById('form-category');

        let filterHtml = '<option value="">-- Tất cả Category --</option>';
        let formHtml = '<option value="">-- Chọn danh mục --</option>';

        CATEGORIES.forEach(cat => {
            const option = `<option value="${cat.id}">${escapeHtml(cat.ten_danh_muc)}</option>`;
            filterHtml += option;
            formHtml += option;
        });

        if (filterSelect) filterSelect.innerHTML = filterHtml;
        if (formSelect) formSelect.innerHTML = formHtml;
        renderCatBar();
    } catch (error) {
        console.error('Lỗi tải danh mục:', error);
    }
}

async function loadCategoryCounts() {
    try {
        const scoped = getScopedProducts(ALL_PRODUCTS);
        CAT_COUNTS = { all: scoped.length };
        for (const p of scoped) {
            const cid = p.category_id;
            if (cid != null) CAT_COUNTS[cid] = (CAT_COUNTS[cid] || 0) + 1;
        }
        renderCatBar();
    } catch (error) {
        console.error('Lỗi đếm category:', error);
    }
}

function renderCatBar() {
    const bar = document.getElementById('cat-bar');
    if (!bar) return;
    const active = document.getElementById('filter-category')?.value || '';

    let html = `<button type="button" class="cat-chip" data-cat="" data-active="${active === '' ? 'true' : 'false'}">✦ Tất cả <span class="num">${CAT_COUNTS.all ?? 0}</span></button>`;
    CATEGORIES.forEach(cat => {
        const count = CAT_COUNTS[cat.id] ?? 0;
        const isActive = String(active) === String(cat.id);
        html += `<button type="button" class="cat-chip" data-cat="${cat.id}" data-active="${isActive ? 'true' : 'false'}">${escapeHtml(cat.ten_danh_muc)} <span class="num">${count}</span></button>`;
    });
    bar.innerHTML = html;
}

function wireEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    document.addEventListener('click', (e) => {
        const g = e.target.closest('#glyph-picker .pm-glyph');
        if (g) {
            document.getElementById('form-glyph').value = g.dataset.glyph;
            syncGlyphPicker();
            return;
        }

        const dec = e.target.closest('#qty-dec');
        const inc = e.target.closest('#qty-inc');
        if (dec || inc) {
            const input = document.getElementById('form-soluong');
            let v = parseInt(input.value || '1', 10) || 1;
            if (dec) v = Math.max(1, v - 1);
            if (inc) v += 1;
            input.value = v;
            return;
        }

        if (e.target.closest('#pm-drop-x')) {
            e.stopPropagation();
            resetDropZone();
            return;
        }
        if (e.target.closest('#pm-drop')) {
            document.getElementById('form-hinh').click();
            return;
        }

        const chip = e.target.closest('#cat-bar .cat-chip');
        if (chip) {
            const cid = chip.dataset.cat;
            const sel = document.getElementById('filter-category');
            sel.value = cid;
            document.querySelectorAll('#cat-bar .cat-chip').forEach(c => {
                c.setAttribute('data-active', c.dataset.cat === cid ? 'true' : 'false');
            });
            loadData();
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

    const addBtn = document.getElementById('btn-add-product');
    if (addBtn) addBtn.addEventListener('click', () => openModal(false));

    const overlayEl = document.getElementById('product-modal');
    if (overlayEl) {
        overlayEl.addEventListener('mousedown', (e) => {
            if (e.target === overlayEl) closeModal();
        });
    }

    let searchDebounceTimer = null;
    const searchInput = document.getElementById('search-char');
    const searchClearBtn = document.getElementById('search-clear');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchClearBtn) searchClearBtn.hidden = searchInput.value === '';
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

    window.addEventListener('scroll', () => {
        const toolbar = document.querySelector('.toolbar');
        if (!toolbar) return;
        toolbar.classList.toggle('compact', window.scrollY > 80);
    });

    setupModalDrag();
}

function setupModalDrag() {
    const modalContent = document.getElementById('draggable-modal');
    const modalHeader = document.getElementById('modal-drag-handle');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    if (!modalHeader || !modalContent) return;

    modalHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        modalContent.style.transform = `translate(${currentX}px, ${currentY}px)`;
    });
}

async function bootstrap() {
    if (!SUPABASE_CONFIGURED) {
        showLoadError('Chưa cấu hình Supabase. Hãy cập nhật supabase-config.js.');
        return;
    }
    const session = await requireSession();
    if (!session) return;
    wireEvents();
    await loadCategories();
    await loadData();
    await loadCategoryCounts();
}

window.loadData = loadData;
window.openModal = openModal;
window.closeModal = closeModal;
window.submitForm = submitForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.toggleBuyStatus = toggleBuyStatus;
window.signOutAndRedirect = signOutAndRedirect;

bootstrap();
