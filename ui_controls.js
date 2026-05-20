const THEME_KEY = 'merch-theme';
const THEME_COOKIE = 'merch_theme';
const DARK_THEME = 'evernight';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getCookie(name) {
    const prefix = `${encodeURIComponent(name)}=`;
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(prefix))
        ?.slice(prefix.length) || '';
}

function setCookie(name, value, maxAge = COOKIE_MAX_AGE) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

function getStoredTheme() {
    const cookieTheme = decodeURIComponent(getCookie(THEME_COOKIE));
    if (cookieTheme === DARK_THEME || cookieTheme === 'light') return cookieTheme;

    try {
        return localStorage.getItem(THEME_KEY) === DARK_THEME ? DARK_THEME : 'light';
    } catch {
        return 'light';
    }
}

function setTheme(theme) {
    const next = theme === DARK_THEME ? DARK_THEME : 'light';
    document.documentElement.dataset.theme = next;
    try {
        localStorage.setItem(THEME_KEY, next);
    } catch {
        // localStorage may be unavailable in private contexts.
    }
    setCookie(THEME_COOKIE, next);

    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
        button.setAttribute('aria-pressed', next === DARK_THEME ? 'true' : 'false');
        button.querySelector('[data-theme-label]').textContent = next === DARK_THEME ? 'Evernight' : 'March 7th';
    });

    document.querySelectorAll('[data-theme-text]').forEach(element => {
        const text = next === DARK_THEME ? element.dataset.darkText : element.dataset.lightText;
        if (text) element.textContent = text;
    });
}

export function initThemeControls(root = document) {
    setTheme(getStoredTheme());

    root.querySelectorAll('[data-theme-toggle]').forEach(button => {
        if (button.dataset.themeReady === 'true') return;
        button.dataset.themeReady = 'true';
        button.addEventListener('click', () => {
            const current = document.documentElement.dataset.theme === DARK_THEME ? 'light' : DARK_THEME;
            setTheme(current);
        });
    });
}

function optionLabel(option) {
    return option?.textContent?.trim() || '';
}

function syncCustomSelect(select, host) {
    const trigger = host.querySelector('.cs-trigger');
    const menu = host.querySelector('.cs-menu');
    const selected = select.selectedOptions[0] || select.options[0];
    trigger.querySelector('.cs-value').textContent = optionLabel(selected);

    menu.innerHTML = '';
    Array.from(select.options).forEach(option => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'cs-option';
        item.dataset.value = option.value;
        item.textContent = optionLabel(option);
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', option.selected ? 'true' : 'false');
        item.addEventListener('click', () => {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            host.dataset.open = 'false';
            syncCustomSelect(select, host);
            trigger.focus();
        });
        menu.appendChild(item);
    });
}

function enhanceSelect(select) {
    if (select.dataset.customSelect === 'true') return;
    select.dataset.customSelect = 'true';

    const host = document.createElement('div');
    host.className = 'custom-select';
    host.dataset.open = 'false';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cs-trigger fld';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="cs-value"></span><span class="cs-arrow" aria-hidden="true"></span>';

    const menu = document.createElement('div');
    menu.className = 'cs-menu';
    menu.setAttribute('role', 'listbox');

    select.classList.add('cs-native');
    select.after(host);
    host.append(select, trigger, menu);

    trigger.addEventListener('click', () => {
        const nextOpen = host.dataset.open !== 'true';
        closeCustomSelects(host);
        host.dataset.open = nextOpen ? 'true' : 'false';
        trigger.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    });

    trigger.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            host.dataset.open = 'false';
            trigger.setAttribute('aria-expanded', 'false');
        }
    });

    select.addEventListener('change', () => syncCustomSelect(select, host));
    new MutationObserver(() => syncCustomSelect(select, host)).observe(select, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['selected'],
    });

    syncCustomSelect(select, host);
}

function closeCustomSelects(except = null) {
    document.querySelectorAll('.custom-select[data-open="true"]').forEach(host => {
        if (host === except) return;
        host.dataset.open = 'false';
        host.querySelector('.cs-trigger')?.setAttribute('aria-expanded', 'false');
    });
}

export function initCustomSelects(root = document) {
    root.querySelectorAll('select.fld-select, select.pm-select').forEach(enhanceSelect);
}

document.addEventListener('click', event => {
    if (!event.target.closest('.custom-select')) closeCustomSelects();
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeCustomSelects();
});
