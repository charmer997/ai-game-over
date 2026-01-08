import { useEffect, useRef, useState } from 'react'

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

export default function MangaViewerDoublePageWebry({
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

  const next = () => index < totalSpreads - 1 && setIndex(i => i + 1)
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
    if (x < 0.3) prev()
    else if (x > 0.7) next()
    else setShowUI(v => !v)
  }

  return (
      <div
          className="relative w-full h-screen bg-white text-black overflow-hidden"
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
                            className="w-auto max-w-full object-contain select-none"
                            style={{ maxHeight: maxImageHeight }}
                            draggable={false}
                        />
                    )}
                  </div>

                  {/* 右页 */}
                  <div className="w-1/2 flex items-center justify-start overflow-hidden bg-white">
                    {s.right !== null && (
                        <img
                            src={pages[s.right]}
                            alt={`page-${s.right + 1}`}
                            className="w-auto max-w-full object-contain select-none"
                            style={{ maxHeight: maxImageHeight }}
                            draggable={false}
                        />
                    )}
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* 顶部 UI */}


        {/* 底部 UI */}

      </div>
  )
}
