# 章节添加指南

本指南将帮助您添加新的漫画章节到网站中。

## 目录结构

每个章节需要以下文件和目录结构：

```
content/chapters/
├── chapter-001.json
├── chapter-002.json
└── ...

public/images/chapters/
├── 001/
│   ├── 001.png
│   ├── 002.png
│   ├── 003.png
│   └── thumbnail.png
├── 002/
│   ├── 001.png
│   ├── 002.png
│   └── thumbnail.png
└── ...
```

## 添加新章节的步骤

### 1. 创建章节数据文件

在 `content/chapters/` 目录下创建新的JSON文件，命名为 `chapter-XXX.json`（XXX为章节编号，如002、003等）。

文件格式示例：

```json
{
  "id": "chapter-002",
  "title": "第2话：标题",
  "publishDate": "2024-01-08",
  "description": "章节描述",
  "thumbnail": "/images/chapters/002/thumbnail.png",
  "pages": [
    "/images/chapters/002/001.png",
    "/images/chapters/002/002.png",
    "/images/chapters/002/003.png"
  ]
}
```

**字段说明：**
- `id`: 章节唯一标识符，格式为 `chapter-XXX`
- `title`: 章节标题
- `publishDate`: 发布日期，格式为 `YYYY-MM-DD`
- `description`: 章节描述（可选）
- `thumbnail`: 缩略图路径
- `pages`: 页面图片路径数组

### 2. 准备图片文件

在 `public/images/chapters/` 目录下创建对应的章节文件夹（如002、003等）。

**图片要求：**
- 所有图片必须是 `.png` 格式
- 页面图片命名为 `001.png`, `002.png`, `003.png` 等（三位数字）
- 缩略图命名为 `thumbnail.png`
- 建议图片宽度不超过1200px，以优化加载速度

### 3. 批量添加章节（1-60话）

如果您要添加1-60话的大量章节，可以按以下步骤操作：

#### 步骤1：创建目录结构

```bash
# 在public/images/chapters/下创建001-060的目录
mkdir public/images/chapters/{001..060}
```

#### 步骤2：准备图片文件

将每个章节的图片文件放入对应目录：
- 章节001的图片放入 `public/images/chapters/001/`
- 章节002的图片放入 `public/images/chapters/002/`
- 以此类推...

#### 步骤3：创建章节数据文件

您可以使用以下脚本批量创建章节数据文件：

```javascript
// 在项目根目录创建 generate-chapters.js
const fs = require('fs');
const path = require('path');

// 生成1-60话的章节数据
for (let i = 1; i <= 60; i++) {
  const chapterNum = String(i).padStart(3, '0');
  const chapterData = {
    id: `chapter-${chapterNum}`,
    title: `第${i}话：`,
    publishDate: "2024-01-01", // 可以根据实际发布日期调整
    description: "",
    thumbnail: `/images/chapters/${chapterNum}/thumbnail.png`,
    pages: []
  };
  
  // 假设每话有20页（根据实际情况调整）
  for (let j = 1; j <= 20; j++) {
    const pageNum = String(j).padStart(3, '0');
    chapterData.pages.push(`/images/chapters/${chapterNum}/${pageNum}.png`);
  }
  
  // 写入文件
  const filePath = path.join('content/chapters', `chapter-${chapterNum}.json`);
  fs.writeFileSync(filePath, JSON.stringify(chapterData, null, 2));
  
  console.log(`Created: ${filePath}`);
}
```

运行脚本：
```bash
node generate-chapters.js
```

### 4. 验证章节

添加章节后，您可以通过以下方式验证：

1. **本地验证**：
   ```bash
   npm run dev
   ```
   访问 `http://localhost:3000/chapters` 查看章节列表

2. **检查图片路径**：
   确保所有图片文件存在且路径正确

3. **检查JSON格式**：
   确保章节数据文件格式正确

### 5. 部署更新

完成章节添加后，使用部署脚本更新网站：

```bash
# Windows
scripts/pages-deploy.bat

# Linux/Mac
scripts/pages-deploy.sh
```

## 注意事项

1. **图片格式**：所有图片必须是 `.png` 格式
2. **文件命名**：页面图片必须使用三位数字命名（001.png, 002.png等）
3. **路径一致性**：确保JSON中的图片路径与实际文件路径一致
4. **性能优化**：大图片会影响加载速度，建议适当压缩
5. **备份**：添加大量章节前建议备份现有数据

## 常见问题

### Q: 图片不显示怎么办？
A: 检查以下几点：
- 图片文件是否存在
- 文件名是否正确（包括大小写）
- 路径是否与JSON中一致
- 图片格式是否为.png

### Q: 章节顺序不对怎么办？
A: 章节按 `publishDate` 降序排列，可以调整发布日期来改变顺序。

### Q: 如何批量重命名图片？
A: 可以使用以下脚本（Linux/Mac）：
```bash
# 在章节目录中执行
for i in *.jpg; do
  new_name=$(printf "%03d.png" "${i%.*}")
  mv "$i" "$new_name"
done
```

## 联系支持

如果在添加章节过程中遇到问题，请检查：
1. 控制台错误信息
2. 网络请求状态
3. 文件权限

需要进一步帮助，请提供详细的错误信息和操作步骤。