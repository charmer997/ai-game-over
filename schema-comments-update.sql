-- D1 数据库表结构更新
-- 为评论表添加更多功能字段

-- 添加编辑功能相关字段
ALTER TABLE comments ADD COLUMN updated_at TEXT;
ALTER TABLE comments ADD COLUMN is_edited INTEGER DEFAULT 0;

-- 添加回复功能相关字段
ALTER TABLE comments ADD COLUMN parent_id INTEGER DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 添加点赞功能相关字段
ALTER TABLE comments ADD COLUMN likes INTEGER DEFAULT 0;

-- 添加审核功能相关字段
ALTER TABLE comments ADD COLUMN status TEXT DEFAULT 'approved'; -- approved, pending, rejected
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- 添加举报功能相关字段
ALTER TABLE comments ADD COLUMN reports INTEGER DEFAULT 0;

-- 添加IP地址字段用于防刷
ALTER TABLE comments ADD COLUMN ip_address TEXT;

-- 添加邮箱和网站字段
ALTER TABLE comments ADD COLUMN email TEXT;
ALTER TABLE comments ADD COLUMN website TEXT;

-- 创建评论点赞表
CREATE TABLE IF NOT EXISTS comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 创建唯一索引防止同一IP重复点赞
CREATE UNIQUE INDEX IF NOT EXISTS idx_comment_likes_unique ON comment_likes(comment_id, ip_address);

-- 创建评论举报表
CREATE TABLE IF NOT EXISTS comment_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 创建敏感词表
CREATE TABLE IF NOT EXISTS sensitive_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

-- 插入一些默认敏感词
INSERT OR IGNORE INTO sensitive_words (word, created_at) VALUES 
  ('垃圾', datetime('now')),
  ('傻逼', datetime('now')),
  ('操你妈', datetime('now')),
  ('死全家', datetime('now')),
  ('滚', datetime('now'));