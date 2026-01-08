Param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ======================
# Configuration
# ======================
$BaseImageDir = "public/images/chapters"
$R2Bucket     = "r2-lovegame"
$DBName       = "lovegame"

Write-Host "=== Deploy chapters to Cloudflare (R2 + D1) ==="
if ($DryRun) {
    Write-Host "Mode: DRY RUN (no changes will be made)"
}

# ======================
# Helpers
# ======================

function Get-ChapterIdFromFolder {
    param(
        [string]$Name,
        [int]$Index
    )

    $m = [regex]::Match($Name, '(\d+)(?:\.(\d+))?')
    if ($m.Success) {
        $major = [int]$m.Groups[1].Value
        if ($m.Groups[2].Success) {
            $minor = $m.Groups[2].Value
            return ("chapter-{0:D3}-{1}" -f $major, $minor)
        } else {
            return ("chapter-{0:D3}" -f $major)
        }
    }

    return ("chapter-{0:D3}" -f $Index)
}

# ======================
# Scan chapter folders
# ======================
$dirs = Get-ChildItem -Path $BaseImageDir -Directory | Sort-Object Name
if (-not $dirs -or $dirs.Count -eq 0) {
    throw "No chapter folders found under $BaseImageDir"
}

$index = 0

foreach ($dir in $dirs) {
    $index++
    $folderName = $dir.Name
    $chapterId  = Get-ChapterIdFromFolder -Name $folderName -Index $index
    $remoteFolder = $chapterId -replace '^chapter-', ''

    Write-Host ""
    Write-Host "Processing folder: $folderName -> $chapterId"

    # ======================
    # Collect images
    # ======================
    $images = Get-ChildItem $dir.FullName -File |
            Where-Object { $_.Extension -match '\.(png|jpg|jpeg|webp)$' }

    if (-not $images -or $images.Count -eq 0) {
        Write-Host "  Skipped (no images)"
        continue
    }

    # Natural sort by number in filename
    $sorted = $images | Sort-Object {
        $m = [regex]::Match($_.Name, '(\d+)')
        if ($m.Success) { [int]$m.Groups[1].Value } else { $_.Name }
    }

    $pageCount = $sorted.Count

    # ======================
    # Ensure thumbnail
    # ======================
    $thumbPath = Join-Path $dir.FullName "thumbnail.png"
    if (-not (Test-Path $thumbPath)) {
        if ($DryRun) {
            Write-Host "  [DryRun] Create thumbnail from first image"
        } else {
            Copy-Item $sorted[0].FullName $thumbPath -Force
            Write-Host "  Thumbnail created"
        }
    }

    # ======================
    # Upload to R2
    # ======================
    foreach ($img in $sorted) {
        $remotePath = "$R2Bucket/chapters/$remoteFolder/$($img.Name)"
        if ($DryRun) {
            Write-Host "  [DryRun] Upload $($img.Name) -> $remotePath"
        } else {
            Write-Host "  Upload $($img.Name)"
            wrangler r2 object put $remotePath --file $img.FullName
        }
    }

    # Upload thumbnail
    if ($DryRun) {
        Write-Host "  [DryRun] Upload thumbnail"
    } else {
        wrangler r2 object put "$R2Bucket/chapters/$remoteFolder/thumbnail.png" --file $thumbPath
    }

    # ======================
    # Write chapters table
    # ======================
    $safeTitle = ($folderName -replace "'", "''")
    $thumbnailUrl = "chapters/$remoteFolder/thumbnail.png"

    $sqlChapter =
    "INSERT OR IGNORE INTO chapters " +
            "(id, title, description, thumbnail_url, page_count, published_at) VALUES " +
            "('$chapterId', '$safeTitle', '', '$thumbnailUrl', $pageCount, CURRENT_TIMESTAMP);"

    if ($DryRun) {
        Write-Host "  [DryRun] SQL chapters:"
        Write-Host "  $sqlChapter"
    } else {
        wrangler d1 execute $DBName --remote --command $sqlChapter
        Write-Host "  chapters inserted"
    }

    # ======================
    # Write chapter_pages
    # ======================
    $values = @()
    $pageNum = 0

    foreach ($img in $sorted) {
        $pageNum++
        $imgNameEsc = ($img.Name -replace "'", "''")
        $imgUrl = "chapters/$remoteFolder/$imgNameEsc"
        $values += "('$chapterId', $pageNum, '$imgUrl')"
    }

    $valuesSql = [string]::Join(", ", $values)
    $sqlPages =
    "INSERT OR IGNORE INTO chapter_pages " +
            "(chapter_id, page_number, image_url) VALUES $valuesSql;"

    if ($DryRun) {
        Write-Host "  [DryRun] SQL chapter_pages:"
        Write-Host "  $sqlPages"
    } else {
        wrangler d1 execute $DBName --remote --command $sqlPages
        Write-Host "  chapter_pages inserted ($pageCount rows)"
    }

    Write-Host "Done: $chapterId"
}

Write-Host ""
Write-Host "All chapters deployed successfully."
