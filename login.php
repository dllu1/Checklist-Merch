<?php
declare(strict_types=1);
require __DIR__ . '/_layout.php';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="public/march7th.png?v=20260520">
    <link rel="shortcut icon" type="image/png" href="public/march7th.png?v=20260520">
    <title>Dang nhap - Checklist Merch</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="auth-page">
<?php render_bg(); ?>

<main class="auth-shell">
    <section class="auth-card">
        <?php render_crest(); ?>
        <div class="eyebrow">FROST<span class="dot"></span>PETAL</div>
        <h1>Dang nhap</h1>
        <p class="auth-subtitle">Truy cap checklist merch rieng tu.</p>
        <div class="theme-bar" aria-label="Giao dien">
            <button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false">
                <span class="theme-toggle-ic" aria-hidden="true"></span>
                <span data-theme-label>March 7th</span>
            </button>
        </div>

        <form id="login-form" class="auth-form">
            <label>
                Email
                <input id="login-email" type="email" autocomplete="email" required>
            </label>
            <label>
                Mat khau
                <input id="login-password" type="password" autocomplete="current-password" required>
            </label>
            <div id="login-captcha" class="auth-captcha"></div>
            <button type="submit" class="pm-btn pm-save">Dang nhap</button>
            <p id="login-message" class="auth-message" role="status"></p>
        </form>
    </section>
</main>

<script src="supabase-config.js"></script>
<script type="module">
    import { getSession } from './supabase_client.js';
    import { initThemeControls } from './ui_controls.js';

    initThemeControls();

    const form = document.getElementById('login-form');
    const message = document.getElementById('login-message');
    const captchaEl = document.getElementById('login-captcha');
    const params = new URLSearchParams(window.location.search);
    const isStatic = !window.location.pathname.endsWith('.php');
    const next = params.get('next') || (isStatic ? 'index.html' : 'index.php');
    const captchaSiteKey = (window.MERCH_CLOUDFLARE || {}).turnstileSiteKey || '';
    let captchaWidgetId = null;

    function getCaptchaToken() {
        if (!captchaSiteKey || !window.turnstile || captchaWidgetId === null) return '';
        return window.turnstile.getResponse(captchaWidgetId) || '';
    }

    function resetCaptcha() {
        if (captchaSiteKey && window.turnstile && captchaWidgetId !== null) {
            window.turnstile.reset(captchaWidgetId);
        }
    }

    async function waitForTurnstile(timeoutMs = 8000) {
        const start = Date.now();
        while (!window.turnstile) {
            if (Date.now() - start > timeoutMs) throw new Error('Khong tai duoc Turnstile.');
            await new Promise(r => setTimeout(r, 100));
        }
    }

    try {
        const session = await getSession();
        if (session) window.location.href = next;
    } catch {
        // Not logged in yet.
    }

    if (captchaSiteKey) {
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);

        try {
            await waitForTurnstile();
            captchaWidgetId = window.turnstile.render(captchaEl, { sitekey: captchaSiteKey, theme: 'light' });
        } catch (err) {
            message.textContent = err.message;
        }
    }

    function describeAuthError(error) {
        if (error?.turnstileCodes?.length) {
            return `Xac minh Turnstile that bai: ${error.turnstileCodes.join(', ')}`;
        }
        if (error?.authCode === 'invalid_password') {
            return 'Email hoac mat khau khong dung.';
        }
        const raw = (error?.message || '').toLowerCase();
        if (raw.includes('incorrect') || raw.includes('invalid') || raw.includes('401')) {
            return 'Email hoac mat khau khong dung.';
        }
        if (raw.includes('turnstile')) {
            return 'Xac minh Turnstile that bai. Vui long thu lai.';
        }
        return error?.message || 'Dang nhap that bai.';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = '';
        const button = form.querySelector('button');
        button.disabled = true;

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const credentials = { email, password };

        if (captchaSiteKey) {
            const token = getCaptchaToken();
            if (!token) {
                message.textContent = 'Vui long hoan tat Turnstile truoc khi dang nhap.';
                button.disabled = false;
                return;
            }
            credentials.turnstileToken = token;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                const error = new Error(data.message || 'Login failed.');
                error.turnstileCodes = data.turnstileCodes || [];
                error.authCode = data.authCode || '';
                throw error;
            }
            window.location.href = next;
        } catch (error) {
            console.error('Cloudflare login error:', error);
            message.textContent = describeAuthError(error);
            resetCaptcha();
            button.disabled = false;
        }
    });
</script>
</body>
</html>
