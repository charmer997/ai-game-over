import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import CommentSection from '@/components/comments/CommentSection'
import { getChapterById, getAllChapters } from '@/lib/api'

interface ChapterPageProps {
  chapter: any
  prevChapter: any
  nextChapter: any
}

export default function ChapterPage({ chapter, prevChapter, nextChapter }: ChapterPageProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

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

  const totalPages = chapter.pages?.length || 0

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentPage(page)
        setIsLoading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
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
        <div className="container-responsive py-8">
          {/* 章节标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{chapter.title}</h1>
            <p className="text-gray-600">
              发布时间：{new Date(chapter.publishDate).toLocaleDateString('zh-CN')}
            </p>
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goToPrevChapter}
              disabled={!prevChapter}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 上一章
            </button>
            
            <div className="text-center">
              <span className="text-gray-600">
                第 {currentPage + 1} 页 / 共 {totalPages} 页
              </span>
            </div>
            
            <button
              onClick={goToNextChapter}
              disabled={!nextChapter}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一章 →
            </button>
          </div>

          {/* 漫画阅读器 */}
          <div className="manga-reader">
            {isLoading && (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            )}
            
            {!isLoading && chapter.pages && chapter.pages.length > 0 && (
              <div className="relative">
                <img
                  src={chapter.pages[currentPage]}
                  alt={`第 ${currentPage + 1} 页`}
                  className="manga-page w-full"
                  onLoad={(e) => {
                    e.currentTarget.setAttribute('data-loaded', 'true')
                  }}
                />
                
                {/* 页面导航 */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  
                  <div className="flex space-x-2">
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = index
                      } else if (currentPage < 2) {
                        pageNum = index
                      } else if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 5 + index
                      } else {
                        pageNum = currentPage - 2 + index
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 rounded ${
                            pageNum === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 章节导航 */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={goToPrevChapter}
              disabled={!prevChapter}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 上一章
            </button>
            
            <Link href="/chapters" className="btn btn-primary">
              返回目录
            </Link>
            
            <button
              onClick={goToNextChapter}
              disabled={!nextChapter}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一章 →
            </button>
          </div>

          {/* 评论区 */}
          <CommentSection
            title={chapter.title}
            identifier={`chapter-${chapter.id}`}
          />
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