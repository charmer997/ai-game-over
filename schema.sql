-- D1 数据库表结构
-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  page_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_comments_page_id ON comments(page_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- 示例数据（可选）
-- INSERT INTO comments (content, author, page_id, created_at) VALUES 
--   ('这是第一条评论', '访客1', '/chapters/1', '2023-01-01T00:00:00Z'),
--   ('这是第二条评论', '访客2', '/chapters/1', '2023-01-02T00:00:00Z');