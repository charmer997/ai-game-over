# 章节添加指南

本指南将帮助您了解如何向漫画网站添加新章节，包括图片上传、数据配置和部署流程。

## 目录结构

在添加新章节之前，请了解项目的目录结构：

```
public/
├── images/
│   ├── cover.jpg              # 网站封面图
│   ├── chapters/              # 章节图片目录
│   │   ├── 001/               # 第1章图片
│   │   │   ├── 001.png        # 第1页
│   │   │   ├── 002.png        # 第2页
│   │   │   └── thumbnail.png  # 章节缩略图
│   │   └── 002/               # 第2章图片
│   │       ├── 001.png
│   │       ├── 002.png
│   │       └── thumbnail.png
│   ├── news/                  # 新闻图片
│   └── characters/            # 角色图片

content/
├── chapters/                  # 章节数据
│   ├── chapter-001.json       # 第1章数据
│   └── chapter-002.json       # 第2章数据
├── characters/                # 角色数据
└── news/                      # 新闻数据
```

## 添加新章节步骤

### 1. 准备章节图片

1. **图片格式**：使用 PNG 格式（推荐）或 JPG 格式
2. **图片命名**：按顺序命名，如 `001.png`, `002.png`, `003.png`...
3. **图片优化**：确保图片大小适中，建议单张图片不超过 500KB
4. **缩略图**：为每个章节创建一个 `thumbnail.png` 缩略图

### 2. 创建章节目录

假设您要添加第10章：

```bash
# 在 public/images/chapters/ 目录下创建新章节文件夹
mkdir -p public/images/chapters/010
```

### 3. 上传图片

将准备好的图片文件上传到对应的章节目录：

```bash
# 示例：将图片复制到第10章目录
cp /path/to/your/images/*.png public/images/chapters/010/
```

确保目录结构如下：

```
public/images/chapters/010/
├── 001.png
├── 002.png
├── 003.png
└── thumbnail.png
```

### 4. 创建章节数据文件

在 `content/chapters/` 目录下创建新的 JSON 文件：

```bash
# 创建第10章的数据文件
touch content/chapters/chapter-010.json
```

编辑 `chapter-010.json` 文件，添加以下内容：

```json
{
  "id": "010",
  "title": "第10章：章节标题",
  "description": "本章内容简介...",
  "thumbnail": "/images/chapters/010/thumbnail.png",
  "pages": [
    "/images/chapters/010/001.png",
    "/images/chapters/010/002.png",
    "/images/chapters/010/003.png"
  ],
  "publishDate": "2023-10-01",
  "tags": ["主线剧情", "战斗"],
  "volume": 2,
  "chapterNumber": 10
}
```

### 5. 更新卷册信息（可选）

如果您使用卷册分类系统，需要更新 `src/lib/volumes.ts` 文件：

```typescript
// 在相应的卷册中添加新章节
{
  id: 'volume-2',
  title: '第二卷',
  description: '第8-14话',
  chapters: ['008', '009', '010', '011', '012', '013', '014'],
  cover: '/images/volumes/volume-2-cover.jpg'
}
```

### 6. 测试本地效果

在部署之前，先在本地测试：

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000 查看效果
```

### 7. 部署到 Cloudflare Pages

使用提供的部署脚本：

```bash
# Windows
./scripts/deploy.bat

# Linux/Mac
./scripts/deploy.sh
```

或者手动部署：

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
npm run deploy
```

## 批量添加章节

如果您需要一次性添加多个章节，可以使用以下脚本：

### 创建批量上传脚本

创建 `scripts/batch-upload.sh`：

```bash
#!/bin/bash

# 设置起始和结束章节号
START_CHAPTER=11
END_CHAPTER=15

# 循环创建章节
for i in $(seq $START_CHAPTER $END_CHAPTER); do
  # 格式化章节号为三位数
  CHAPTER_NUM=$(printf "%03d" $i)
  
  # 创建目录
  mkdir -p "public/images/chapters/$CHAPTER_NUM"
  
  # 创建数据文件
  cat > "content/chapters/chapter-$CHAPTER_NUM.json" << EOF
{
  "id": "$CHAPTER_NUM",
  "title": "第${i}章：章节标题",
  "description": "本章内容简介...",
  "thumbnail": "/images/chapters/$CHAPTER_NUM/thumbnail.png",
  "pages": [],
  "publishDate": "$(date +%Y-%m-%d)",
  "tags": ["主线剧情"],
  "volume": $(( (i - 1) / 7 + 1 )),
  "chapterNumber": $i
}
EOF

  echo "Created chapter $CHAPTER_NUM"
done

echo "Batch chapter creation completed!"
```

## 图片优化建议

### 1. 图片压缩

使用工具压缩图片以减少加载时间：

```bash
# 使用 ImageMagick 批量压缩
mogrify -resize 1200x1800 -quality 85 public/images/chapters/010/*.png

# 使用 pngquant 优化 PNG
pngquant --quality=65-80 --output public/images/chapters/010/ --ext .png public/images/chapters/010/*.png
```

### 2. WebP 格式（可选）

考虑使用 WebP 格式以进一步减小文件大小：

```bash
# 转换为 WebP
cwebp -q 80 public/images/chapters/010/001.png -o public/images/chapters/010/001.webp
```

## 常见问题

### 1. 图片不显示

- 检查图片路径是否正确
- 确认图片文件名与 JSON 中的路径一致
- 检查图片文件是否存在

### 2. 章节不显示在列表中

- 检查 JSON 文件格式是否正确
- 确认章节 ID 是否唯一
- 检查卷册配置（如果使用）

### 3. 部署后图片 404

- 确认图片已包含在构建中
- 检查 public 目录结构
- 重新部署项目

## 自动化工具

### 1. 章节生成器脚本

创建 `scripts/generate-chapter.js`：

```javascript
const fs = require('fs');
const path = require('path');

function generateChapter(chapterNumber, title, description, tags = []) {
  const chapterId = chapterNumber.toString().padStart(3, '0');
  const volume = Math.ceil(chapterNumber / 7);
  
  const chapterData = {
    id: chapterId,
    title: `第${chapterNumber}章：${title}`,
    description,
    thumbnail: `/images/chapters/${chapterId}/thumbnail.png`,
    pages: [],
    publishDate: new Date().toISOString().split('T')[0],
    tags,
    volume,
    chapterNumber: chapterNumber
  };
  
  // 创建目录
  const chapterDir = path.join('public/images/chapters', chapterId);
  if (!fs.existsSync(chapterDir)) {
    fs.mkdirSync(chapterDir, { recursive: true });
  }
  
  // 写入 JSON 文件
  const jsonPath = path.join('content/chapters', `chapter-${chapterId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(chapterData, null, 2));
  
  console.log(`Generated chapter ${chapterId}`);
}

// 使用示例
generateChapter(16, '新的开始', '故事进入新阶段...', ['主线剧情', '转折']);
```

### 2. 图片上传脚本

创建 `scripts/upload-images.js`：

```javascript
const fs = require('fs');
const path = require('path');

function uploadImages(chapterNumber, imageDir) {
  const chapterId = chapterNumber.toString().padStart(3, '0');
  const targetDir = path.join('public/images/chapters', chapterId);
  
  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 复制图片
  const files = fs.readdirSync(imageDir);
  const imageFiles = files.filter(file => /\.(png|jpg|jpeg)$/i.test(file));
  
  imageFiles.forEach(file => {
    const srcPath = path.join(imageDir, file);
    const destPath = path.join(targetDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to chapter ${chapterId}`);
  });
  
  // 更新章节数据
  const jsonPath = path.join('content/chapters', `chapter-${chapterId}.json`);
  if (fs.existsSync(jsonPath)) {
    const chapterData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    chapterData.pages = imageFiles.map(file => `/images/chapters/${chapterId}/${file}`);
    fs.writeFileSync(jsonPath, JSON.stringify(chapterData, null, 2));
    console.log(`Updated chapter ${chapterId} data`);
  }
}

// 使用示例
// uploadImages(16, '/path/to/chapter16/images');
```

## 最佳实践

1. **命名规范**：保持一致的命名规范，使用三位数字编号
2. **图片优化**：始终优化图片大小以提高加载速度
3. **数据验证**：在部署前验证 JSON 文件格式
4. **版本控制**：使用 Git 跟踪所有更改
5. **备份**：定期备份内容和图片
6. **测试**：在部署前充分测试新章节

## 总结

通过遵循本指南，您可以轻松地向漫画网站添加新章节。记住要保持文件结构的一致性，优化图片以提高性能，并在部署前进行充分测试。

如果您遇到任何问题，请参考项目的 README.md 文件或联系项目维护者。