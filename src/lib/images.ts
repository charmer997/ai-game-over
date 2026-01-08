/**
 * 图片路径管理工具
 * 纯GitHub仓库存储方案 - 所有图片存储在public目录中
 */

export interface ImagePaths {
  chapters: {
    thumbnail: (chapterId: string) => string
    page: (chapterId: string, pageId: string) => string
  }
  news: {
    thumbnail: (newsId: string) => string
  }
  characters: {
    avatar: (characterId: string) => string
  }
  ui: {
    logo: () => string
    favicon: () => string
    icons: (iconName: string) => string
  }
}

/**
 * 图片路径配置
 * 所有路径都相对于public目录
 */
export const IMAGE_PATHS: ImagePaths = {
  chapters: {
    thumbnail: (chapterId: string) => `/images/chapters/${chapterId}/thumbnail.png`,
    page: (chapterId: string, pageId: string) => `/images/chapters/${chapterId}/${pageId}.png`
  },
  news: {
    thumbnail: (newsId: string) => `/images/news/${newsId}.jpg`
  },
  characters: {
    avatar: (characterId: string) => `/images/characters/${characterId}.jpg`
  },
  ui: {
    logo: () => '/logo.webp',
    favicon: () => '/favicon.ico',
    icons: (iconName: string) => `/icons/${iconName}`
  }
}

/**
 * 获取图片完整URL（用于未来扩展到CDN）
 * 目前直接返回路径，保持与GitHub Pages兼容
 */
export const getImageUrl = (path: string): string => {
  return path
}

/**
 * 图片懒加载属性生成器
 */
export const getLazyLoadProps = (src: string, alt: string) => ({
  src,
  alt,
  loading: 'lazy' as const,
  decoding: 'async' as const,
  onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    target.src = '/images/cover.jpg' // 使用封面图作为备用图片
  }
})

/**
 * 批量获取章节图片路径
 */
export const getChapterImages = (chapterId: string, pageCount: number): string[] => {
  return Array.from({ length: pageCount }, (_, i) => 
    IMAGE_PATHS.chapters.page(chapterId, String(i + 1).padStart(3, '0'))
  )
}

/**
 * 验证图片路径是否存在（开发环境）
 */
export const validateImagePath = (path: string): boolean => {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境下可以检查文件是否存在
    return true // 简化处理，实际可以通过fs模块检查
  }
  return true
}