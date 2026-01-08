#!/bin/bash

# Cloudflare Pages + Workers + D1 + R2 部署脚本
# 漫画同好网站自动化部署

set -e

echo "🚀 开始部署到 Cloudflare Pages..."

# 检查环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ 错误: 请设置 CLOUDFLARE_API_TOKEN 环境变量"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ 错误: 请设置 CLOUDFLARE_ACCOUNT_ID 环境变量"
    exit 1
fi

# 1. 构建项目
echo "📦 构建项目..."
npm run build

# 2. 创建D1数据库（如果不存在）
echo "🗄️ 设置 D1 数据库..."
if ! wrangler d1 list | grep -q "manga-fans-db"; then
    echo "创建 D1 数据库..."
    wrangler d1 create manga-fans-db
    echo "请更新 wrangler.toml 中的 database_id"
    exit 1
fi

# 3. 运行数据库迁移
echo "🔄 运行数据库迁移..."
wrangler d1 execute manga-fans-db --file=schema.sql

# 4. 创建R2存储桶（如果不存在）
echo "📁 设置 R2 存储..."
if ! wrangler r2 bucket list | grep -q "manga-fans-assets"; then
    echo "创建 R2 存储桶..."
    wrangler r2 bucket create manga-fans-assets
fi

# 5. 上传静态资源到R2
echo "📤 上传静态资源到 R2..."
if [ -d "public/images" ]; then
    wrangler r2 object put manga-fans-assets/images/chapters/001/thumbnail.jpg --file=public/images/chapters/001/thumbnail.jpg
    wrangler r2 object put manga-fans-assets/images/news/first-news.jpg --file=public/images/news/first-news.jpg
    echo "✅ 静态资源上传完成"
fi

# 6. 部署到Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."
wrangler pages deploy out --project-name=manga-fans-site --compatibility-date=2024-01-01

# 7. 设置自定义域名
echo "🔧 设置自定义域名..."
wrangler pages project create manga-fans-site --production-branch main
wrangler pages domain add manga-fans-site aishiterugame.dpdns.org

echo "✅ 部署完成!"
echo "🌍 网站地址: https://aishiterugame.dpdns.org"
echo "📊 查看部署状态: wrangler pages deployment list --project-name=manga-fans-site"