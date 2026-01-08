-- 更新现有数据库结构，添加自定义评论系统所需的表

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 自定义评论表（替换现有的Giscus评论表）
CREATE TABLE IF NOT EXISTS custom_comments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  user_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_custom_comments_page_id ON custom_comments(page_id);
CREATE INDEX IF NOT EXISTS idx_custom_comments_created_at ON custom_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);