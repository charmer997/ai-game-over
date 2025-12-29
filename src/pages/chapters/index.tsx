import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import ChapterCard from '@/components/ui/ChapterCard'
import { getAllChapters } from '@/lib/api'

interface ChaptersPageProps {
  chapters: any[]
}

export default function ChaptersPage({ chapters }: ChaptersPageProps) {
  return (
    <>
      <Head>
        <title>想让"我爱你"的游戏快点结束</title>
        <meta name="description" content="" />
      </Head>

      <Layout>
        <div className="container-responsive py-8">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">漫画资源</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              欢迎讨论
            </p>
          </div>

          {/* 章节列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>

          {chapters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无章节内容</p>
            </div>
          )}
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