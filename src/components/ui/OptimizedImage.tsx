import Image from 'next/image'
import { useState } from 'react'
import { getImageUrl } from '@/lib/images'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallback?: string
  unoptimized?: boolean
}

/**
 * 优化图片组件
 * 统一处理图片加载、错误处理和性能优化
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fallback = '/images/cover.jpg',
  unoptimized = true // GitHub Pages环境下需要禁用优化
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(src))
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallback) {
      setImgSrc(fallback)
      setHasError(true)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // 如果没有提供宽高，使用默认值
  const imgWidth = width || (height ? undefined : 800)
  const imgHeight = height || (width ? undefined : 600)

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'opacity-50' : ''} ${className}`}
        priority={priority}
        unoptimized={unoptimized}
        onError={handleError}
        onLoad={handleLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-gray-500 text-sm">图片加载失败</span>
        </div>
      )}
    </div>
  )
}

/**
 * 章节缩略图组件
 */
export function ChapterThumbnail({ chapterId, title }: { chapterId: string; title: string }) {
  return (
    <OptimizedImage
      src={`/images/chapters/${chapterId}/thumbnail.jpg`}
      alt={`${title} 缩略图`}
      width={200}
      height={150}
      className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
    />
  )
}

/**
 * 新闻缩略图组件
 */
export function NewsThumbnail({ newsId, title }: { newsId: string; title: string }) {
  return (
    <OptimizedImage
      src={`/images/news/${newsId}.jpg`}
      alt={`${title} 缩略图`}
      width={300}
      height={200}
      className="rounded-lg shadow-md"
    />
  )
}

/**
 * 角色头像组件
 */
export function CharacterAvatar({ characterId, name }: { characterId: string; name: string }) {
  return (
    <OptimizedImage
      src={`/images/characters/${characterId}.jpg`}
      alt={`${name} 头像`}
      width={120}
      height={120}
      className="rounded-full border-4 border-white shadow-lg"
    />
  )
}