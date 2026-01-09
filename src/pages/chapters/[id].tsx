import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import MangaViewer from '@/components/manga/MangaViewer'
import { getChapterById, getAllChapters } from '@/lib/api'

interface ChapterPageProps {
  chapter: any
  prevChapter: any
  nextChapter: any
}

export default function ChapterPage({ chapter, prevChapter, nextChapter }: ChapterPageProps) {
  const router = useRouter()

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
            />
          )}
        </div>

        {/* 桌面端底部导航 */}
        <div className="hidden md:flex justify-between items-center py-4 border-t border-gray-200 container-responsive">
          <Link href="/chapters" className="btn btn-primary">
            返回目录
          </Link>
          
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