import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ChapterCard from '@/components/ui/ChapterCard'
import ChapterGridCard from '@/components/ui/ChapterGridCard'
import { getAllChapters } from '@/lib/api'
import { getAllVolumes, getExtraCategories } from '@/lib/volumes'

interface ChaptersPageProps {
  chapters: any[]
}

export default function ChaptersPage({ chapters }: ChaptersPageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc') // 默认倒序（最新在前）

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

  // 根据排序顺序排序章节
  const sortedChapters = [...chapters].sort((a, b) => {
    const aNum = parseInt(a.id.replace('chapter-', ''))
    const bNum = parseInt(b.id.replace('chapter-', ''))
    return sortOrder === 'desc' ? bNum - aNum : aNum - bNum
  })

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

          {/* 单行本导航 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold">阅读方式</h2>
              <Link
                href="/chapters/volumes"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm md:text-base"
              >
                查看所有单行本 →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* 单行本快捷入口 */}
              {getAllVolumes().slice(0, 4).map((volume) => (
                <Link
                  key={volume.id}
                  href={`/chapters/volume/${volume.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center"
                >
                  <div className="aspect-[3/4] w-20 h-24 mx-auto mb-2 bg-gray-200 rounded relative overflow-hidden">
                    <img
                      src={volume.cover || '/images/cover.jpg'}
                      alt={volume.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-primary-600 transition-colors">
                    {volume.title}
                  </h3>
                  <p className="text-xs text-gray-500">{volume.description}</p>
                </Link>
              ))}
              
              {/* 番外入口 */}
              <Link
                href="/chapters/extra"
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center"
              >
                <div className="aspect-[3/4] w-20 h-24 mx-auto mb-2 bg-gray-200 rounded relative overflow-hidden">
                  <img
                    src="/images/volumes/extra.jpg"
                    alt="番外"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm group-hover:text-primary-600 transition-colors">
                  番外
                </h3>
                <p className="text-xs text-gray-500">特别篇</p>
              </Link>
              
              {/* Fanbox入口 */}
              <Link
                href="/chapters/fanbox"
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center"
              >
                <div className="aspect-[3/4] w-20 h-24 mx-auto mb-2 bg-gray-200 rounded relative overflow-hidden">
                  <img
                    src="/images/volumes/fanbox.jpg"
                    alt="Fanbox"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm group-hover:text-primary-600 transition-colors">
                  Fanbox
                </h3>
                <p className="text-xs text-gray-500">限定内容</p>
              </Link>
            </div>
          </div>

          {/* 最新章节 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold">最新章节</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">排序：</span>
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sortOrder === 'desc'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  倒序
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sortOrder === 'asc'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  正序
                </button>
              </div>
            </div>
            
            {/* 桌面端章节列表 */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedChapters.slice(0, 6).map((chapter) => (
                  <ChapterCard key={chapter.id} chapter={chapter} />
                ))}
              </div>

              {sortedChapters.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">暂无章节内容</p>
                </div>
              )}
            </div>

            {/* 移动端2x2网格布局 */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {sortedChapters.slice(0, 4).map((chapter) => (
                  <ChapterGridCard key={chapter.id} chapter={chapter} />
                ))}
              </div>

              {sortedChapters.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">暂无章节内容</p>
                </div>
              )}
            </div>
            
            {/* 查看更多按钮 */}
            {chapters.length > 0 && (
              <div className="text-center mt-6">
                <Link
                  href="/chapters/all"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  查看所有章节
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
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