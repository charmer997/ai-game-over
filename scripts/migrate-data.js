/**
 * 数据迁移脚本
 * 将现有的JSON和Markdown文件迁移到Cloudflare D1数据库
 */

const fs = require('fs');
const path = require('path');

// 模拟D1数据库接口（实际使用时需要连接真实的D1）
class D1Database {
  constructor() {
    this.data = {
      chapters: [],
      chapter_pages: [],
      news: [],
      characters: [],
      site_config: []
    };
  }

  async prepare(query) {
    return {
      bind: (params) => ({
        run: async () => this.execute(query, params),
        first: async () => {
          const results = await this.execute(query, params);
          return results[0] || null;
        },
        all: async () => ({ results: await this.execute(query, params) })
      })
    };
  }

  async execute(query, params = []) {
    console.log(`执行查询: ${query}`);
    if (params.length > 0) {
      console.log(`参数: ${JSON.stringify(params)}`);
    }
    
    // 这里只是模拟，实际会执行真实的SQL
    return [];
  }
}

// 读取章节数据
function migrateChapters(db) {
  const chaptersDir = path.join(__dirname, '../content/chapters');
  
  if (!fs.existsSync(chaptersDir)) {
    console.log('❌ 章节目录不存在');
    return;
  }

  const chapterFiles = fs.readdirSync(chaptersDir)
    .filter(file => file.endsWith('.json'));

  console.log(`📚 找到 ${chapterFiles.length} 个章节文件`);

  chapterFiles.forEach(file => {
    const filePath = path.join(chaptersDir, file);
    const chapterData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`📖 迁移章节: ${chapterData.title}`);
    
    // 插入章节
    db.prepare(`
      INSERT OR REPLACE INTO chapters 
      (id, title, description, thumbnail_url, page_count, published_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      chapterData.id,
      chapterData.title,
      chapterData.description || '',
      chapterData.thumbnail || '',
      chapterData.pages?.length || 0,
      chapterData.publishedAt || new Date().toISOString()
    ).run();

    // 插入章节图片
    if (chapterData.pages && Array.isArray(chapterData.pages)) {
      chapterData.pages.forEach((page, index) => {
        db.prepare(`
          INSERT OR REPLACE INTO chapter_pages 
          (chapter_id, page_number, image_url)
          VALUES (?, ?, ?)
        `).bind(
          chapterData.id,
          index + 1,
          page.imageUrl || page.url || ''
        ).run();
      });
    }
  });
}

// 读取新闻数据
function migrateNews(db) {
  const newsDir = path.join(__dirname, '../content/news');
  
  if (!fs.existsSync(newsDir)) {
    console.log('❌ 新闻目录不存在');
    return;
  }

  const newsFiles = fs.readdirSync(newsDir)
    .filter(file => file.endsWith('.md'));

  console.log(`📰 找到 ${newsFiles.length} 个新闻文件`);

  newsFiles.forEach(file => {
    const filePath = path.join(newsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 解析Markdown frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      console.log(`⚠️  ${file} 格式错误，跳过`);
      return;
    }

    const [, frontmatterStr, body] = frontmatterMatch;
    const frontmatter = {};
    
    frontmatterStr.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        frontmatter[key.trim()] = valueParts.join(':').trim();
      }
    });

    const newsId = file.replace('.md', '');
    console.log(`📰 迁移新闻: ${frontmatter.title || newsId}`);

    db.prepare(`
      INSERT OR REPLACE INTO news 
      (id, title, content, excerpt, thumbnail_url, published_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      newsId,
      frontmatter.title || newsId,
      body.trim(),
      frontmatter.excerpt || '',
      frontmatter.thumbnail || frontmatter.image || '',
      frontmatter.date || new Date().toISOString()
    ).run();
  });
}

// 读取角色数据
function migrateCharacters(db) {
  const charactersDir = path.join(__dirname, '../content/characters');
  
  if (!fs.existsSync(charactersDir)) {
    console.log('❌ 角色目录不存在');
    return;
  }

  const characterFiles = fs.readdirSync(charactersDir)
    .filter(file => file.endsWith('.md'));

  console.log(`👥 找到 ${characterFiles.length} 个角色文件`);

  characterFiles.forEach(file => {
    const filePath = path.join(charactersDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 解析Markdown frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      console.log(`⚠️  ${file} 格式错误，跳过`);
      return;
    }

    const [, frontmatterStr, body] = frontmatterMatch;
    const frontmatter = {};
    
    frontmatterStr.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        frontmatter[key.trim()] = valueParts.join(':').trim();
      }
    });

    const characterId = file.replace('.md', '');
    console.log(`👥 迁移角色: ${frontmatter.name || characterId}`);

    db.prepare(`
      INSERT OR REPLACE INTO characters 
      (id, name, description, avatar_url, profile)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      characterId,
      frontmatter.name || characterId,
      frontmatter.description || '',
      frontmatter.avatar || frontmatter.image || '',
      body.trim()
    ).run();
  });
}

// 主迁移函数
async function migrate() {
  console.log('🚀 开始数据迁移...');
  
  const db = new D1Database();
  
  try {
    // 迁移章节
    migrateChapters(db);
    
    // 迁移新闻
    migrateNews(db);
    
    // 迁移角色
    migrateCharacters(db);
    
    console.log('✅ 数据迁移完成！');
    console.log('📊 迁移统计:');
    console.log(`   - 章节: ${db.data.chapters.length} 个`);
    console.log(`   - 新闻: ${db.data.news.length} 个`);
    console.log(`   - 角色: ${db.data.characters.length} 个`);
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrate();
}

module.exports = { migrate, D1Database };