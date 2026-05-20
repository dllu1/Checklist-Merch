import {
    SUPABASE_CONFIGURED,
    requireSession,
    signOutAndRedirect,
    fetchProducts,
    escapeHtml,
} from './supabase_client.js';

const MARCH_GROUP = ['march 7th', 'evernight'];
const fmtVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));

function isInMarchGroup(name) {
    return MARCH_GROUP.includes((name || '').trim().toLowerCase());
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
    if (lower.includes('pin') || lower.includes('badge')) return '✧';
    return '✿';
}

function summarize(products) {
    return products.reduce((acc, p) => {
        const total = Number(p.gia || 0) * Number(p.so_luong || 0);
        acc.total += total;
        acc.qty += Number(p.so_luong || 0);
        acc.count += 1;
        if (p.da_mua) {
            acc.bought += total;
            acc.done_count += 1;
        } else {
            acc.unbought += total;
        }
        return acc;
    }, { total: 0, bought: 0, unbought: 0, count: 0, qty: 0, done_count: 0 });
}

function fillGroup(prefix, data) {
    const total = Number(data.total || 0);
    const bought = Number(data.bought || 0);
    const count = Number(data.count || 0);
    const done = Number(data.done_count || 0);

    document.getElementById(`${prefix}-total`).textContent = fmtVND(total);
    document.getElementById(`${prefix}-bought`).textContent = fmtVND(bought);
    document.getElementById(`${prefix}-unbought`).textContent = fmtVND(data.unbought || 0);
    document.getElementById(`${prefix}-total-meta`).textContent = `${count} món · ${Number(data.qty || 0)} đơn vị`;
    document.getElementById(`${prefix}-bought-meta`).textContent = `${done}/${count} đã hoàn thành`;
    document.getElementById(`${prefix}-unbought-meta`).textContent = `${count - done} món còn lại`;
    document.getElementById(`${prefix}-progress`).style.width = `${total > 0 ? (bought / total) * 100 : 0}%`;
}

function renderRecent(items) {
    const list = document.getElementById('recent-list');
    if (!items || items.length === 0) {
        list.innerHTML = '<div class="recent-item"><div class="ri-ic">✿</div><div><div class="ri-name">Chưa có hoạt động</div></div><div></div><div></div></div>';
        return;
    }

    list.innerHTML = items.map(p => {
        const total = Number(p.gia || 0) * Number(p.so_luong || 0);
        const glyph = pickGlyph(p.ten_danh_muc);
        const date = p.ngay_them ? String(p.ngay_them).slice(0, 10) : '—';
        const dotCls = p.da_mua ? 'b' : 'p';
        const cat = p.ten_danh_muc || 'Chưa phân loại';
        const shop = p.shop_ban || 'Chưa rõ';
        return `
            <div class="recent-item">
                <div class="ri-ic">${glyph}</div>
                <div>
                    <div class="ri-name">${escapeHtml(p.ten_san_pham)}</div>
                    <div class="ri-meta">${escapeHtml(cat)} · ${escapeHtml(shop)} · ${escapeHtml(date)}</div>
                </div>
                <div class="ri-price">${fmtVND(total)} ₫</div>
                <div class="ri-dot ${dotCls}" title="${dotCls === 'b' ? 'Đã mua' : 'Chưa mua'}"></div>
            </div>
        `;
    }).join('');
}

export async function initDashboard() {
    if (!SUPABASE_CONFIGURED) {
        renderRecent([]);
        return;
    }

    const session = await requireSession();
    if (!session) return;

    try {
        const products = await fetchProducts();
        const march7th = products.filter(p => isInMarchGroup(p.ten_nhan_vat));
        const others = products.filter(p => !isInMarchGroup(p.ten_nhan_vat));
        const recent = [...products]
            .sort((a, b) => String(b.ngay_them || '').localeCompare(String(a.ngay_them || '')) || Number(b.id || 0) - Number(a.id || 0))
            .slice(0, 5);

        fillGroup('m7', summarize(march7th));
        fillGroup('others', summarize(others));
        renderRecent(recent);
    } catch (error) {
        console.error('Lỗi tải dashboard:', error);
        renderRecent([]);
    }
}

window.signOutAndRedirect = signOutAndRedirect;
