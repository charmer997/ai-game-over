import { useEffect, useRef, useState } from 'react'
import MangaViewerSinglePage from './MangaViewerSinglePage'
import { getImageUrl } from '@/lib/images'

// 初始调大一点让两页尽量贴合中线
const DOUBLE_PAGE_SCALE = 1.0

interface MangaViewerProps {
  pages: string[]
  title: string
  onNextChapter?: () => void
  onPrevChapter?: () => void
  hasNextChapter?: boolean
  hasPrevChapter?: boolean
  showControls?: boolean
  onToggleFullscreen?: () => void
  externalViewMode?: 'single' | 'double'
  externalFullscreen?: boolean
}

type Spread = {
  right: number | null
  left: number | null
}

/**
 * Webry 规则：
 * - 第 1 页：单页，占左页
 * - 之后：右 → 左
 */
function buildSpreads(pages: string[]): Spread[] {
  const spreads: Spread[] = []
  if (!pages.length) return spreads

  spreads.push({ right: null, left: 0 })

  for (let i = 1; i < pages.length; i += 2) {
    spreads.push({
      right: i,
      left: i + 1 < pages.length ? i + 1 : null,
    })
  }

  return spreads
}

/**
 *   双页全屏
 */
function MangaViewerDoublePage({
  pages,
  title,
  onNextChapter: _onNextChapter,
  onPrevChapter: _onPrevChapter,
  hasNextChapter: _hasNextChapter,
  hasPrevChapter: _hasPrevChapter,
  externalFullscreen = false,
}: MangaViewerProps) {
  const spreads = buildSpreads(pages)
  const [index, setIndex] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  const resetUI = () => {
    setShowUI(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowUI(false), 500)
  }

  const next = () => index < spreads.length - 1 && setIndex(i => i + 1)
  const prev = () => index > 0 && setIndex(i => i - 1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])

  const onClick = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth
    if (x < 0.3) {
      prev()
      resetUI()
    } else if (x > 0.7) {
      next()
      resetUI()
    } else {
      setShowUI(v => !v)
      resetUI()
    }
  }

  return (
    <div
      className={`relative ${externalFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full h-screen'} bg-white overflow-hidden`}
      onMouseMove={externalFullscreen ? undefined : resetUI}
      onClick={onClick}
    >
      {/* ★ Webry 核心：整页轨道 - 图片显示区域全屏 */}
      <div className={`absolute inset-0 overflow-hidden ${externalFullscreen ? 'w-screen h-screen' : 'w-full h-full'}`}>
        <div
          className={`flex ${externalFullscreen ? 'h-screen' : 'h-full'} transition-transform duration-300 ease-out`}
          style={{ transform: `translateX(${-index * 100}%)` }}
        >
          {spreads.map((s, i) => (
            <div key={i} className={`w-full ${externalFullscreen ? 'h-screen' : 'h-full'} flex shrink-0 bg-white gap-0 p-0`}>
              {/* 左页 - 高度由父容器控制，图片高度为 100% */}
              <div className="h-full flex items-stretch justify-end overflow-hidden" style={{ flex: '0 0 50%' }}>
                {s.left !== null && (
                  <img
                    src={getImageUrl(pages[s.left])}
                    alt=""
                    draggable={false}
                    className="select-none bg-white block"
                    style={{
                      height: '100%',
                      width: 'auto',
                      objectFit: 'contain',
                      transform: `translateX(0.5px) scale(${DOUBLE_PAGE_SCALE})`,
                      transformOrigin: 'right center',
                      background: 'white'
                    }}
                  />
                )}
              </div>

              {/* 右页 - 高度由父容器控制，图片高度为 100% */}
              <div className="h-full flex items-stretch justify-start overflow-hidden" style={{ flex: '0 0 50%' }}>
                {s.right !== null && (
                  <img
                    src={getImageUrl(pages[s.right])}
                    alt=""
                    draggable={false}
                    className="select-none bg-white block"
                    style={{
                      height: '100%',
                      width: 'auto',
                      objectFit: 'contain',
                      transform: `translateX(-0.5px) scale(${DOUBLE_PAGE_SCALE})`,
                      transformOrigin: 'left center',
                      background: 'white'
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 顶部 UI */}
      {!externalFullscreen && (
        <div
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent text-white transition-opacity ${
            showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">{title}</h1>
            <span className="text-sm">
              {index + 1} / {spreads.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 主组件
 */
export default function MangaViewer(props: MangaViewerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [internalViewMode, setInternalViewMode] =
    useState<'single' | 'double'>('double')

  const viewMode = props.externalViewMode || internalViewMode
  const isFullscreen = props.externalFullscreen || false

  useEffect(() => {
    const check = () => {
      setIsMobile(
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          window.innerWidth < 768
      )
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return <MangaViewerSinglePage {...props} />
  }

  return (
    <>
      {props.showControls !== false && (
        <div className="fixed top-4 right-4 z-50 flex bg-white/70 rounded-lg p-1">
          <button
            onClick={() => setInternalViewMode('single')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'single'
                ? 'bg-white text-black'
                : 'text-white'
            }`}
          >
            单页
          </button>
          <button
            onClick={() => setInternalViewMode('double')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'double'
                ? 'bg-white text-black'
                : 'text-white'
            }`}
          >
            双页
          </button>
        </div>
      )}

      {viewMode === 'single' ? (
        <MangaViewerSinglePage {...props} externalFullscreen={isFullscreen} />
      ) : (
        <MangaViewerDoublePage {...props} externalFullscreen={isFullscreen} />
      )}
    </>
  )
}
