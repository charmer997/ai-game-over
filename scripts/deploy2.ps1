# ===============================
# deploy2.ps1
# 方案 C：稳定并行 + 存在检查
# ===============================

$ErrorActionPreference = "Stop"

# -------- 配置 --------
$R2Bucket     = "r2-lovegame"
$LocalRoot    = (Resolve-Path "..\public\images").Path
$RemotePrefix = "images"

$ThrottleLimit = 8
$MaxRetry      = 8

Write-Host "🚀 开始同步 images → R2" -ForegroundColor Cyan
Write-Host "📂 本地目录: $LocalRoot"
Write-Host "☁️ R2 Bucket: $R2Bucket"
Write-Host "⚡ 并发数: $ThrottleLimit"
Write-Host ""

# -------- 收集文件 --------
$items = @()

Get-ChildItem $LocalRoot -Recurse -File |
Where-Object {
    $_.Extension -in '.png','.jpg','.jpeg','.webp'
} |
ForEach-Object {

    $fullPath = $_.FullName

    $relative = $fullPath.Substring($LocalRoot.Length)
    $relative = $relative.TrimStart('\','/')
    $relative = $relative -replace '\\','/'

    $key = "$RemotePrefix/$relative"

    $items += [PSCustomObject]@{
        LocalFile = $fullPath
        Key       = $key
    }
}

Write-Host "📦 共发现 $($items.Count) 个图片文件"
Write-Host ""

# -------- 并行上传（关键修复点） --------
$items | ForEach-Object -Parallel {

    $bucket    = $using:R2Bucket
    $key       = $_.Key
    $localFile = $_.LocalFile
    $maxRetry  = $using:MaxRetry

    # 1️⃣ 先检查是否存在
    & wrangler r2 object get "$bucket/$key" --remote --file NUL 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⏭ 已存在，跳过: $key" -ForegroundColor DarkGray
        return
    }

    # 2️⃣ 重试上传
    for ($i = 1; $i -le $maxRetry; $i++) {

        Write-Host "⬆ 上传($i/$maxRetry): $key"

        & wrangler r2 object put "$bucket/$key" `
            --file "$localFile" `
            --remote

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 成功: $key" -ForegroundColor Green
            return
        }

        Start-Sleep -Seconds (2 * $i)
    }

    Write-Host "❌ 上传失败: $key" -ForegroundColor Red

} -ThrottleLimit $ThrottleLimit

Write-Host ""
Write-Host "🎉 images 同步完成" -ForegroundColor Green
