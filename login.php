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
            <button type="submit" class="pm-btn pm-save">Đăng nhập</button>
            <p id="login-message" class="auth-message" role="status"></p>
        </form>
    </section>
</main>

<script src="supabase-config.js"></script>
<script type="module">
    import { SUPABASE_CONFIGURED, supabase } from './supabase_client.js';

    const form = document.getElementById('login-form');
    const message = document.getElementById('login-message');
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || 'index.php';

    if (!SUPABASE_CONFIGURED) {
        message.textContent = 'Chưa cấu hình Supabase. Hãy cập nhật supabase-config.js.';
        form.querySelector('button').disabled = true;
    } else {
        const { data } = await supabase.auth.getSession();
        if (data.session) window.location.href = next;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = '';
        const button = form.querySelector('button');
        button.disabled = true;

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        button.disabled = false;
        if (error) {
            message.textContent = 'Email hoặc mật khẩu không đúng.';
            return;
        }
        window.location.href = next;
    });
</script>
</body>
</html>
