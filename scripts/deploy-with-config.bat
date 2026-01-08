@echo off
REM 使用您实际配置的部署脚本
REM D1: lovegame (e0b6869a-d8d1-4c9d-8ab0-d80244395cdf)
REM R2: r2-lovegame

echo 🚀 开始部署第一话到您的Cloudflare配置...

REM 设置环境变量
set CLOUDFLARE_API_TOKEN=Ye-dYdXR2PdSHR-gFa7_XBKXJ_4lneGvvUKnMjmD
set CLOUDFLARE_ACCOUNT_ID=221f5aa86b9529a869fe31932dafe3dc

echo 📋 配置信息:
echo   D1数据库: lovegame
echo   R2存储桶: r2-lovegame
echo   域名: aishiterugame.dpdns.org

REM 步骤1: 初始化数据库
echo 🔄 初始化D1数据库（远程）...
wrangler d1 execute lovegame --file=schema.sql --remote
if %errorlevel% neq 0 (
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
)
echo ✅ 数据库初始化完成

REM 步骤2: 上传第一话图片到R2
echo 📤 上传第一话图片到R2存储桶...
wrangler r2 object put r2-lovegame/chapters/001/001.png --file=public/images/chapters/001/001.png
wrangler r2 object put r2-lovegame/chapters/001/002.png --file=public/images/chapters/001/002.png
wrangler r2 object put r2-lovegame/chapters/001/003.png --file=public/images/chapters/001/003.png
wrangler r2 object put r2-lovegame/chapters/001/thumbnail.png --file=public/images/chapters/001/001.png
echo ✅ 图片上传完成

REM 步骤3: 插入章节数据到D1
echo 🗄️ 插入第一话数据（远程）...
wrangler d1 execute lovegame --command="INSERT OR REPLACE INTO chapters (id, title, description, thumbnail_url, page_count, published_at) VALUES ('chapter-001', '第1话', '故事的开端', 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/thumbnail.png', 3, datetime('now'))" --remote

wrangler d1 execute lovegame --command="INSERT OR REPLACE INTO chapter_pages (chapter_id, page_number, image_url) VALUES ('chapter-001', 1, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/001.png'), ('chapter-001', 2, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/002.png'), ('chapter-001', 3, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/003.png')" --remote
echo ✅ 数据库更新完成

REM 步骤4: 构建项目
echo 📦 构建Next.js项目...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 项目构建失败
    pause
    exit /b 1
)
echo ✅ 项目构建完成

REM 步骤5: 部署到Cloudflare Pages
echo 🌐 部署到Cloudflare Pages...
wrangler pages deploy out --project-name=manga-fans-site --compatibility-date=2024-01-01
if %errorlevel% neq 0 (
    echo ❌ Pages部署失败
    pause
    exit /b 1
)
echo ✅ Pages部署完成

REM 步骤6: 绑定自定义域名
echo 🔧 绑定自定义域名...
wrangler pages domain add manga-fans-site aishiterugame.dpdns.org >nul 2>&1

REM 步骤7: 部署Workers API
echo ⚙️ 部署Workers API...
wrangler deploy --compatibility-date=2024-01-01

echo.
echo 🎉 第一话部署完成！
echo.
echo 🌍 网站地址: https://aishiterugame.dpdns.org
echo 📚 第一话: https://aishiterugame.dpdns.org/chapters/chapter-001
echo 🔗 API地址: https://aishiterugame.dpdns.org/api/chapters
echo 📁 R2存储: https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame
echo.
echo 🧪 测试图片访问:
echo   https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/001.png
echo   https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/002.png
echo   https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame/chapters/001/003.png
echo.
echo ✨ 恭喜！您的第一话已成功部署！
echo.

pause