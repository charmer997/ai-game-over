# ===============================
# deploy-chapter.ps1
# 部署单话漫画（R2 + D1）
# ===============================

$ErrorActionPreference = "Stop"

$ChapterId = "chapter-001"
$ChapterTitle = "第一话"
$ChapterDesc = "第一话 正式发布"
$ImageDir = "public/images/chapters/001"
$R2Bucket = "r2-lovegame"
$DBName = "lovegame"

Write-Host "🚀 开始部署 $ChapterId（Cloudflare）" -ForegroundColor Cyan

# -------------------------------
# 0. 校验图片
# -------------------------------
Write-Host "`n🔍 校验图片文件..."

$images = @("001.png", "002.png", "003.png")
foreach ($img in $images) {
    if (-not (Test-Path "$ImageDir/$img")) {
        Write-Error "❌ 缺少图片: $img"
        exit 1
    }
}

if (-not (Test-Path "$ImageDir/thumbnail.png")) {
    Copy-Item "$ImageDir/001.png" "$ImageDir/thumbnail.png"
}

Write-Host "✅ 图片文件校验通过"

# -------------------------------
# 1. 上传图片到 R2
# -------------------------------
Write-Host "`n📤 [1/4] 上传图片到 R2..."

foreach ($img in $images) {
    Write-Host "  → 上传 $img"
    wrangler r2 object put "$R2Bucket/chapters/001/$img" `
        --file "$ImageDir/$img"
}

wrangler r2 object put "$R2Bucket/chapters/001/thumbnail.png" `
    --file "$ImageDir/thumbnail.png"

Write-Host "✅ 图片上传完成"

# -------------------------------
# 2. 写入 D1：chapters
# -------------------------------
Write-Host "`n🗄️ [2/4] 写入章节数据到 D1（chapters）..."

$sqlChapter = @"
INSERT OR IGNORE INTO chapters
(id, title, description, thumbnail_url, page_count, published_at)
VALUES
('$ChapterId', '$ChapterTitle', '$ChapterDesc',
 'chapters/001/thumbnail.png', 3, CURRENT_TIMESTAMP);
"@

wrangler d1 execute $DBName --remote --command "$sqlChapter"
Write-Host "✅ chapters 表写入完成"

# -------------------------------
# 3. 写入 D1：chapter_pages
# -------------------------------
Write-Host "`n🗄️ [3/4] 写入分页数据到 D1（chapter_pages）..."

$sqlPages = @"
INSERT OR IGNORE INTO chapter_pages
(chapter_id, page_number, image_url)
VALUES
('$ChapterId', 1, 'chapters/001/001.png'),
('$ChapterId', 2, 'chapters/001/002.png'),
('$ChapterId', 3, 'chapters/001/003.png');
"@

wrangler d1 execute $DBName --remote --command "$sqlPages"
Write-Host "✅ chapter_pages 表写入完成"

# -------------------------------
# 4. 完成
# -------------------------------
Write-Host "`n🎉 单话部署完成！" -ForegroundColor Green
Write-Host "📚 章节 ID: $ChapterId"
Write-Host "🖼️ 示例图片:"
Write-Host "https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/001.png"
