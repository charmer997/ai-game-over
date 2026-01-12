import { useEffect, useRef, useState } from 'react'
import { getImageUrl } from '@/lib/images'

interface MangaViewerProps {
  pages: string[]
  title: string
  onNextChapter?: () => void
  onPrevChapter?: () => void
  hasNextChapter?: boolean
  hasPrevChapter?: boolean
  externalFullscreen?: boolean
}

export default function MangaViewerSinglePage({
  pages,
  title,
  onNextChapter,
  onPrevChapter,
  hasNextChapter,
  hasPrevChapter,
  externalFullscreen = false,
}: MangaViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  
  // 使用外部全屏状态或内部全屏状态
  const isActuallyFullscreen = externalFullscreen || isFullscreen

  // 重置UI显示计时器
  const resetUI = () => {
    setShowUI(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowUI(false), 500)
  }

  // 下一页
  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1)
    } else if (hasNextChapter && onNextChapter) {
      // 最后一页，自动跳转到下一章
      onNextChapter()
    }
  }

  // 上一页
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    } else if (hasPrevChapter && onPrevChapter) {
      // 第一页，自动跳转到上一章
      onPrevChapter()
    }
  }

  // 键盘事件处理
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextPage()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevPage()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentPage, hasNextChapter, hasPrevChapter])

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextPage()
      resetUI() // 触摸滑动后显示UI
    } else if (isRightSwipe) {
      prevPage()
      resetUI() // 触摸滑动后显示UI
    }
  }

  // 点击区域处理
  const handleClick = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth
    if (x < 0.3) {
      prevPage()
      resetUI() // 点击导航后显示UI
    } else if (x > 0.7) {
      nextPage()
      resetUI() // 点击导航后显示UI
    } else {
      setShowUI(v => !v) // 点击中间区域切换UI显示状态
    }
  }

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Safari/iOS 全屏优化
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if ((elem as any).webkitRequestFullscreen) {
        // Safari 兼容
        (elem as any).webkitRequestFullscreen()
      } else if ((elem as any).mozRequestFullScreen) {
        // Firefox 兼容
        (elem as any).mozRequestFullScreen()
      } else if ((elem as any).msRequestFullscreen) {
        // IE/Edge 兼容
        (elem as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        // Safari 兼容
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        // Firefox 兼容
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        // IE/Edge 兼容
        (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // 初始化UI显示
  useEffect(() => {
    resetUI()
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  return (
    <div
      className={`relative ${externalFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full h-screen'} bg-white overflow-hidden fullscreen-ios scroll-container`}
      onMouseMove={externalFullscreen ? undefined : resetUI}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 主图片区域 - Sunday-Webry风格：图片显示区域全屏 */}
      <div className={`flex items-center justify-center ${externalFullscreen ? 'h-screen' : 'h-full'} manga-reader`}>
        {pages.map((page, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              index === currentPage ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={getImageUrl(page)}
              alt={`Page ${index + 1}`}
              className="select-none manga-page"
              draggable={false}
              loading="eager"
              decoding="async"
              style={{
                imageRendering: 'auto',
                // Webry核心：图片高度始终撑满整个浏览器视口
                height: externalFullscreen ? '100vh' : '100%',
                width: 'auto',
                objectFit: 'contain',
                maxHeight: externalFullscreen ? '100vh' : 'none',
                maxWidth: externalFullscreen ? '100vw' : 'none',
                transform: 'scale(0.95)',
                transformOrigin: 'center center'
              } as React.CSSProperties}
            />
          </div>
        ))}
      </div>

      {/* 顶部UI - 外部全屏时隐藏 */}
      {!externalFullscreen && (
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
            showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
        <div className="flex items-center justify-between text-white">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="全屏"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
        </div>
        </div>
      )}

      {/* 底部UI - 外部全屏时隐藏 */}
      {!externalFullscreen && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
            showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
        {/* 页面指示器 */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex space-x-1">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentPage(index)
                  resetUI() // 点击页面指示器后显示UI
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPage 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`跳转到第 ${index + 1} 页`}
              />
            ))}
          </div>
        </div>

        {/* 页面信息和导航按钮 */}
        <div className="flex items-center justify-between text-white text-sm">
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevPage()
              resetUI() // 点击按钮后显示UI
            }}
            disabled={currentPage === 0 && !hasPrevChapter}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>上一页</span>
          </button>

          <span className="text-white/80">
            {currentPage + 1} / {pages.length}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextPage()
              resetUI() // 点击按钮后显示UI
            }}
            disabled={currentPage === pages.length - 1 && !hasNextChapter}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
          >
            <span>下一页</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 章节导航 */}
        <div className="flex items-center justify-center mt-3 space-x-4">
          {hasPrevChapter && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPrevChapter?.()
                resetUI() // 点击按钮后显示UI
              }}
              className="text-white/80 hover:text-white text-sm transition-colors touch-target px-2 py-1"
            >
              上一章
            </button>
          )}
          {hasNextChapter && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNextChapter?.()
                resetUI() // 点击按钮后显示UI
              }}
              className="text-white/80 hover:text-white text-sm transition-colors touch-target px-2 py-1"
            >
              下一章
            </button>
          )}
        </div>
        </div>
      )}

      {/* 左右点击提示 - 外部全屏时隐藏 */}
      {!externalFullscreen && showUI && (
        <>
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/30 pointer-events-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black/30 pointer-events-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}
    </div>
  )
}