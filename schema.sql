-- 漫画同好网站数据库结构
-- Cloudflare D1 SQLite

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  page_count INTEGER DEFAULT 0,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 章节图片表
CREATE TABLE IF NOT EXISTS chapter_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  image_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE(chapter_id, page_number)
);

-- 新闻表
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  thumbnail_url TEXT,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  profile TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评论表（使用Giscus集成，这里存储基础信息）
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discussion_id TEXT NOT NULL,
  category_id TEXT,
  title TEXT,
  url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 站点配置表
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chapters_published_at ON chapters(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_pages_chapter_id ON chapter_pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);

-- 插入默认站点配置
INSERT OR IGNORE INTO site_config (key, value, description) VALUES
('site_title', '愛してるゲームを終わらせたい', '网站标题'),
('site_description', '漫画同好网站 - 提供最新漫画情报、章节阅读和人物介绍', '网站描述'),
('site_keywords', '漫画,同好,愛してるゲームを終わらせたい,漫画资源', '网站关键词'),
('giscus_repo', 'your-username/manga-fans-site', 'Giscus评论仓库名'),
('giscus_repo_id', 'your-repo-id', 'Giscus仓库ID'),
('giscus_category', 'General', 'Giscus评论分类'),
('giscus_category_id', 'your-category-id', 'Giscus分类ID');

-- 插入示例数据
INSERT OR IGNORE INTO chapters (id, title, description, page_count) VALUES
('chapter-001', '第1话：开始', '故事的开端', 20),
('chapter-002', '第2话：发展', '剧情的发展', 22);

INSERT OR IGNORE INTO chapter_pages (chapter_id, page_number, image_url) VALUES
('chapter-001', 1, 'https://your-r2-bucket.workers.dev/chapters/001/001.jpg'),
('chapter-001', 2, 'https://your-r2-bucket.workers.dev/chapters/001/002.jpg'),
('chapter-002', 1, 'https://your-r2-bucket.workers.dev/chapters/002/001.jpg'),
('chapter-002', 2, 'https://your-r2-bucket.workers.dev/chapters/002/002.jpg');

INSERT OR IGNORE INTO news (id, title, content, excerpt) VALUES
('news-001', '网站上线公告', '欢迎来到我们的漫画同好网站！', '网站正式上线啦！');

INSERT OR IGNORE INTO characters (id, name, description) VALUES
('character-001', '主角', '故事的主人公'),
('character-002', '配角', '重要的配角角色');