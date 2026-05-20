$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$root = $PSScriptRoot
$dist = Join-Path $root "dist"

if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item -ItemType Directory -Force -Path $dist | Out-Null

$pages = @('index', 'login', 'dashboard', 'march7th')

foreach ($p in $pages) {
    Write-Host "Rendering $p.php..."
    $src = Join-Path $root "$p.php"
    $html = & php -d default_charset=UTF-8 $src | Out-String

    foreach ($q in $pages) {
        $html = $html -replace "([""'`(])$q\.php", "`$1$q.html"
    }

    $outFile = Join-Path $dist "$p.html"
    [System.IO.File]::WriteAllText($outFile, $html, (New-Object System.Text.UTF8Encoding $false))
}

$assets = @(
    'style.css',
    'app.js',
    'dashboard.js',
    'music_player.js',
    'storage_files.js',
    'supabase_client.js',
    'supabase-config.js'
)
foreach ($a in $assets) {
    $sp = Join-Path $root $a
    if (Test-Path $sp) {
        Copy-Item $sp (Join-Path $dist $a)
        Write-Host "Copied $a"
    }
}

$assetDirs = @('public', 'images')
foreach ($d in $assetDirs) {
    $sp = Join-Path $root $d
    if (Test-Path $sp) {
        Copy-Item $sp $dist -Recurse
        Write-Host "Copied $d/"
    }
}

$headers = @'
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
'@
[System.IO.File]::WriteAllText((Join-Path $dist '_headers'), $headers, (New-Object System.Text.UTF8Encoding $false))

Write-Host ""
Write-Host "Done. Output: $dist"
Write-Host "Deploy: drag the dist/ folder to Cloudflare Pages (Direct Upload) or push to Git and connect the repo."
