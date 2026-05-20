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
    <title>Đăng nhập · Checklist Merch</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="auth-page">
<?php render_bg(); ?>

<main class="auth-shell">
    <section class="auth-card">
        <?php render_crest(); ?>
        <div class="eyebrow">FROST<span class="dot"></span>PETAL</div>
        <h1>Đăng nhập</h1>
        <p class="auth-subtitle">Truy cập checklist merch riêng tư.</p>

        <form id="login-form" class="auth-form">
            <label>
                Email
                <input id="login-email" type="email" autocomplete="email" required>
            </label>
            <label>
                Mật khẩu
                <input id="login-password" type="password" autocomplete="current-password" required>
            </label>
            <div id="login-captcha" class="auth-captcha"></div>
            <button type="submit" class="pm-btn pm-save">Đăng nhập</button>
            <p id="login-message" class="auth-message" role="status"></p>
        </form>
    </section>
</main>

<script src="supabase-config.js"></script>
<script>
    (function () {
        const siteKey = (window.MERCH_SUPABASE || {}).captchaSiteKey;
        if (!siteKey) return;
        const s = document.createElement('script');
        s.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
    })();
</script>
<script type="module">
    import { SUPABASE_CONFIGURED, supabase } from './supabase_client.js';

    const form = document.getElementById('login-form');
    const message = document.getElementById('login-message');
    const captchaEl = document.getElementById('login-captcha');
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || 'index.php';
    const captchaSiteKey = (window.MERCH_SUPABASE || {}).captchaSiteKey || '';
    let captchaWidgetId = null;

    function getCaptchaToken() {
        if (!captchaSiteKey || !window.hcaptcha || captchaWidgetId === null) return '';
        return window.hcaptcha.getResponse(captchaWidgetId) || '';
    }

    function resetCaptcha() {
        if (captchaSiteKey && window.hcaptcha && captchaWidgetId !== null) {
            window.hcaptcha.reset(captchaWidgetId);
        }
    }

    async function waitForHcaptcha(timeoutMs = 8000) {
        const start = Date.now();
        while (!window.hcaptcha) {
            if (Date.now() - start > timeoutMs) throw new Error('Không tải được hCaptcha. Kiểm tra kết nối mạng.');
            await new Promise(r => setTimeout(r, 100));
        }
    }

    if (!SUPABASE_CONFIGURED) {
        message.textContent = 'Chưa cấu hình Supabase. Hãy cập nhật supabase-config.js.';
        form.querySelector('button').disabled = true;
    } else {
        const { data } = await supabase.auth.getSession();
        if (data.session) window.location.href = next;

        if (captchaSiteKey) {
            try {
                await waitForHcaptcha();
                captchaWidgetId = window.hcaptcha.render(captchaEl, { sitekey: captchaSiteKey, theme: 'light' });
            } catch (err) {
                message.textContent = err.message;
            }
        }
    }

    function describeAuthError(error) {
        const raw = (error?.message || '').toLowerCase();
        const code = error?.code || '';
        if (raw.includes('email not confirmed') || code === 'email_not_confirmed') {
            return 'Email chưa được xác nhận. Hãy kiểm tra hộp thư để xác nhận trước khi đăng nhập.';
        }
        if (raw.includes('invalid login credentials') || code === 'invalid_credentials') {
            return 'Email hoặc mật khẩu không đúng.';
        }
        if (raw.includes('too many requests') || code === 'over_request_rate_limit') {
            return 'Đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.';
        }
        if (raw.includes('user not found')) {
            return 'Không tìm thấy tài khoản với email này.';
        }
        return error?.message || 'Đăng nhập thất bại.';
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
                message.textContent = 'Vui lòng hoàn tất CAPTCHA trước khi đăng nhập.';
                button.disabled = false;
                return;
            }
            credentials.options = { captchaToken: token };
        }

        const { error } = await supabase.auth.signInWithPassword(credentials);

        button.disabled = false;
        if (error) {
            console.error('Supabase signIn error:', error);
            message.textContent = describeAuthError(error);
            resetCaptcha();
            return;
        }
        window.location.href = next;
    });
</script>
</body>
</html>
