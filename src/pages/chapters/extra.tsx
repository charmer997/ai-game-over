import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import ChapterGridCard from '@/components/ui/ChapterGridCard'
import { getExtraChapters, getAllChapters } from '@/lib/api'

interface ExtraPageProps {
  chapters: Array<{
    id: string
    title: string
    description: string
    publishDate: string
    thumbnail: string
  }>
  allChapters: Array<{
    id: string
    title: string
  }>
}

export default function ExtraPage({ chapters, allChapters }: ExtraPageProps) {
  // 获取当前章节在所有章节中的索引，用于导航
  const getCurrentChapterIndex = (chapterId: string) => {
    return allChapters.findIndex(ch => ch.id === chapterId)
  }

  const getPrevChapter = (currentId: string) => {
    const currentIndex = getCurrentChapterIndex(currentId)
    return currentIndex > 0 ? allChapters[currentIndex - 1] : null
  }

  const getNextChapter = (currentId: string) => {
    const currentIndex = getCurrentChapterIndex(currentId)
    return currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null
  }

  return (
    <>
      <Head>
        <title>番外</title>
        <meta name="description" content="番外" />
      </Head>
      
      <Layout>
        <div className="container-responsive py-8">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link 
              href="/chapters/volumes"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回单行本列表
            </Link>
          </div>

          {/* 番外信息 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-64 relative bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src="/images/volumes/extra.jpg"
                  alt="番外"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">番外</h1>
                <p className="text-gray-600 text-lg mb-4">特别篇和番外故事</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>包含 {chapters.length} 话</span>
                </div>
              </div>
            </div>
          </div>

          {/* 章节列表 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">章节列表</h2>
            {chapters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {chapters.map((chapter) => (
                  <ChapterGridCard
                    key={chapter.id}
                    chapter={chapter}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无番外章节</h3>
                <p className="text-gray-500">能搬的都搬了...</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const chapters = getExtraChapters('extra')
  const allChapters = getAllChapters()
  
  return {
    props: {
      chapters,
      allChapters
    }
  }
}