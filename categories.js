import {
    SUPABASE_CONFIGURED,
    requireSession,
    signOutAndRedirect,
    fetchCategories,
    fetchProducts,
    escapeHtml,
    createCategory,
    updateCategoryById,
    deleteCategoryById,
} from './supabase_client.js';

let CATEGORIES = [];
let PRODUCT_COUNTS = {};
let editingId = null;
let firstInitDone = false;

function showError(message) {
    const list = document.getElementById('cat-list');
    if (!list) return;
    list.innerHTML = `<div class="cat-list-empty">${escapeHtml(message)}</div>`;
}

async function loadData() {
    const [cats, products] = await Promise.all([fetchCategories(), fetchProducts()]);
    CATEGORIES = cats;
    PRODUCT_COUNTS = {};
    for (const p of products) {
        const cid = p.category_id;
        if (cid != null) PRODUCT_COUNTS[cid] = (PRODUCT_COUNTS[cid] || 0) + 1;
    }
    render();
}

function render() {
    const list = document.getElementById('cat-list');
    if (!list) return;

    if (CATEGORIES.length === 0) {
        list.innerHTML = '<div class="cat-list-empty">Chua co danh muc nao. Them danh muc dau tien o phia tren.</div>';
        return;
    }

    list.innerHTML = CATEGORIES.map(cat => {
        const count = PRODUCT_COUNTS[cat.id] ?? 0;
        const safeName = escapeHtml(cat.ten_danh_muc);
        const isEditing = editingId === cat.id;
        const nameBlock = isEditing
            ? `<input type="text" class="cat-row-name-input" data-edit-id="${cat.id}" value="${safeName}" autofocus>`
            : `<div class="cat-row-name">${safeName}</div>`;
        const actions = isEditing
            ? `
                <button type="button" class="cat-action save" data-action="save" data-id="${cat.id}">Luu</button>
                <button type="button" class="cat-action" data-action="cancel" data-id="${cat.id}">Huy</button>
            `
            : `
                <button type="button" class="cat-action" data-action="edit" data-id="${cat.id}">Sua</button>
                <button type="button" class="cat-action danger" data-action="delete" data-id="${cat.id}">Xoa</button>
            `;

        return `
            <div class="cat-row-item" data-id="${cat.id}">
                <div class="cat-row-icon">*</div>
                ${nameBlock}
                <span class="cat-row-count">${count} san pham</span>
                <div class="cat-row-actions">${actions}</div>
            </div>
        `;
    }).join('');
}

async function addCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (CATEGORIES.some(c => c.ten_danh_muc.toLowerCase() === trimmed.toLowerCase())) {
        alert(`Danh muc "${trimmed}" da ton tai.`);
        return;
    }
    await createCategory({ ten_danh_muc: trimmed });
    await loadData();
}

async function updateCategory(id, newName) {
    const trimmed = newName.trim();
    if (!trimmed) {
        alert('Ten danh muc khong duoc de trong.');
        return;
    }
    const conflict = CATEGORIES.find(c =>
        c.id !== id && c.ten_danh_muc.toLowerCase() === trimmed.toLowerCase()
    );
    if (conflict) {
        alert(`Da co danh muc "${trimmed}".`);
        return;
    }
    await updateCategoryById(id, { ten_danh_muc: trimmed });
    editingId = null;
    await loadData();
}

async function deleteCategory(id) {
    const cat = CATEGORIES.find(c => c.id === id);
    if (!cat) return;
    const count = PRODUCT_COUNTS[id] ?? 0;
    const warning = count > 0
        ? `Danh muc "${cat.ten_danh_muc}" dang co ${count} san pham. Khi xoa, cac san pham nay se tro thanh chua phan loai. Tiep tuc?`
        : `Xoa danh muc "${cat.ten_danh_muc}"?`;
    if (!confirm(warning)) return;

    await deleteCategoryById(id);
    await loadData();
}

function wireEvents() {
    document.addEventListener('submit', async (e) => {
        if (e.target.id !== 'cat-add-form') return;
        e.preventDefault();
        const input = document.getElementById('cat-new-name');
        if (!input) return;
        try {
            await addCategory(input.value);
            input.value = '';
            input.focus();
        } catch (error) {
            console.error(error);
            alert(`Loi them danh muc: ${error.message}`);
        }
    });

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.cat-action');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'edit') {
            editingId = id;
            render();
            return;
        }
        if (action === 'cancel') {
            editingId = null;
            render();
            return;
        }
        if (action === 'save') {
            const input = document.querySelector(`.cat-row-name-input[data-edit-id="${id}"]`);
            if (!input) return;
            try {
                await updateCategory(id, input.value);
            } catch (error) {
                console.error(error);
                alert(`Loi cap nhat: ${error.message}`);
            }
            return;
        }
        if (action === 'delete') {
            try {
                await deleteCategory(id);
            } catch (error) {
                console.error(error);
                alert(`Loi xoa: ${error.message}`);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const input = e.target.closest('.cat-row-name-input');
        if (!input) return;
        e.preventDefault();
        updateCategory(input.dataset.editId, input.value).catch(error => {
            console.error(error);
            alert(`Loi cap nhat: ${error.message}`);
        });
    });
}

export async function initCategoriesPage() {
    if (!SUPABASE_CONFIGURED) {
        showError('Chua cau hinh Cloudflare API.');
        return;
    }

    if (!firstInitDone) {
        const session = await requireSession();
        if (!session) return;
        wireEvents();
        firstInitDone = true;
    }

    try {
        await loadData();
    } catch (error) {
        console.error('Loi tai danh muc:', error);
        showError(error.message || 'Khong tai duoc danh muc.');
    }
}

window.signOutAndRedirect = signOutAndRedirect;
