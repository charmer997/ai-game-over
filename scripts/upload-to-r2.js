/**
 * R2存储上传脚本
 * 批量上传图片到Cloudflare R2存储
 */

const fs = require('fs');
const path = require('path');

// 模拟R2客户端（实际使用时需要连接真实的R2）
class R2Client {
  constructor(bucketName) {
    this.bucketName = bucketName;
    this.uploadedFiles = [];
  }

  async put(key, file) {
    console.log(`📤 上传文件: ${key}`);
    
    // 模拟上传过程
    const fileSize = file.size || fs.statSync(file.path || file).size;
    this.uploadedFiles.push({
      key,
      size: fileSize,
      url: `https://${this.bucketName}.workers.dev/${key}`
    });
    
    console.log(`✅ 上传完成: ${key} (${fileSize} bytes)`);
    return { success: true };
  }

  async list(prefix = '') {
    return this.uploadedFiles.filter(file => file.key.startsWith(prefix));
  }
}

// 递归获取目录下所有文件
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// 上传章节图片
async function uploadChapterImages(r2) {
  const chaptersDir = path.join(__dirname, '../public/images/chapters');
  
  if (!fs.existsSync(chaptersDir)) {
    console.log('❌ 章节图片目录不存在');
    return;
  }

  const chapterDirs = fs.readdirSync(chaptersDir)
    .filter(file => {
      const fullPath = path.join(chaptersDir, file);
      return fs.statSync(fullPath).isDirectory();
    });

  console.log(`📚 找到 ${chapterDirs.length} 个章节目录`);

  for (const chapterId of chapterDirs) {
    const chapterPath = path.join(chaptersDir, chapterId);
    const files = getAllFiles(chapterPath);
    
    console.log(`📖 处理章节 ${chapterId}: ${files.length} 个文件`);

    for (const filePath of files) {
      const relativePath = path.relative(chaptersDir, filePath);
      const r2Key = `chapters/${chapterId}/${relativePath}`;
      
      await r2.put(r2Key, {
        path: filePath,
        size: fs.statSync(filePath).size
      });
    }
  }
}

// 上传新闻图片
async function uploadNewsImages(r2) {
  const newsDir = path.join(__dirname, '../public/images/news');
  
  if (!fs.existsSync(newsDir)) {
    console.log('❌ 新闻图片目录不存在');
    return;
  }

  const files = fs.readdirSync(newsDir)
    .filter(file => fs.statSync(path.join(newsDir, file)).isFile());

  console.log(`📰 找到 ${files.length} 个新闻图片`);

  for (const file of files) {
    const filePath = path.join(newsDir, file);
    const r2Key = `news/${file}`;
    
    await r2.put(r2Key, {
      path: filePath,
      size: fs.statSync(filePath).size
    });
  }
}

// 上传角色图片
async function uploadCharacterImages(r2) {
  const charactersDir = path.join(__dirname, '../public/images/characters');
  
  if (!fs.existsSync(charactersDir)) {
    console.log('❌ 角色图片目录不存在');
    return;
  }

  const files = fs.readdirSync(charactersDir)
    .filter(file => fs.statSync(path.join(charactersDir, file)).isFile());

  console.log(`👥 找到 ${files.length} 个角色图片`);

  for (const file of files) {
    const filePath = path.join(charactersDir, file);
    const r2Key = `characters/${file}`;
    
    await r2.put(r2Key, {
      path: filePath,
      size: fs.statSync(filePath).size
    });
  }
}

// 生成上传报告
function generateReport(r2) {
  console.log('\n📊 上传报告:');
  console.log('================================');
  
  const chapters = r2.uploadedFiles.filter(file => file.key.startsWith('chapters/'));
  const news = r2.uploadedFiles.filter(file => file.key.startsWith('news/'));
  const characters = r2.uploadedFiles.filter(file => file.key.startsWith('characters/'));
  
  console.log(`📚 章节图片: ${chapters.length} 个`);
  console.log(`📰 新闻图片: ${news.length} 个`);
  console.log(`👥 角色图片: ${characters.length} 个`);
  console.log(`📁 总计: ${r2.uploadedFiles.length} 个文件`);
  
  const totalSize = r2.uploadedFiles.reduce((sum, file) => sum + file.size, 0);
  console.log(`💾 总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n🔗 文件URL示例:');
  if (chapters.length > 0) {
    console.log(`   章节: ${chapters[0].url}`);
  }
  if (news.length > 0) {
    console.log(`   新闻: ${news[0].url}`);
  }
  if (characters.length > 0) {
    console.log(`   角色: ${characters[0].url}`);
  }
}

// 主上传函数
async function uploadToR2() {
  console.log('🚀 开始上传到 R2 存储...');
  
  const r2 = new R2Client('manga-fans-assets');
  
  try {
    // 上传章节图片
    await uploadChapterImages(r2);
    
    // 上传新闻图片
    await uploadNewsImages(r2);
    
    // 上传角色图片
    await uploadCharacterImages(r2);
    
    // 生成报告
    generateReport(r2);
    
    console.log('\n✅ 所有文件上传完成！');
    
  } catch (error) {
    console.error('❌ 上传失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  uploadToR2();
}

module.exports = { uploadToR2, R2Client };