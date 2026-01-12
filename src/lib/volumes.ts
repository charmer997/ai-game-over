// 定义单行本分类
export interface Volume {
  id: string
  title: string
  description?: string
  startChapter: number
  endChapter: number
  cover?: string
}

// 定义单行本分类配置
export const volumes: Volume[] = [
  {
    id: 'volume-1',
    title: '第一卷',
    description: '第1-7话',
    startChapter: 1,
    endChapter: 7,
    cover: '/images/volumes/volume-1.jpg'
  },
  {
    id: 'volume-2',
    title: '第二卷',
    description: '第8-14话',
    startChapter: 8,
    endChapter: 14,
    cover: '/images/volumes/volume-2.jpg'
  },
  {
    id: 'volume-3',
    title: '第三卷 留宿回+厨房回',
    description: '第15-22话',
    startChapter: 15,
    endChapter: 22,
    cover: '/images/volumes/volume-3.jpg'
  },
  {
    id: 'volume-4',
    title: '第四卷 生病回+百奇回',
    description: '第23-30话',
    startChapter: 23,
    endChapter: 30,
    cover: '/images/volumes/volume-4.jpg'
  },
  {
    id: 'volume-5',
    title: '第五卷 三天交往+体育祭开篇',
    description: '第31-40话',
    startChapter: 31,
    endChapter: 40,
    cover: '/images/volumes/volume-5.jpg'
  },
  {
    id: 'volume-6',
    title: '第六卷',
    description: '第41-49话',
    startChapter: 41,
    endChapter: 49,
    cover: '/images/volumes/volume-6.jpg'
  }
]

// 定义番外分类
export const extraCategories = [
  {
    id: 'extra',
    title: '番外',
    description: '特别篇和番外故事',
    cover: '/images/volumes/extra.jpg'
  },
  {
    id: 'fanbox',
    title: 'Fanbox',
    description: '饭盒限定内容老师的饭盒网址：https://domoto.fanbox.cc/ 有能力的厨子可以支持一下',
    cover: '/images/volumes/fanbox.jpg'
  }
]

// 从章节ID中提取章节号
export function extractChapterNumber(chapterId: string): number {
  const match = chapterId.match(/chapter-(\d+)/)
  if (match) {
    return parseInt(match[1], 10)
  }
  
  // 处理特殊情况，如 chapter-20.2
  const specialMatch = chapterId.match(/chapter-(\d+)\.(\d+)/)
  if (specialMatch) {
    return parseInt(specialMatch[1], 10)
  }
  
  return 0
}

// 判断章节是否属于番外
export function isExtraChapter(chapterId: string): boolean {
  return chapterId.includes('.') || chapterId.includes('extra') || chapterId === 'chapter-20.2'
}

// 获取所有单行本
export function getAllVolumes() {
  return volumes
}

// 获取所有番外分类
export function getExtraCategories() {
  return extraCategories
}

// 获取章节所属的单行本
export function getChapterVolume(chapterId: string) {
  const chapterNumber = extractChapterNumber(chapterId)
  
  return volumes.find(volume => 
    chapterNumber >= volume.startChapter && chapterNumber <= volume.endChapter
  )
}

// 获取章节所属的分类（单行本或番外）
export function getChapterCategory(chapterId: string) {
  if (isExtraChapter(chapterId)) {
    return extraCategories.find(cat => cat.id === 'extra')
  }
  
  return getChapterVolume(chapterId)
}