param(
    [string]$Database = "merch_db",
    [string]$Bucket = "merch-product-images",
    [string]$Prefix = "products/",
    [switch]$Remote,
    [switch]$Execute
)

$ErrorActionPreference = "Stop"

function Invoke-WranglerJson {
    param([string[]]$Arguments)

    $output = & npx.cmd @Arguments 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Wrangler command failed: npx.cmd $($Arguments -join ' ')"
    }

    $text = ($output -join "`n")
    $start = $text.IndexOf("[")
    if ($start -lt 0) { return $null }
    return $text.Substring($start) | ConvertFrom-Json
}

$dbArgs = @(
    "wrangler", "d1", "execute", $Database,
    "--command", "SELECT hinh_san_pham FROM products WHERE hinh_san_pham LIKE 'products/%'"
)
if ($Remote) { $dbArgs += "--remote" } else { $dbArgs += "--local" }

$dbResult = Invoke-WranglerJson -Arguments $dbArgs
$used = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($batch in $dbResult) {
    foreach ($row in $batch.results) {
        if ($row.hinh_san_pham) { [void]$used.Add([string]$row.hinh_san_pham) }
    }
}

$listArgs = @("wrangler", "r2", "object", "list", $Bucket, "--prefix", $Prefix)
if ($Remote) { $listArgs += "--remote" } else { $listArgs += "--local" }

$objectsRaw = & npx.cmd @listArgs
if ($LASTEXITCODE -ne 0) {
    throw "Wrangler R2 list failed. Your Wrangler version may not support 'r2 object list'. Use Cloudflare Dashboard for manual cleanup, or upgrade Wrangler when this command is available."
}

$objectsText = ($objectsRaw -join "`n")
$jsonStart = $objectsText.IndexOf("[")
if ($jsonStart -lt 0) {
    Write-Host "No R2 objects found."
    exit 0
}

$objects = $objectsText.Substring($jsonStart) | ConvertFrom-Json
$unused = @()
foreach ($object in $objects) {
    $key = [string]($object.key ?? $object.name)
    if ($key -and -not $used.Contains($key)) {
        $unused += $key
    }
}

if ($unused.Count -eq 0) {
    Write-Host "No unused product images found."
    exit 0
}

Write-Host "Unused product images:"
$unused | ForEach-Object { Write-Host "  $_" }

if (-not $Execute) {
    Write-Host ""
    Write-Host "Dry run only. Re-run with -Execute to delete these objects."
    exit 0
}

foreach ($key in $unused) {
    Write-Host "Deleting r2://$Bucket/$key"
    $deleteArgs = @("wrangler", "r2", "object", "delete", "$Bucket/$key")
    if ($Remote) { $deleteArgs += "--remote" } else { $deleteArgs += "--local" }
    & npx.cmd @deleteArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Delete failed: $key"
    }
}
