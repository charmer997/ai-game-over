@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo.
echo 🚀 开始 Cloudflare Pages 部署（Next.js Export 方案）
echo.

REM ====== 项目配置 ======
set PROJECT_NAME=lovegame
set D1_NAME=lovegame
set R2_BUCKET=r2-lovegame
set CHAPTER_ID=chapter-001
set CHAPTER_PATH=chapters/001
set LOCAL_IMAGE_PATH=public/images/chapters/001

REM ====== 步骤提示 ======
echo 📋 部署步骤:
echo   1. 构建 Next.js (output: export)
echo   2. 上传图片到 R2
echo   3. 写入章节数据到 D1
echo   4. 部署 Pages (使用 out/ 目录)
echo   5. 绑定域名
echo   6. 部署 Workers API
echo.

REM ==============================
REM STEP 1: 构建 Next.js (export)
REM ==============================
echo 📦 [1/6] 构建 Next.js 项目 (export 模式)...

call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    exit /b 1
)

if not exist out (
    echo ❌ 未发现 out 目录（请确认 next.config.js 使用 output: 'export'）
    exit /b 1
)

echo ✅ 构建完成，已生成 out/ 目录
echo.

REM ==============================
REM STEP 2: 上传图片到 R2
REM ==============================
echo 📤 [2/6] 上传图片到 R2...

for %%F in (001.png 002.png 003.png) do (
    if not exist "%LOCAL_IMAGE_PATH%\%%F" (
        echo ❌ 本地文件不存在: %LOCAL_IMAGE_PATH%\%%F
        exit /b 1
    )

    echo   → 上传 %%F
    call wrangler r2 object put %R2_BUCKET%/%CHAPTER_PATH%/%%F --file=%LOCAL_IMAGE_PATH%\%%F
    if errorlevel 1 (
        echo ❌ 上传 %%F 失败
        exit /b 1
    )
)

REM 缩略图
call wrangler r2 object put %R2_BUCKET%/%CHAPTER_PATH%/thumbnail.png --file=%LOCAL_IMAGE_PATH%\001.png
if errorlevel 1 (
    echo ❌ 上传 thumbnail 失败
    exit /b 1
)

echo ✅ 图片上传完成
echo.

REM ==============================
REM STEP 3: 写入 D1 数据
REM ==============================
echo 🗄️ [3/6] 写入章节数据到 D1...

call wrangler d1 execute %D1_NAME% --remote --command ^
"INSERT OR REPLACE INTO chapters
 (id, title, description, thumbnail_url, page_count, published_at)
 VALUES
 ('%CHAPTER_ID%', '第1话', '故事的开端',
 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/%R2_BUCKET%/%CHAPTER_PATH%/thumbnail.png',
 3, datetime('now'))"

if errorlevel 1 (
    echo ❌ chapters 表写入失败
    exit /b 1
)

call wrangler d1 execute %D1_NAME% --remote --command ^
"INSERT OR REPLACE INTO chapter_pages
 (chapter_id, page_number, image_url)
 VALUES
 ('%CHAPTER_ID%', 1, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/%R2_BUCKET%/%CHAPTER_PATH%/001.png'),
 ('%CHAPTER_ID%', 2, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/%R2_BUCKET%/%CHAPTER_PATH%/002.png'),
 ('%CHAPTER_ID%', 3, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/%R2_BUCKET%/%CHAPTER_PATH%/003.png')"

if errorlevel 1 (
    echo ❌ chapter_pages 表写入失败
    exit /b 1
)

echo ✅ 数据库更新完成
echo.

REM ==============================
REM STEP 4: 部署 Pages (使用 out/)
REM ==============================
echo 🌐 [4/6] 部署到 Cloudflare Pages (使用 out/ 目录)...

call wrangler pages deploy out --project-name=%PROJECT_NAME%
if errorlevel 1 (
    echo ❌ Pages 部署失败
    exit /b 1
)

echo ✅ Pages 部署完成
echo.

REM ==============================
REM STEP 5: 绑定域名（幂等）
REM ==============================
echo 🔧 [5/6] 绑定自定义域名...

call wrangler pages domain add %PROJECT_NAME% aishiterugame.dpdns.org >nul 2>&1

echo ✅ 域名绑定完成（已存在会自动跳过）
echo.

REM ==============================
REM STEP 6: 部署 Workers API
REM ==============================
echo ⚙️ [6/6] 部署 Workers API...

call wrangler deploy
if errorlevel 1 (
    echo ❌ Workers 部署失败
    exit /b 1
)

echo.
echo 🎉 全部部署完成！
echo.
echo 🌍 网站: https://aishiterugame.dpdns.org
echo 📚 第一话: https://aishiterugame.dpdns.org/chapters/%CHAPTER_ID%
echo 🔗 API: https://aishiterugame.dpdns.org/api/chapters
echo 🖼️ 示例图片:
echo   https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/%R2_BUCKET%/%CHAPTER_PATH%/001.png
echo.
echo ⏳ 域名生效需要 1-5 分钟，请耐心等待...
echo.

pause