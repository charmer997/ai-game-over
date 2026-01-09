import { useEffect, useRef, useState } from 'react'
import MangaViewerSinglePage from './MangaViewerSinglePage'

interface MangaViewerProps {
  pages: string[]
  title: string
  onNextChapter?: () => void
  onPrevChapter?: () => void
  hasNextChapter?: boolean
  hasPrevChapter?: boolean
}

type Spread = {
  right: number | null
  left: number | null
}

/**
 * Webry 规则：
 * - 第 1 页：单页，占左页
 * - 之后：右 → 左 双页
 * - 最后一页若落单：仍占左页
 */
function buildSpreads(pages: string[]): Spread[] {
  const spreads: Spread[] = []
  if (pages.length === 0) return spreads

  // 第一页（左页）
  spreads.push({ right: null, left: 0 })

  // 后续双页
  for (let i = 1; i < pages.length; i += 2) {
    spreads.push({
      right: i,
      left: i + 1 < pages.length ? i + 1 : null,
    })
  }

  return spreads
}

/**
 * 桌面端单页模式阅读器
 */
function MangaViewerDesktopSinglePage({
  pages,
  title,
  onNextChapter,
  onPrevChapter,
  hasNextChapter,
  hasPrevChapter,
}: MangaViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  // 重置UI显示计时器
  const resetUI = () => {
    setShowUI(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowUI(false), 2000)
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
        // 键盘导航时不显示UI
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevPage()
        // 键盘导航时不显示UI
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentPage, hasNextChapter, hasPrevChapter])

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
      resetUI() // 点击中间区域时重置UI计时器
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
          className={`relative w-full h-screen bg-black text-white overflow-hidden fullscreen-ios scroll-container`}
          onMouseMove={resetUI}
          onClick={handleClick}
      >
        {/* 主图片区域 */}
        <div className="flex items-center justify-center h-full manga-reader">
          {pages.map((page, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                index === currentPage ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={page}
                alt={`Page ${index + 1}`}
                className="max-w-full max-h-full object-contain select-none manga-page"
                draggable={false}
                loading="eager"
                decoding="async"
                style={{
                  imageRendering: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        {/* 顶部UI */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 z-10 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {currentPage + 1} / {pages.length}
              </span>
              <div className="flex space-x-2">
                {hasPrevChapter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPrevChapter?.()
                      resetUI() // 点击按钮后显示UI
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm transition-colors touch-target"
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
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm transition-colors touch-target"
                  >
                    下一章
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部UI */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 z-10 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
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
          <div className="flex items-center justify-center space-x-4">
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
        </div>

        {/* 左右点击提示 */}
        {showUI && (
          <>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30 pointer-events-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/30 pointer-events-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </>
        )}
      </div>
  )
}

/**
 * 双页模式阅读器（适用于桌面端）
 */
function MangaViewerDoublePage({
  pages,
  title,
  onNextChapter,
  onPrevChapter,
  hasNextChapter,
  hasPrevChapter,
}: MangaViewerProps) {
  const spreads = buildSpreads(pages)
  const totalSpreads = spreads.length

  const VIEWER_PADDING = 72
  const maxImageHeight = `calc(100vh - ${VIEWER_PADDING}px)`

  const [index, setIndex] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  const resetUI = () => {
    setShowUI(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowUI(false), 2000)
  }

  const next = () => {
    if (index < totalSpreads - 1) setIndex(i => i + 1)
  }
  const prev = () => {
    if (index > 0) setIndex(i => i - 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
        // 键盘导航时不显示UI
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
        // 键盘导航时不显示UI
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])

  const onClick = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth
    if (x < 0.3) {
      prev()
      resetUI() // 点击导航后显示UI
    } else if (x > 0.7) {
      next()
      resetUI() // 点击导航后显示UI
    } else {
      setShowUI(v => !v) // 点击中间区域切换UI显示状态
      resetUI() // 点击中间区域时重置UI计时器
    }
  }

  return (
      <div
          className={`relative w-full h-screen bg-white text-black overflow-hidden fullscreen-ios scroll-container`}
          onMouseMove={resetUI}
          onClick={onClick}
      >
        {/* 居中壳（关键） */}
        <div className="absolute inset-0 flex justify-center overflow-hidden items-start">

        {/* 横向轨道（无 h-full） */}
          <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${-index * 100}%)` }}
          >
            {spreads.map((s, i) => (
                <div key={i} className="w-full flex shrink-0 bg-white">
                  {/* 左页 */}
                  <div className="w-1/2 flex items-center justify-end overflow-hidden bg-white">
                    {s.left !== null && (
                        <img
                            src={pages[s.left]}
                            alt={`page-${s.left + 1}`}
                            className="w-auto max-w-full object-contain select-none manga-page"
                            style={{
                              maxHeight: maxImageHeight,
                              imageRendering: 'auto',
                              width: 'auto',
                              height: 'auto'
                            } as React.CSSProperties}
                            draggable={false}
                            loading="eager"
                            decoding="async"
                        />
                    )}
                  </div>

                  {/* 右页 */}
                  <div className="w-1/2 flex items-center justify-start overflow-hidden bg-white">
                    {s.right !== null && (
                        <img
                            src={pages[s.right]}
                            alt={`page-${s.right + 1}`}
                            className="w-auto max-w-full object-contain select-none manga-page"
                            style={{
                              maxHeight: maxImageHeight,
                              imageRendering: 'auto',
                              width: 'auto',
                              height: 'auto'
                            } as React.CSSProperties}
                            draggable={false}
                            loading="eager"
                            decoding="async"
                        />
                    )}
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* 顶部UI */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 z-10 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center justify-between text-white">
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {index + 1} / {totalSpreads}
              </span>
              <div className="flex space-x-2">
                {hasPrevChapter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPrevChapter?.()
                      resetUI() // 点击按钮后显示UI
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm transition-colors touch-target"
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
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm transition-colors touch-target"
                  >
                    下一章
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部UI */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 z-10 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center justify-center">
            <div className="flex space-x-2">
              {spreads.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIndex(i)
                    resetUI() // 点击页面指示器后显示UI
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === index 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`跳转到第 ${i + 1} 页`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}

/**
 * 主阅读器组件 - 根据设备类型和用户选择自动选择合适的阅读模式
 */
export default function MangaViewer(props: MangaViewerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<'single' | 'double'>('double')

  useEffect(() => {
    // 检测是否为移动设备
    const checkIsMobile = () => {
      const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
      const mobile = Boolean(
        userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i) ||
        window.innerWidth < 768
      )
      setIsMobile(mobile)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // 移动设备始终使用单页模式
  if (isMobile) {
    return <MangaViewerSinglePage {...props} />
  }

  // 桌面设备根据用户选择显示模式切换按钮
  return (
    <>
      {/* 模式切换按钮 - 固定在页面右上角，始终可见，不受UI自动隐藏影响 */}
      <div className="fixed top-4 right-4 z-50 flex bg-black/70 rounded-lg p-1">
        <button
          onClick={() => setViewMode('single')}
          className={`px-3 py-1 rounded text-sm transition-colors touch-target ${
            viewMode === 'single'
              ? 'bg-white text-black'
              : 'text-white hover:bg-white/20'
          }`}
        >
          单页
        </button>
        <button
          onClick={() => setViewMode('double')}
          className={`px-3 py-1 rounded text-sm transition-colors touch-target ${
            viewMode === 'double'
              ? 'bg-white text-black'
              : 'text-white hover:bg-white/20'
          }`}
        >
          双页
        </button>
      </div>

      {/* 根据选择的模式渲染阅读器 */}
      {viewMode === 'single' ? (
        <MangaViewerDesktopSinglePage {...props} />
      ) : (
        <MangaViewerDoublePage {...props} />
      )}
    </>
  )
}
