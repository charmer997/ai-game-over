@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo 🚀 开始部署第一话（Cloudflare）
echo.

REM ===== 基本配置 =====
set DB_NAME=lovegame
set R2_BUCKET=r2-lovegame
set ACCOUNT_ID=221f5aa86b9529a869fe31932dafe3dc
set BASE_R2_URL=https://%ACCOUNT_ID%.r2.cloudflarestorage.com/%R2_BUCKET%

REM ===== 1. 上传图片到 R2 =====
echo 📤 [1/6] 上传图片到 R2...

call wrangler r2 object put %R2_BUCKET%/chapters/001/001.png --file=assets\chapters\001\001.png
call wrangler r2 object put %R2_BUCKET%/chapters/001/002.png --file=assets\chapters\001\002.png
call wrangler r2 object put %R2_BUCKET%/chapters/001/003.png --file=assets\chapters\001\003.png
call wrangler r2 object put %R2_BUCKET%/chapters/001/thumbnail.png --file=assets\chapters\001\thumbnail.png

echo ✅ 图片上传完成
echo.

REM ===== 2. 写入章节数据到 D1（重点：单行 SQL）=====
echo 🗄️ [2/6] 写入章节数据到 D1...

call wrangler d1 execute %DB_NAME% --remote --command "INSERT OR REPLACE INTO chapters (id,title,description,thumbnail_url,page_count,published_at) VALUES ('chapter-001','第1话','故事的开端','%BASE_R2_URL%/chapters/001/thumbnail.png',3,datetime('now'))"

call wrangler d1 execute %DB_NAME% --remote --command "INSERT OR REPLACE INTO pages (chapter_id,page_index,image_url) VALUES ('chapter-001',1,'%BASE_R2_URL%/chapters/001/001.png'),('chapter-001',2,'%BASE_R2_URL%/chapters/001/002.png'),('chapter-001',3,'%BASE_R2_URL%/chapters/001/003.png')"

echo ✅ D1 数据写入完成
echo.

REM ===== 3. 构建前端 =====
echo 🛠️ [3/6] 构建项目...
call npm run build
echo.

REM ===== 4. 部署 Pages =====
echo 🚀 [4/6] 部署 Pages...
call wrangler pages deploy dist
echo.

REM ===== 5. 域名（如已绑可跳过）=====
echo 🌐 [5/6] 域名已配置（跳过）
echo.

REM ===== 6. Workers API =====
echo ⚙️ [6/6] 部署 Workers API...
call wrangler deploy
echo.

echo 🎉 第一话部署完成！
pause
