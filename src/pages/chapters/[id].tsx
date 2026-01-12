import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import MangaViewer from '@/components/manga/MangaViewer'
import CommentSection from '@/components/comments/CommentSection'
import { getChapterById, getAllChapters } from '@/lib/api'

interface ChapterPageProps {
  chapter: any
  prevChapter: any
  nextChapter: any
}

export default function ChapterPage({ chapter, prevChapter, nextChapter }: ChapterPageProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'single' | 'double'>('double')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 切换全屏模式
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // 检测全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  if (!chapter) {
    return (
      <Layout>
        <div className="container-responsive py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">章节不存在</h1>
          <Link href="/chapters" className="btn btn-primary">
            返回章节列表
          </Link>
        </div>
      </Layout>
    )
  }

  const goToPrevChapter = () => {
    if (prevChapter) {
      router.push(`/chapters/${prevChapter.id}`)
    }
  }

  const goToNextChapter = () => {
    if (nextChapter) {
      router.push(`/chapters/${nextChapter.id}`)
    }
  }

  return (
    <>
      <Head>
        <title>{chapter.title}</title>
        <meta name="description" content={chapter.description || `阅读${chapter.title}`} />
      </Head>

      <Layout>
        {/* 桌面端显示标题和导航 */}
        <div className="hidden md:block container-responsive py-4">
          {/* 章节标题 */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{chapter.title}</h1>
            <p className="text-gray-600 text-sm">
              发布时间：{new Date(chapter.publishDate).toLocaleDateString('zh-CN')} |
              共 {chapter.pages?.length || 0} 页
            </p>
          </div>
        </div>

        {/* 漫画阅读器 - 全屏显示 */}
        <div className="manga-reader h-[calc(100vh-60px)] md:h-screen">
          {chapter.pages && chapter.pages.length > 0 && (
            <MangaViewer
              pages={chapter.pages}
              title={chapter.title}
              onNextChapter={goToNextChapter}
              onPrevChapter={goToPrevChapter}
              hasNextChapter={!!nextChapter}
              hasPrevChapter={!!prevChapter}
              showControls={false} // 禁用内置控制按钮，使用外部控制
              externalViewMode={viewMode} // 传递外部控制的视图模式
              onToggleFullscreen={toggleFullscreen} // 传递全屏切换函数
            />
          )}
        </div>

        {/* 桌面端底部导航 */}
        <div className="hidden md:flex justify-between items-center py-4 border-t border-gray-200 container-responsive">
          <div className="flex items-center space-x-4">
            <Link href="/chapters" className="btn btn-primary">
              返回目录
            </Link>
            
            {/* 单双页切换按钮 */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'single'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                单页
              </button>
              <button
                onClick={() => setViewMode('double')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'double'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                双页
              </button>
            </div>
            
            {/* 全屏切换按钮 */}
            {/* <button
              onClick={toggleFullscreen}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-600 transition-colors"
              title={isFullscreen ? "退出全屏" : "进入全屏"}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button> */}
          </div>
          
          <div className="flex space-x-4">
            {prevChapter && (
              <Link href={`/chapters/${prevChapter.id}`} className="btn btn-secondary">
                ← 上一章
              </Link>
            )}
            {nextChapter && (
              <Link href={`/chapters/${nextChapter.id}`} className="btn btn-secondary">
                下一章 →
              </Link>
            )}
          </div>
        </div>

        {/* 评论区 */}
        <div className="container-responsive py-8">
          <CommentSection title={`${chapter.title} 评论区`} pageId={`/chapters/${chapter.id}`} />
        </div>

      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const chapters = getAllChapters()
  const paths = chapters.map((chapter) => ({
    params: { id: chapter.id },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string }
  
  const chapter = getChapterById(id)
  const allChapters = getAllChapters()
  
  const currentIndex = allChapters.findIndex(c => c.id === id)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  return {
    props: {
      chapter,
      prevChapter,
      nextChapter,
    },
  }
}