const PAGE_FILES = new Set(['index', 'march7th', 'dashboard', 'categories']);
const CONTENT_SELECTOR = '.container';

function urlPageKey(pathname) {
    let seg = pathname.split('/').filter(Boolean).pop() || '';
    seg = seg.replace(/\.(html|php)$/i, '');
    if (!seg) seg = 'index';
    return seg.toLowerCase();
}

function isInternalAnchor(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (a.getAttribute('href')?.startsWith('#')) return false;
    if (a.hasAttribute('data-no-soft-nav')) return false;
    let url;
    try { url = new URL(a.href, location.href); } catch { return false; }
    if (url.origin !== location.origin) return false;
    return PAGE_FILES.has(urlPageKey(url.pathname));
}

function runScriptsIn(root) {
    root.querySelectorAll('script').forEach(oldScript => {
        const s = document.createElement('script');
        for (const attr of oldScript.attributes) s.setAttribute(attr.name, attr.value);
        s.textContent = oldScript.textContent;
        oldScript.replaceWith(s);
    });
}

async function callPageInit(pageKey) {
    try {
        if (pageKey === 'dashboard') {
            const mod = await import('./dashboard.js');
            await mod.initDashboard();
        } else if (pageKey === 'categories') {
            const mod = await import('./categories.js');
            await mod.initCategoriesPage();
        } else {
            const mod = await import('./app.js');
            await mod.initApp();
        }
    } catch (error) {
        console.error('Soft-nav init failed:', error);
    }
}

let navInFlight = null;

async function navigate(url, { push = true } = {}) {
    const target = new URL(url, location.href).href;
    if (navInFlight === target) return;
    navInFlight = target;

    document.body.classList.add('soft-nav-loading');
    try {
        const resp = await fetch(target, { credentials: 'same-origin', headers: { Accept: 'text/html' } });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const html = await resp.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const newContent = doc.querySelector(CONTENT_SELECTOR);
        const curContent = document.querySelector(CONTENT_SELECTOR);
        if (!newContent || !curContent) {
            location.href = target;
            return;
        }

        document.title = doc.title;
        curContent.replaceWith(newContent);
        runScriptsIn(newContent);

        if (push) history.pushState({ softNav: true, url: target }, '', target);
        window.scrollTo(0, 0);

        const pageKey = urlPageKey(new URL(target).pathname);
        await callPageInit(pageKey);
    } catch (error) {
        console.warn('Soft-nav failed, falling back to full load:', error);
        location.href = target;
    } finally {
        navInFlight = null;
        document.body.classList.remove('soft-nav-loading');
    }
}

document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== undefined && event.button !== 0) return;

    const a = event.target.closest('a');
    if (!isInternalAnchor(a)) return;

    event.preventDefault();
    const href = a.href;
    if (new URL(href).pathname === location.pathname) return;
    navigate(href);
});

window.addEventListener('popstate', () => {
    navigate(location.href, { push: false });
});

if (!history.state || !history.state.softNav) {
    history.replaceState({ softNav: true, url: location.href }, '', location.href);
}
