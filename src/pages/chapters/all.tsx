import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ChapterCard from '@/components/ui/ChapterCard'
import ChapterGridCard from '@/components/ui/ChapterGridCard'
import { getAllChapters } from '@/lib/api'

interface AllChaptersPageProps {
  chapters: any[]
}

export default function AllChaptersPage({ chapters }: AllChaptersPageProps) {
  const [mobileShowAll, setMobileShowAll] = useState(false)

  useEffect(() => {
    // 仅在客户端时确认，如果需要可在未来基于窗口宽度做更细致处理
    return () => {}
  }, [])

  // 移动端默认显示 4 列 x 3 行 = 12 个（更紧凑的浏览），点击加载更多可展开全部
  const mobileVisibleChapters = mobileShowAll ? chapters : chapters.slice(0, 12)

  return (
    <>
      <Head>
        <title>所有章节</title>
        <meta name="description" content="All①" />
      </Head>

      <Layout>
        <div className="container-responsive py-4 md:py-8">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link 
              href="/chapters"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回漫画首页
            </Link>
          </div>

          {/* 页面标题 */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">所有章节</h1>
            <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
              共 {chapters.length} 话 (含饭盒)
            </p>
          </div>

          {/* 桌面端章节列表 */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </div>

            {chapters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">暂无捏</p>
              </div>
            )}
          </div>

          {/* 移动端 4 列紧凑网格（默认显示 12 条） */}
          <div className="md:hidden">
            <div className="grid grid-cols-4 gap-2">
              {mobileVisibleChapters.map((chapter) => (
                <ChapterGridCard key={chapter.id} chapter={chapter} />
              ))}
            </div>

            {chapters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">暂无章节内容</p>
              </div>
            )}

            {chapters.length > 12 && (
               <div className="text-center mt-4">
                 <button
                   onClick={() => setMobileShowAll(!mobileShowAll)}
                   className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                 >
                  {mobileShowAll ? '收起' : `加载更多 (${chapters.length - 12})`}
                 </button>
               </div>
             )}
           </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const chapters = getAllChapters()

  return {
    props: {
      chapters,
    },
  }
}