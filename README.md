### 小孩子不懂事随便写着玩玩

## 🚀 技术栈

- **框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS
- **内容管理**: 基于文件的内容管理 (JSON + Markdown)
- **部署**: Cloudflare Pages / Vercel (静态托管)
- **评论系统**: Giscus + D1 (双评论系统)
- **类型检查**: TypeScript


```
manga-fansite/
├── public/                 # 静态资源 R2上的
│   ├── images/            # 图片资源
│   │   ├── chapters/      # 章节图片
│   │   ├── characters/    # 人物图片
│   │   ├── news/          # 新闻图片
│   │   └── volumes/       # 单行本封面
│   └── favicon.ico
├── src/
│   ├── components/        # React组件
│   │   ├── layout/        # 布局组件
│   │   ├── ui/            # UI组件
│   │   ├── manga/         # 漫画阅读器组件
│   │   └── comments/      # 评论系统组件
│   ├── lib/               # 工具函数
│   │   ├── api.ts         # 数据获取
│   │   ├── images.ts      # 图片路径管理
│   │   └── volumes.ts     # 单行本管理
│   ├── pages/             # Next.js页面
│   │   ├── chapters/      # 章节页面
│   │   ├── characters/    # 人物页面
│   │   └── news/          # 情报页面
│   └── styles/            # 样式文件
├── content/               # 内容文件
│   ├── chapters/          # 章节信息 (JSON)
│   ├── characters/        # 人物信息 (Markdown)
│   └── news/              # 新闻情报 (Markdown)
├── scripts/               # 部署脚本
└── package.json
```

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- npm 或 yarn
- Wrangler CLI (用于Cloudflare部署)

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
```

## 📝 内容管理

### 添加章节

在 `content/chapters/` 目录下创建 JSON 文件：

### 添加人物信息
在 `content/characters/` 下添加Markdown文件

```Markdown格式
---
name: "浅葱ゆきや"
title: "test"
avatar: "/images/characters/2d.gif"
firstAppearance: "第一话"
age: "15岁"
gender: "高中生"
---
```


### 添加情报

在 `content/news/` 目录下创建 Markdown 文件：

```markdown
---
title: "新闻标题"
excerpt: "新闻摘要"
publishDate: "2024-01-01"
thumbnail: "/images/news/thumb.jpg" //缩略图
---
```
### 用的 gray-matter这个库来解析Markdown
要添加更多目前只能改`characters/index`

其实是我想不到什么好的展现方式OvO，本来想抄bgm的。







