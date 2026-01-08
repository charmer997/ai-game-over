@echo off
REM Cloudflare Pages + Workers + D1 + R2 部署脚本 (Windows版本)
REM 漫画同好网站自动化部署

echo 🚀 开始部署到 Cloudflare Pages...

REM 检查环境变量
if "%CLOUDFLARE_API_TOKEN%"=="" (
    echo ❌ 错误: 请设置 CLOUDFLARE_API_TOKEN 环境变量
    exit /b 1
)

if "%CLOUDFLARE_ACCOUNT_ID%"=="" (
    echo ❌ 错误: 请设置 CLOUDFLARE_ACCOUNT_ID 环境变量
    exit /b 1
)

REM 1. 构建项目
echo 📦 构建项目...
call npm run build

REM 2. 创建D1数据库（如果不存在）
echo 🗄️ 设置 D1 数据库...
wrangler d1 list | findstr "manga-fans-db" >nul
if %errorlevel% neq 0 (
    echo 创建 D1 数据库...
    wrangler d1 create manga-fans-db
    echo 请更新 wrangler.toml 中的 database_id
    exit /b 1
)

REM 3. 运行数据库迁移
echo 🔄 运行数据库迁移...
wrangler d1 execute manga-fans-db --file=schema.sql

REM 4. 创建R2存储桶（如果不存在）
echo 📁 设置 R2 存储...
wrangler r2 bucket list | findstr "manga-fans-assets" >nul
if %errorlevel% neq 0 (
    echo 创建 R2 存储桶...
    wrangler r2 bucket create manga-fans-assets
)

REM 5. 上传静态资源到R2
echo 📤 上传静态资源到 R2...
if exist "public\images\chapters\001\thumbnail.jpg" (
    wrangler r2 object put manga-fans-assets/images/chapters/001/thumbnail.jpg --file=public/images/chapters/001/thumbnail.jpg
)
if exist "public\images\news\first-news.jpg" (
    wrangler r2 object put manga-fans-assets/images/news/first-news.jpg --file=public/images/news/first-news.jpg
)
echo ✅ 静态资源上传完成

REM 6. 部署到Cloudflare Pages
echo 🌐 部署到 Cloudflare Pages...
wrangler pages deploy out --project-name=manga-fans-site --compatibility-date=2024-01-01

REM 7. 设置自定义域名
echo 🔧 设置自定义域名...
wrangler pages project create manga-fans-site --production-branch main
wrangler pages domain add manga-fans-site aishiterugame.dpdns.org

echo ✅ 部署完成!
echo 🌍 网站地址: https://aishiterugame.dpdns.org
echo 📊 查看部署状态: wrangler pages deployment list --project-name=manga-fans-site

pause