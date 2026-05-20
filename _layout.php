<?php
declare(strict_types=1);

/**
 * Shared layout fragments (background, hero, footer) for Checklist Merch.
 */

function render_bg(): void
{ ?>
    <div class="bg-wrap" aria-hidden="true">
        <div class="bg-grid"></div>
        <div class="bg-stars" id="bg-stars"></div>
    </div>
    <script>
        (function () {
            const wrap = document.getElementById('bg-stars');
            if (!wrap) return;
            const shapes = [
                `<svg width="W" height="H" viewBox="0 0 24 24"><path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" fill="COLOR"/></svg>`,
                `<svg width="W" height="H" viewBox="0 0 24 24"><path d="M12 1 L22 7 L22 17 L12 23 L2 17 L2 7 Z" fill="none" stroke="COLOR" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 1 L12 23 M2 7 L22 17 M22 7 L2 17" stroke="COLOR" stroke-width="0.8" stroke-opacity="0.6"/></svg>`,
                `<svg width="W" height="H" viewBox="0 0 24 24"><g fill="COLOR"><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(0 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(72 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(144 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(216 12 12)"/><path d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform="rotate(288 12 12)"/><circle cx="12" cy="12" r="1.6" fill="#fff" opacity="0.6"/></g></svg>`,
                `<svg width="W" height="H" viewBox="0 0 24 24"><g stroke="COLOR" stroke-width="1.2" stroke-linecap="round" fill="none"><line x1="12" y1="2" x2="12" y2="22"/><line x1="3.3" y1="7" x2="20.7" y2="17"/><line x1="3.3" y1="17" x2="20.7" y2="7"/><polyline points="9,4 12,2 15,4"/><polyline points="9,20 12,22 15,20"/></g></svg>`,
            ];
            const palettes = [
                ['#ff7eb0', '#ffb3d0'],
                ['#6fc7ff', '#a8dffd'],
                ['#b3a3e8', '#d3c5f0'],
            ];
            const items = [];
            for (let i = 0; i < 28; i++) {
                const size = 14 + Math.random() * 38;
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                const pal = palettes[Math.floor(Math.random() * palettes.length)];
                const color = pal[Math.floor(Math.random() * pal.length)];
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const rot = Math.random() * 360;
                const dur = 6 + Math.random() * 10;
                const delay = -Math.random() * 10;
                const opacity = 0.3 + Math.random() * 0.5;
                const svg = shape.replaceAll('W', size).replaceAll('H', size).replaceAll('COLOR', color);
                items.push(`<div style="position:absolute;left:${x}%;top:${y}%;transform:rotate(${rot}deg);opacity:${opacity};animation:drift ${dur}s ease-in-out ${delay}s infinite;">${svg}</div>`);
            }
            wrap.innerHTML = items.join('');
        })();
    </script>
<?php }

function render_crest(): void
{ ?>
    <div class="crest" aria-hidden="true">
        <svg class="ring" viewBox="0 0 100 100" width="86" height="86" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cg" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#ff7eb0"/>
                    <stop offset="50%" stop-color="#b3a3e8"/>
                    <stop offset="100%" stop-color="#6fc7ff"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#cg)" stroke-width="1.2" stroke-dasharray="2 4" opacity="0.65"/>
            <circle cx="50" cy="50" r="34" fill="none" stroke="url(#cg)" stroke-width="0.8" opacity="0.45"/>
        </svg>
        <svg class="crest-main" viewBox="0 0 100 100" width="86" height="86" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="petal" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#ff8cb8"/>
                    <stop offset="100%" stop-color="#ffc3dc"/>
                </linearGradient>
                <linearGradient id="ice" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#7fcfff"/>
                    <stop offset="100%" stop-color="#c5e8ff"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="22" fill="url(#petal)"/>
            <path d="M50 28 A22 22 0 0 1 50 72 Z" fill="url(#ice)"/>
            <g transform="translate(50 50) scale(0.9)">
                <?php foreach ([0, 72, 144, 216, 288] as $r): ?>
                    <path d="M0 -18 C 4 -10 9 -10 9 -4 C 9 4 4 8 0 8 C -4 8 -9 4 -9 -4 C -9 -10 -4 -10 0 -18 Z"
                          fill="#fff" opacity="0.92" transform="rotate(<?= $r ?>)"/>
                <?php endforeach; ?>
                <circle r="3" fill="#ffd97a"/>
            </g>
            <circle cx="50" cy="6" r="2.5" fill="#fff"/>
            <circle cx="94" cy="50" r="2" fill="#fff"/>
            <circle cx="50" cy="94" r="2" fill="#fff"/>
            <circle cx="6" cy="50" r="2.5" fill="#fff"/>
        </svg>
    </div>
<?php }

function render_hero(string $active, string $title, string $subtitle): void
{
    $today = strftime_safe();
    ?>
    <header class="hero">
        <?php render_crest(); ?>
        <div class="eyebrow">FROST<span class="dot"></span>PETAL<span class="dot"></span>COSMODYSSEY</div>
        <h1><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></h1>
        <p class="subtitle"><?= $subtitle ?></p>
        <nav>
            <a href="index.php"<?= $active === 'all' ? ' class="active"' : '' ?>>✦ Tất cả sản phẩm</a>
            <a href="march7th.php"<?= $active === 'march' ? ' class="active"' : '' ?>>✿ March 7th/Evernight</a>
            <a href="dashboard.php"<?= $active === 'dash' ? ' class="active"' : '' ?>>❄ Dashboard</a>
            <a href="#" onclick="signOutAndRedirect(); return false;">Logout</a>
        </nav>
        <div class="hero-meta">Astral Express · <?= $today ?></div>
    </header>
<?php }

function strftime_safe(): string
{
    $months = [
        1 => 'Tháng 1', 2 => 'Tháng 2', 3 => 'Tháng 3', 4 => 'Tháng 4',
        5 => 'Tháng 5', 6 => 'Tháng 6', 7 => 'Tháng 7', 8 => 'Tháng 8',
        9 => 'Tháng 9', 10 => 'Tháng 10', 11 => 'Tháng 11', 12 => 'Tháng 12',
    ];
    $m = (int) date('n');
    return date('d') . ' ' . $months[$m] . ' ' . date('Y');
}

function render_footer(): void
{ ?>
    <div class="divider">✦ ✦ ✦ End of Trailblaze Log ✦ ✦ ✦</div>
    <div class="footer">
        <span>FROST · PETAL · v2.4 · CHECKLIST MERCH</span>
        <span>Made with ❄ &amp; ✿ for March 7th fans</span>
    </div>
<?php }
