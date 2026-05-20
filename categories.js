import {
    SUPABASE_CONFIGURED,
    supabase,
    requireSession,
    signOutAndRedirect,
    fetchCategories,
    fetchProducts,
    escapeHtml,
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
        list.innerHTML = '<div class="cat-list-empty">Chưa có danh mục nào. Thêm danh mục đầu tiên ở phía trên ↑</div>';
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
                <button type="button" class="cat-action save" data-action="save" data-id="${cat.id}">✓ Lưu</button>
                <button type="button" class="cat-action" data-action="cancel" data-id="${cat.id}">Huỷ</button>
            `
            : `
                <button type="button" class="cat-action" data-action="edit" data-id="${cat.id}">✎ Sửa</button>
                <button type="button" class="cat-action danger" data-action="delete" data-id="${cat.id}">✕ Xoá</button>
            `;

        return `
            <div class="cat-row-item" data-id="${cat.id}">
                <div class="cat-row-icon">✿</div>
                ${nameBlock}
                <span class="cat-row-count">${count} sản phẩm</span>
                <div class="cat-row-actions">${actions}</div>
            </div>
        `;
    }).join('');
}

async function addCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (CATEGORIES.some(c => c.ten_danh_muc.toLowerCase() === trimmed.toLowerCase())) {
        alert(`Danh mục "${trimmed}" đã tồn tại.`);
        return;
    }
    const { error } = await supabase.from('categories').insert({ ten_danh_muc: trimmed });
    if (error) throw error;
    await loadData();
}

async function updateCategory(id, newName) {
    const trimmed = newName.trim();
    if (!trimmed) {
        alert('Tên danh mục không được để trống.');
        return;
    }
    const conflict = CATEGORIES.find(c =>
        c.id !== id && c.ten_danh_muc.toLowerCase() === trimmed.toLowerCase()
    );
    if (conflict) {
        alert(`Đã có danh mục "${trimmed}".`);
        return;
    }
    const { error } = await supabase
        .from('categories')
        .update({ ten_danh_muc: trimmed })
        .eq('id', id);
    if (error) throw error;
    editingId = null;
    await loadData();
}

async function deleteCategory(id) {
    const cat = CATEGORIES.find(c => c.id === id);
    if (!cat) return;
    const count = PRODUCT_COUNTS[id] ?? 0;
    const warning = count > 0
        ? `Danh mục "${cat.ten_danh_muc}" đang có ${count} sản phẩm. Khi xoá, các sản phẩm này sẽ trở thành "Chưa phân loại". Tiếp tục?`
        : `Xoá danh mục "${cat.ten_danh_muc}"?`;
    if (!confirm(warning)) return;

    if (count > 0) {
        const { error: clearErr } = await supabase
            .from('products')
            .update({ category_id: null })
            .eq('category_id', id);
        if (clearErr) {
            alert(`Lỗi khi gỡ liên kết sản phẩm: ${clearErr.message}`);
            return;
        }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
        alert(`Lỗi khi xoá danh mục: ${error.message}`);
        return;
    }
    await loadData();
}

function wireEvents() {
    const form = document.getElementById('cat-add-form');
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
            alert(`Lỗi thêm danh mục: ${error.message}`);
        }
    });

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.cat-action');
        if (!btn) return;
        const id = Number(btn.dataset.id);
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
                alert(`Lỗi cập nhật: ${error.message}`);
            }
            return;
        }
        if (action === 'delete') {
            try {
                await deleteCategory(id);
            } catch (error) {
                console.error(error);
                alert(`Lỗi xoá: ${error.message}`);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const input = e.target.closest('.cat-row-name-input');
        if (!input) return;
        e.preventDefault();
        const id = Number(input.dataset.editId);
        updateCategory(id, input.value).catch(error => {
            console.error(error);
            alert(`Lỗi cập nhật: ${error.message}`);
        });
    });
}

export async function initCategoriesPage() {
    if (!SUPABASE_CONFIGURED) {
        showError('Chưa cấu hình Supabase. Hãy cập nhật supabase-config.js.');
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
        console.error('Lỗi tải danh mục:', error);
        showError(error.message || 'Không tải được danh mục.');
    }
}

window.signOutAndRedirect = signOutAndRedirect;
