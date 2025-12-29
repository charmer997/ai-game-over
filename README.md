# 漫画同好网站

一个为漫画爱好者打造的现代化网站，提供漫画阅读、人物介绍和最新情报。

## 🚀 技术栈

- **框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS
- **内容管理**: 基于文件的内容管理 (JSON + Markdown)
- **部署**: GitHub Pages / Vercel (静态托管)
- **类型检查**: TypeScript

## 📁 项目结构

```
manga-fansite/
├── public/                 # 静态资源
│   ├── images/            # 图片资源
│   │   ├── chapters/      # 章节图片
│   │   ├── characters/    # 人物图片
│   │   └── news/          # 新闻图片
│   └── favicon.ico
├── src/
│   ├── components/        # React组件
│   │   ├── layout/        # 布局组件
│   │   └── ui/            # UI组件
│   ├── lib/               # 工具函数
│   ├── pages/             # Next.js页面
│   └── styles/            # 样式文件
├── content/               # 内容文件
│   ├── chapters/          # 章节信息 (JSON)
│   ├── characters/        # 人物信息 (Markdown)
│   └── news/              # 新闻情报 (Markdown)
└── package.json
```

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm run export
```

构建后的静态文件将在 `out` 目录中。

## 📝 内容管理

### 添加章节

在 `content/chapters/` 目录下创建 JSON 文件：

```json
{
  "id": "chapter-002",
  "title": "第2话：新的冒险",
  "publishDate": "2024-01-08",
  "description": "主角开始了新的冒险",
  "thumbnail": "/images/chapters/002/thumbnail.jpg",
  "pages": [
    "/images/chapters/002/page-001.jpg",
    "/images/chapters/002/page-002.jpg"
  ]
}
```

### 添加人物

在 `content/characters/` 目录下创建 Markdown 文件：

```markdown
---
name: "角色名"
title: "角色称号"
avatar: "/images/characters/role.jpg"
firstAppearance: "chapter-001"
---

# 人物介绍

这里是人物的详细介绍...
```

### 添加新闻

在 `content/news/` 目录下创建 Markdown 文件：

```markdown
---
title: "新闻标题"
excerpt: "新闻摘要"
publishDate: "2024-01-01"
thumbnail: "/images/news/thumb.jpg"
---

# 新闻内容

这里是新闻的详细内容...
```

## 🚀 部署

### GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `gh-pages` 分支作为源

### Vercel

1. 连接 GitHub 仓库到 Vercel
2. 自动部署配置
3. 自定义域名设置

## 🎨 自定义

### 主题颜色

在 `tailwind.config.js` 中修改主题颜色：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 自定义主色调
      }
    }
  }
}
```

### 布局组件

修改 `src/components/layout/Layout.tsx` 来自定义网站布局。

### 样式

在 `src/styles/globals.css` 中添加全局样式。

## 🔧 性能优化

- 图片懒加载
- 静态生成 (SSG)
- 代码分割
- 资源压缩

## 📱 响应式设计

网站完全响应式，支持：
- 移动端 (320px+)
- 平板端 (768px+)
- 桌面端 (1024px+)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License