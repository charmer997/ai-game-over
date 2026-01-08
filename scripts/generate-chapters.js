/**
 * 批量生成章节数据脚本
 * 用于快速创建1-60话的章节数据文件
 */

const fs = require('fs');
const path = require('path');

// 配置参数
const config = {
  startChapter: 1,
  endChapter: 60,
  pagesPerChapter: 20, // 每章页数，根据实际情况调整
  baseDate: '2024-01-01', // 基础发布日期
  contentDir: 'content/chapters',
  imagesDir: 'public/images/chapters'
};

// 生成章节数据
function generateChapterData(chapterNum) {
  const chapterId = String(chapterNum).padStart(3, '0');
  const pages = [];
  
  // 生成页面图片路径
  for (let i = 1; i <= config.pagesPerChapter; i++) {
    const pageNum = String(i).padStart(3, '0');
    pages.push(`/images/chapters/${chapterId}/${pageNum}.png`);
  }
  
  // 计算发布日期（每章间隔一天）
  const date = new Date(config.baseDate);
  date.setDate(date.getDate() + chapterNum - 1);
  const publishDate = date.toISOString().split('T')[0];
  
  return {
    id: `chapter-${chapterId}`,
    title: `第${chapterNum}话`,
    publishDate: publishDate,
    description: `第${chapterNum}话的内容`,
    thumbnail: `/images/chapters/${chapterId}/thumbnail.png`,
    pages: pages
  };
}

// 创建目录（如果不存在）
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`创建目录: ${dirPath}`);
  }
}

// 生成所有章节数据文件
function generateAllChapters() {
  console.log(`开始生成第${config.startChapter}话到第${config.endChapter}话的数据...`);
  
  // 确保目录存在
  ensureDirectoryExists(config.contentDir);
  ensureDirectoryExists(config.imagesDir);
  
  // 创建章节图片目录
  for (let i = config.startChapter; i <= config.endChapter; i++) {
    const chapterDir = path.join(config.imagesDir, String(i).padStart(3, '0'));
    ensureDirectoryExists(chapterDir);
  }
  
  // 生成章节数据文件
  for (let i = config.startChapter; i <= config.endChapter; i++) {
    const chapterData = generateChapterData(i);
    const filePath = path.join(config.contentDir, `chapter-${String(i).padStart(3, '0')}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(chapterData, null, 2));
    console.log(`✓ 创建: ${filePath}`);
  }
  
  console.log(`\n完成！已生成${config.endChapter - config.startChapter + 1}个章节数据文件。`);
  console.log('\n接下来的步骤：');
  console.log('1. 将图片文件放入对应的目录中');
  console.log('2. 检查图片文件名是否正确（001.png, 002.png等）');
  console.log('3. 运行 npm run dev 本地测试');
  console.log('4. 使用部署脚本上传到Cloudflare Pages');
}

// 生成图片目录结构说明
function generateImageStructure() {
  console.log('\n=== 图片目录结构 ===');
  for (let i = config.startChapter; i <= config.endChapter; i++) {
    const chapterId = String(i).padStart(3, '0');
    console.log(`public/images/chapters/${chapterId}/`);
    console.log(`├── 001.png`);
    console.log(`├── 002.png`);
    console.log(`├── ...`);
    console.log(`├── ${String(config.pagesPerChapter).padStart(3, '0')}.png`);
    console.log(`└── thumbnail.png`);
    if (i < Math.min(config.endChapter, config.startChapter + 2)) {
      console.log('');
    }
  }
  if (config.endChapter > config.startChapter + 2) {
    console.log('...（其他章节类似）');
  }
}

// 检查现有章节
function checkExistingChapters() {
  console.log('\n=== 检查现有章节 ===');
  const existingChapters = [];
  
  for (let i = config.startChapter; i <= config.endChapter; i++) {
    const chapterId = String(i).padStart(3, '0');
    const filePath = path.join(config.contentDir, `chapter-${chapterId}.json`);
    
    if (fs.existsSync(filePath)) {
      existingChapters.push(chapterId);
    }
  }
  
  if (existingChapters.length > 0) {
    console.log(`发现${existingChapters.length}个已存在的章节：`);
    existingChapters.forEach(chapter => {
      console.log(`  - chapter-${chapter}.json`);
    });
    console.log('\n⚠️  运行脚本将覆盖这些文件！');
  } else {
    console.log('✓ 没有发现冲突的章节文件');
  }
}

// 主函数
function main() {
  console.log('=== 漫画章节批量生成工具 ===\n');
  
  // 检查现有章节
  checkExistingChapters();
  
  // 显示将要生成的配置
  console.log('\n=== 生成配置 ===');
  console.log(`章节范围: 第${config.startChapter}话 - 第${config.endChapter}话`);
  console.log(`每章页数: ${config.pagesPerChapter}页`);
  console.log(`基础日期: ${config.baseDate}`);
  
  // 显示图片目录结构
  generateImageStructure();
  
  // 询问是否继续
  console.log('\n是否继续生成？(y/n)');
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(input) {
    if (input.trim().toLowerCase() === 'y') {
      generateAllChapters();
    } else {
      console.log('已取消操作');
    }
    process.exit();
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  generateChapterData,
  generateAllChapters,
  config
};