import {
    SUPABASE_CONFIGURED,
    supabase,
    requireSession,
    signOutAndRedirect,
    fetchProducts,
    fetchCategories,
    getSignedUrl,
    escapeHtml,
} from './supabase_client.js';
import {
    PRODUCT_IMAGE_RULES,
    validateFile,
    makeObjectUrl,
    revokeObjectUrl,
    buildStoragePath,
    uploadBlob,
} from './storage_files.js';

function isMarch7thPage() {
    return /(?:^|\/)march7th(?:\.php|\.html)?(?:[/?#]|$)/i.test(window.location.pathname);
}

const MARCH_GROUP = ['march 7th', 'evernight'];
const PRODUCT_IMAGE_BUCKET = 'product-images';

let CATEGORIES = [];
let ALL_PRODUCTS = [];
let previewObjectUrl = '';

function isInMarchGroup(name) {
    return MARCH_GROUP.includes((name || '').trim().toLowerCase());
}

function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(number) || 0);
}

/**
 * Parse a money input that may use "k" shorthand.
 * "10k" -> 10000, "1.5k" -> 1500, "150,000" -> 150000.
 */
function parseMoneyInput(raw) {
    if (raw == null) return 0;
    const cleaned = String(raw).trim().toLowerCase().replace(/[\s,_đvnd₫]+/g, '');
    if (!cleaned) return 0;
    const match = cleaned.match(/^(-?\d+(?:\.\d+)?)(k|m)?$/);
    if (!match) {
        const fallback = Number(cleaned.replace(/[^\d.-]/g, ''));
        return Number.isFinite(fallback) ? Math.max(0, Math.round(fallback)) : 0;
    }
    const value = Number(match[1]);
    if (!Number.isFinite(value)) return 0;
    const multiplier = match[2] === 'm' ? 1_000_000 : match[2] === 'k' ? 1000 : 1;
    return Math.max(0, Math.round(value * multiplier));
}

function updateMoneyPreview() {
    const input = document.getElementById('form-gia');
    const preview = document.getElementById('pm-money-preview');
    if (!input || !preview) return;
    preview.textContent = `= ${formatCurrency(parseMoneyInput(input.value))}`;
}

function setMoneyInput(value) {
    const input = document.getElementById('form-gia');
    if (!input) return;
    const amount = Math.max(0, Math.round(Number(value) || 0));
    input.value = amount === 0 ? '' : String(amount);
    updateMoneyPreview();
}

function addToMoneyInput(delta) {
    const input = document.getElementById('form-gia');
    if (!input) return;
    setMoneyInput(parseMoneyInput(input.value) + Number(delta || 0));
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
    if (isMarch7thPage()) {
        return products.filter(p => isInMarchGroup(p.ten_nhan_vat));
    }
    return products.filter(p => !isInMarchGroup(p.ten_nhan_vat));
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
        if (search !== '') {
            const hay = `${p.ten_nhan_vat || ''} ${p.ten_san_pham || ''} ${p.shop_ban || ''} ${p.nguoi_mua || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
        }
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
        setMoneyInput(productData.gia || 0);
        document.getElementById('form-soluong').value = productData.so_luong || 1;
        const categorySelect = document.getElementById('form-category');
        categorySelect.value = productData.category_id || '';
        categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('form-nhanvat').value = productData.ten_nhan_vat || '';
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
        document.getElementById('form-category').dispatchEvent(new Event('change', { bubbles: true }));
        setMoneyInput(0);
        if (isMarch7thPage()) document.getElementById('form-nhanvat').value = 'March 7th';
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
    revokeObjectUrl(previewObjectUrl);
    previewObjectUrl = '';
    const def = document.getElementById('pm-drop-default');
    const prev = document.getElementById('pm-drop-prev');
    if (def) def.hidden = false;
    if (prev) prev.hidden = true;
}

function showFilePreview(file) {
    if (!file) return;
    revokeObjectUrl(previewObjectUrl);
    previewObjectUrl = makeObjectUrl(file);
    document.getElementById('pm-prev-img').src = previewObjectUrl;
    document.getElementById('pm-prev-name').textContent = file.name;
    document.getElementById('pm-prev-size').textContent = `${(file.size / 1024).toFixed(1)} KB · Click hoặc kéo file khác để thay`;
    document.getElementById('pm-drop-default').hidden = true;
    document.getElementById('pm-drop-prev').hidden = false;
}

async function uploadProductImage(file) {
    if (!file) return '';
    const validated = await validateFile(file, PRODUCT_IMAGE_RULES);
    const path = buildStoragePath(file, 'products', validated.extension);
    await uploadBlob(supabase.storage, PRODUCT_IMAGE_BUCKET, path, file, {
        contentType: validated.contentType,
        metadata: validated.metadata,
    });
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
            gia: parseMoneyInput(document.getElementById('form-gia').value),
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
    } catch (error) {
        console.error('Lỗi tải danh mục:', error);
    }
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

        const moneyChip = e.target.closest('#pm-quick-money .pm-money-chip');
        if (moneyChip) {
            if (moneyChip.dataset.clear === '1') {
                setMoneyInput(0);
            } else {
                addToMoneyInput(Number(moneyChip.dataset.add || 0));
            }
            return;
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.id === 'form-gia') updateMoneyPreview();
    });
    document.addEventListener('blur', (e) => {
        if (e.target.id === 'form-gia') {
            const parsed = parseMoneyInput(e.target.value);
            e.target.value = parsed === 0 ? '' : String(parsed);
            updateMoneyPreview();
        }
    }, true);

    document.addEventListener('change', async (e) => {
        if (e.target.id === 'form-hinh') {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
                await validateFile(f, PRODUCT_IMAGE_RULES);
                showFilePreview(f);
            } catch (error) {
                alert(error.message);
                resetDropZone();
            }
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
    document.addEventListener('drop', async (e) => {
        const drop = e.target.closest('#pm-drop');
        if (!drop) return;
        e.preventDefault();
        drop.setAttribute('data-over', 'false');
        const f = e.dataTransfer.files?.[0];
        if (f) {
            try {
                await validateFile(f, PRODUCT_IMAGE_RULES);
                const file = document.getElementById('form-hinh');
                const dt = new DataTransfer();
                dt.items.add(f);
                file.files = dt.files;
                showFilePreview(f);
            } catch (error) {
                alert(error.message);
                resetDropZone();
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('#btn-add-product')) {
            openModal(false);
            return;
        }
        const overlayEl = document.getElementById('product-modal');
        if (overlayEl && e.target === overlayEl && overlayEl.classList.contains('active')) {
            closeModal();
        }
    });

    let searchDebounceTimer = null;
    document.addEventListener('input', (e) => {
        if (e.target.id === 'search-char') {
            const clearBtn = document.getElementById('search-clear');
            if (clearBtn) clearBtn.hidden = e.target.value === '';
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(loadData, 250);
        }
    });
    document.addEventListener('click', (e) => {
        if (e.target.closest('#search-clear')) {
            const input = document.getElementById('search-char');
            const clearBtn = document.getElementById('search-clear');
            if (input) { input.value = ''; input.focus(); }
            if (clearBtn) clearBtn.hidden = true;
            loadData();
        }
    });

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

let firstInitDone = false;

export async function initApp() {
    if (!SUPABASE_CONFIGURED) {
        showLoadError('Chưa cấu hình Supabase. Hãy cập nhật supabase-config.js.');
        return;
    }

    if (!firstInitDone) {
        const session = await requireSession();
        if (!session) return;
        wireEvents();
        firstInitDone = true;
    }

    await loadCategories();
    await loadData();
}

window.loadData = loadData;
window.openModal = openModal;
window.closeModal = closeModal;
window.submitForm = submitForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.toggleBuyStatus = toggleBuyStatus;
window.signOutAndRedirect = signOutAndRedirect;
