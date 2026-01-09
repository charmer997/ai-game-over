import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ChapterCard from '@/components/ui/ChapterCard'
import ChapterGridCard from '@/components/ui/ChapterGridCard'
import { getAllChapters } from '@/lib/api'

interface ChaptersPageProps {
  chapters: any[]
}

export default function ChaptersPage({ chapters }: ChaptersPageProps) {
  const [isMobile, setIsMobile] = useState(false)

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

  return (
    <>
      <Head>
        <title>想让"我爱你"的游戏快点结束</title>
        <meta name="description" content="" />
      </Head>

      <Layout>
        <div className="container-responsive py-4 md:py-8">
          {/* 页面标题 */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">漫画资源</h1>
            <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
              不定期更新~
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
                <p className="text-gray-500 text-lg">暂无章节内容</p>
              </div>
            )}
          </div>

          {/* 移动端2x3网格布局 */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {chapters.map((chapter) => (
                <ChapterGridCard key={chapter.id} chapter={chapter} />
              ))}
            </div>

            {chapters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">暂无章节内容</p>
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