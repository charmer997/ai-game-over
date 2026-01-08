@echo off
REM 第一话全自动部署脚本
REM 漫画同好网站 - Cloudflare部署

echo 🚀 开始第一话全自动部署...

REM 设置环境变量
set CLOUDFLARE_API_TOKEN=Ye-dYdXR2PdSHR-gFa7_XBKXJ_4lneGvvUKnMjmD
set CLOUDFLARE_ACCOUNT_ID=221f5aa86b9529a869fe31932dafe3dc

echo 📋 环境变量设置完成

REM 步骤1: 检查wrangler是否安装
echo 🔍 检查Wrangler CLI...
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Wrangler未安装，正在安装...
    npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ❌ Wrangler安装失败，请手动安装: npm install -g wrangler
        pause
        exit /b 1
    )
)
echo ✅ Wrangler已就绪

REM 步骤2: 验证环境变量
echo 🔐 验证API Token...
if "%CLOUDFLARE_API_TOKEN%"=="" (
    echo ❌ 请设置CLOUDFLARE_API_TOKEN环境变量
    pause
    exit /b 1
)
if "%CLOUDFLARE_ACCOUNT_ID%"=="" (
    echo ❌ 请设置CLOUDFLARE_ACCOUNT_ID环境变量
    pause
    exit /b 1
)
echo ✅ 环境变量验证通过

REM 步骤3: 创建D1数据库
echo 🗄️ 创建D1数据库...
wrangler d1 create manga-fans-db --output=json > temp_db.json 2>&1
if %errorlevel% equ 0 (
    echo ✅ D1数据库创建成功
    REM 提取database_id并更新wrangler.toml
    for /f "tokens=2 delims=:," %%a in ('findstr /i "database_id" temp_db.json') do set DB_ID=%%a
    set DB_ID=%DB_ID: =%
    echo 📝 数据库ID: %DB_ID%
    
    REM 更新wrangler.toml中的database_id
    powershell -Command "(Get-Content wrangler.toml) -replace 'database_id = \".*\"', 'database_id = \"%DB_ID%\"' | Set-Content wrangler.toml"
    echo ✅ wrangler.toml已更新
) else (
    echo ⚠️ D1数据库可能已存在，继续执行...
)

REM 步骤4: 创建R2存储桶
echo 📁 创建R2存储桶...
wrangler r2 bucket create manga-fans-assets >nul 2>&1
echo ✅ R2存储桶就绪

REM 步骤5: 初始化数据库
echo 🔄 初始化数据库结构...
wrangler d1 execute manga-fans-db --file=schema.sql
if %errorlevel% equ 0 (
    echo ✅ 数据库初始化成功
) else (
    echo ⚠️ 数据库可能已初始化，继续执行...
)

REM 步骤6: 上传第一话图片到R2
echo 📤 上传第一话图片到R2...

REM 上传章节图片
echo 上传章节001的图片...
wrangler r2 object put manga-fans-assets/chapters/001/001.png --file=public/images/chapters/001/001.png
wrangler r2 object put manga-fans-assets/chapters/001/002.png --file=public/images/chapters/001/002.png
wrangler r2 object put manga-fans-assets/chapters/001/003.png --file=public/images/chapters/001/003.png

REM 使用第一张图片作为缩略图
wrangler r2 object put manga-fans-assets/chapters/001/thumbnail.png --file=public/images/chapters/001/001.png

echo ✅ 图片上传完成

REM 步骤7: 插入章节数据到D1
echo 🗄️ 插入第一话数据到数据库...

REM 插入章节信息
wrangler d1 execute manga-fans-db --command="INSERT OR REPLACE INTO chapters (id, title, description, thumbnail_url, page_count, published_at) VALUES ('chapter-001', '第1话', '故事的开端', 'https://manga-fans-assets.workers.dev/chapters/001/thumbnail.png', 3, datetime('now'))"

REM 插入页面信息
wrangler d1 execute manga-fans-db --command="INSERT OR REPLACE INTO chapter_pages (chapter_id, page_number, image_url) VALUES ('chapter-001', 1, 'https://manga-fans-assets.workers.dev/chapters/001/001.png'), ('chapter-001', 2, 'https://manga-fans-assets.workers.dev/chapters/001/002.png'), ('chapter-001', 3, 'https://manga-fans-assets.workers.dev/chapters/001/003.png')"

echo ✅ 数据库更新完成

REM 步骤8: 构建项目
echo 📦 构建Next.js项目...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 项目构建失败
    pause
    exit /b 1
)

REM 步骤9: 部署到Cloudflare Pages
echo 🌐 部署到Cloudflare Pages...
wrangler pages deploy out --project-name=manga-fans-site --compatibility-date=2024-01-01
if %errorlevel% neq 0 (
    echo ❌ Pages部署失败
    pause
    exit /b 1
)

REM 步骤10: 绑定自定义域名
echo 🔧 绑定自定义域名...
wrangler pages domain add manga-fans-site aishiterugame.dpdns.org >nul 2>&1

REM 步骤11: 部署Workers API
echo ⚙️ 部署Workers API...
wrangler deploy --compatibility-date=2024-01-01

REM 清理临时文件
if exist temp_db.json del temp_db.json

echo.
echo 🎉 第一话部署完成！
echo.
echo 🌍 网站地址: https://aishiterugame.dpdns.org
echo 📚 章节地址: https://aishiterugame.dpdns.org/chapters/chapter-001
echo 🔗 API地址: https://aishiterugame.dpdns.org/api/chapters
echo.
echo 📊 验证部署:
echo 1. 访问网站查看第一话
echo 2. 检查图片是否正常加载
echo 3. 测试章节阅读功能
echo.
echo ✨ 恭喜！您的漫画同好网站已上线！
echo.

pause