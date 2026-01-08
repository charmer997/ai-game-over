#!/bin/bash

# ===============================
# pages-deploy.sh
# Cloudflare Pages 部署脚本（Next.js Export 方案）
# ===============================

set -e

# ====== 项目配置 ======
PROJECT_NAME="lovegame"
D1_NAME="lovegame"
R2_BUCKET="r2-lovegame"
CHAPTER_ID="chapter-001"
CHAPTER_PATH="chapters/001"
LOCAL_IMAGE_PATH="public/images/chapters/001"

echo
echo "🚀 开始 Cloudflare Pages 部署（Next.js Export 方案）"
echo

# ====== 步骤提示 ======
echo "📋 部署步骤:"
echo "  1. 构建 Next.js (output: export)"
echo "  2. 上传图片到 R2"
echo "  3. 写入章节数据到 D1"
echo "  4. 部署 Pages (使用 out/ 目录)"
echo "  5. 绑定域名"
echo "  6. 部署 Workers API"
echo

# ==============================
# STEP 1: 构建 Next.js (export)
# ==============================
echo "📦 [1/6] 构建 Next.js 项目 (export 模式)..."

npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

if [ ! -d "out" ]; then
    echo "❌ 未发现 out 目录（请确认 next.config.js 使用 output: 'export'）"
    exit 1
fi

echo "✅ 构建完成，已生成 out/ 目录"
echo

# ==============================
# STEP 2: 上传图片到 R2
# ==============================
echo "📤 [2/6] 上传图片到 R2..."

images=("001.png" "002.png" "003.png")
for img in "${images[@]}"; do
    if [ ! -f "$LOCAL_IMAGE_PATH/$img" ]; then
        echo "❌ 本地文件不存在: $LOCAL_IMAGE_PATH/$img"
        exit 1
    fi

    echo "  → 上传 $img"
    wrangler r2 object put "$R2_BUCKET/$CHAPTER_PATH/$img" --file="$LOCAL_IMAGE_PATH/$img"
    if [ $? -ne 0 ]; then
        echo "❌ 上传 $img 失败"
        exit 1
    fi
done

# 缩略图
wrangler r2 object put "$R2_BUCKET/$CHAPTER_PATH/thumbnail.png" --file="$LOCAL_IMAGE_PATH/001.png"
if [ $? -ne 0 ]; then
    echo "❌ 上传 thumbnail 失败"
    exit 1
fi

echo "✅ 图片上传完成"
echo

# ==============================
# STEP 3: 写入 D1 数据
# ==============================
echo "🗄️ [3/6] 写入章节数据到 D1..."

wrangler d1 execute "$D1_NAME" --remote --command "INSERT OR REPLACE INTO chapters (id, title, description, thumbnail_url, page_count, published_at) VALUES ('$CHAPTER_ID', '第1话', '故事的开端', 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/$R2_BUCKET/$CHAPTER_PATH/thumbnail.png', 3, datetime('now'))"
if [ $? -ne 0 ]; then
    echo "❌ chapters 表写入失败"
    exit 1
fi

wrangler d1 execute "$D1_NAME" --remote --command "INSERT OR REPLACE INTO chapter_pages (chapter_id, page_number, image_url) VALUES ('$CHAPTER_ID', 1, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/$R2_BUCKET/$CHAPTER_PATH/001.png'), ('$CHAPTER_ID', 2, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/$R2_BUCKET/$CHAPTER_PATH/002.png'), ('$CHAPTER_ID', 3, 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/$R2_BUCKET/$CHAPTER_PATH/003.png')"
if [ $? -ne 0 ]; then
    echo "❌ chapter_pages 表写入失败"
    exit 1
fi

echo "✅ 数据库更新完成"
echo

# ==============================
# STEP 4: 部署 Pages (使用 out/)
# ==============================
echo "🌐 [4/6] 部署到 Cloudflare Pages (使用 out/ 目录)..."

wrangler pages deploy out --project-name="$PROJECT_NAME"
if [ $? -ne 0 ]; then
    echo "❌ Pages 部署失败"
    exit 1
fi

echo "✅ Pages 部署完成"
echo

# ==============================
# STEP 5: 绑定域名（幂等）
# ==============================
echo "🔧 [5/6] 绑定自定义域名..."

wrangler pages domain add "$PROJECT_NAME" aishiterugame.dpdns.org >/dev/null 2>&1 || true

echo "✅ 域名绑定完成（已存在会自动跳过）"
echo

# ==============================
# STEP 6: 部署 Workers API
# ==============================
echo "⚙️ [6/6] 部署 Workers API..."

wrangler deploy
if [ $? -ne 0 ]; then
    echo "❌ Workers 部署失败"
    exit 1
fi

echo
echo "🎉 全部部署完成！"
echo
echo "🌍 网站: https://aishiterugame.dpdns.org"
echo "📚 第一话: https://aishiterugame.dpdns.org/chapters/$CHAPTER_ID"
echo "🔗 API: https://aishiterugame.dpdns.org/api/chapters"
echo "🖼️ 示例图片:"
echo "  https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/$R2_BUCKET/$CHAPTER_PATH/001.png"
echo
echo "⏳ 域名生效需要 1-5 分钟，请耐心等待..."
echo

read -p "按任意键继续..."