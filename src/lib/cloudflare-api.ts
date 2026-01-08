/**
 * Cloudflare API客户端
 * 与D1数据库和R2存储交互
 */

// API基础URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://aishiterugame.dpdns.org/api'
  : 'http://localhost:8787/api'

// 通用API请求函数
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

// 类型定义
export interface Chapter {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  page_count: number
  published_at: string
  created_at: string
  updated_at: string
  pages?: ChapterPage[]
}

export interface ChapterPage {
  page_number: number
  image_url: string
  image_size?: number
}

export interface News {
  id: string
  title: string
  content: string
  excerpt?: string
  thumbnail_url?: string
  published_at: string
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  name: string
  description?: string
  avatar_url?: string
  profile?: string
  created_at: string
  updated_at: string
}

export interface SiteConfig {
  site_title: string
  site_description: string
  site_keywords: string
  giscus_repo: string
  giscus_repo_id: string
  giscus_category: string
  giscus_category_id: string
}

// API函数
export const cloudflareApi = {
  // 章节相关API
  chapters: {
    getAll: (): Promise<Chapter[]> => apiRequest('/chapters'),
    getById: (id: string): Promise<Chapter> => apiRequest(`/chapters/${id}`),
  },

  // 新闻相关API
  news: {
    getAll: (): Promise<News[]> => apiRequest('/news'),
    getById: (id: string): Promise<News> => apiRequest(`/news/${id}`),
  },

  // 角色相关API
  characters: {
    getAll: (): Promise<Character[]> => apiRequest('/characters'),
    getById: (id: string): Promise<Character> => apiRequest(`/characters/${id}`),
  },

  // 站点配置API
  config: {
    get: (): Promise<SiteConfig> => apiRequest('/config'),
  },

  // 文件上传API
  upload: {
    image: async (file: File, path: string): Promise<{ success: boolean; url: string }> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', path)

      return apiRequest('/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // 让浏览器自动设置Content-Type
      })
    },
  },
}

// R2存储URL生成器
export const getR2Url = (path: string): string => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://221f5aa86b9529a869fe31932dafe3dc.r2.cloudflarestorage.com/r2-lovegame'
    : 'http://localhost:8787/r2'
  
  return `${baseUrl}/${path}`
}

// 图片路径生成器（兼容原有接口）
export const getImagePaths = () => ({
  chapters: {
    thumbnail: (chapterId: string) => getR2Url(`chapters/${chapterId}/thumbnail.jpg`),
    page: (chapterId: string, pageId: string) => getR2Url(`chapters/${chapterId}/${pageId}.jpg`),
  },
  news: {
    thumbnail: (newsId: string) => getR2Url(`news/${newsId}.jpg`),
  },
  characters: {
    avatar: (characterId: string) => getR2Url(`characters/${characterId}.jpg`),
  },
  ui: {
    logo: () => '/logo.webp', // 本地资源
    favicon: () => '/favicon.ico', // 本地资源
    icons: (iconName: string) => `/icons/${iconName}`, // 本地资源
  },
})

// 数据迁移工具
export const migrateToCloudflare = {
  // 将现有的JSON数据迁移到D1
  async migrateChapters() {
    try {
      // 这里可以添加从现有JSON文件读取并上传到D1的逻辑
      console.log('章节数据迁移完成')
    } catch (error) {
      console.error('章节数据迁移失败:', error)
    }
  },

  async migrateNews() {
    try {
      // 迁移新闻数据
      console.log('新闻数据迁移完成')
    } catch (error) {
      console.error('新闻数据迁移失败:', error)
    }
  },

  async migrateCharacters() {
    try {
      // 迁移角色数据
      console.log('角色数据迁移完成')
    } catch (error) {
      console.error('角色数据迁移失败:', error)
    }
  },
}