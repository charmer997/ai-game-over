import { useEffect, useRef, useState } from 'react'

interface MangaViewerWebtoonProps {
  pages: string[]
  title: string
  onNextChapter?: () => void
  onPrevChapter?: () => void
  hasNextChapter?: boolean
  hasPrevChapter?: boolean
  externalFullscreen?: boolean
}

export default function MangaViewerWebtoon({
  pages,
  title,
  onNextChapter,
  onPrevChapter,
  hasNextChapter,
  hasPrevChapter,
  externalFullscreen = false,
}: MangaViewerWebtoonProps) {
  const [showUI, setShowUI] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const resetUI = () => {
    setShowUI(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowUI(false), 2000)
  }

  // 键盘滚动
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        containerRef.current.scrollBy({ top: window.innerHeight * 0.9 })
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        containerRef.current.scrollBy({ top: -window.innerHeight * 0.9 })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 滚动到底自动下一章
  const onScroll = () => {
    resetUI()
    const el = containerRef.current
    if (!el || !hasNextChapter || !onNextChapter) return

    const threshold = 200
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      onNextChapter()
    }
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      onClick={resetUI}
      className={`relative h-screen w-full overflow-y-auto bg-black text-white`}
    >
      {/* 顶部 UI */}
      <div
        className={`sticky top-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold">{title}</h1>
          <span className="text-sm">{pages.length} 页</span>
        </div>
      </div>

      {/* 图片列表 */}
      <div className="flex flex-col items-center gap-2 px-2 pb-24">
        {pages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`page-${i + 1}`}
            className="w-full max-w-[900px] object-contain select-none"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ))}
      </div>

      {/* 底部 UI */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center">
          {hasPrevChapter && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPrevChapter?.()
              }}
              className="px-4 py-2 bg-white/20 rounded"
            >
              上一章
            </button>
          )}
          {hasNextChapter && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNextChapter?.()
              }}
              className="px-4 py-2 bg-white/20 rounded"
            >
              下一章
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
