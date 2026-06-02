param(
    [string]$ImagesDir = "images",
    [string]$AudioDir = "audio",
    [string]$ProductImagesBucket = "merch-product-images",
    [string]$AudioBucket = "merch-audio",
    [string]$ImagePrefix = "images",
    [string]$AudioPrefix = "tracks",
    [switch]$Remote
)

$ErrorActionPreference = "Stop"

function Upload-DirectoryToR2 {
    param(
        [string]$Directory,
        [string]$Bucket,
        [string]$Prefix
    )

    if (-not (Test-Path $Directory)) {
        Write-Host "Skip missing directory: $Directory"
        return
    }

    $root = (Resolve-Path $Directory).Path.TrimEnd('\', '/')
    $files = Get-ChildItem -Path $root -Recurse -File
    if ($files.Count -eq 0) {
        Write-Host "No files in $Directory"
        return
    }

    foreach ($file in $files) {
        $fullName = $file.FullName
        if (-not $fullName.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "File is outside upload root: $fullName"
        }
        $relative = $fullName.Substring($root.Length).TrimStart('\', '/').Replace('\', '/')
        $key = if ($Prefix) { "$Prefix/$relative" } else { $relative }
        $target = "$Bucket/$key"
        Write-Host "Uploading $($file.FullName) -> r2://$target"

        $args = @("wrangler", "r2", "object", "put", $target, "--file", $file.FullName)
        if ($Remote) { $args += "--remote" }
        & npx.cmd @args
        if ($LASTEXITCODE -ne 0) {
            throw "Upload failed: $($file.FullName)"
        }
    }
}

Upload-DirectoryToR2 -Directory $ImagesDir -Bucket $ProductImagesBucket -Prefix $ImagePrefix
Upload-DirectoryToR2 -Directory $AudioDir -Bucket $AudioBucket -Prefix $AudioPrefix
