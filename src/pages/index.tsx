import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ChapterCard from '@/components/ui/ChapterCard'
import NewsCard from '@/components/ui/NewsCard'
import { getAllChapters, getAllNews } from '@/lib/api'

interface HomePageProps {
  chapters: any[]
  news: any[]
}

export default function HomePage({ chapters, news }: HomePageProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟加载完成
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }
  
  return (
    <>
      <Head>
        <title>想让"我爱你"的游戏快点结束</title>
        <meta name="description" content="爱结游同好会" />
        <meta property="og:type" content="website" />
        
        {/* 图标设置 - 使用正确的文件名和尺寸 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
      </Head>

      <Layout>
        {/* 头栏区域 */}
        <section className="relative from-primary-600 to-primary-700 text-white">
          <div className="absolute inset-0">
            <img
              src="/images/cover.jpg"
              alt="封面图"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div className="relative container-responsive py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <img
                src="/logo.webp"
                alt="Logo"
                className="w-auto h-auto mb-8 animate-fade-in"
              />
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Link href="/chapters" className="btn bg-white text-primary-600 hover:bg-gray-100">
                  漫画资源
                </Link>
                <Link href="/news" className="btn border-2 border-white text-black hover:bg-white hover:text-primary-600">
                  漫画情报
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 最新章节 */}
        <section className="py-12">
          <div className="container-responsive">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">最新章节</h2>
              <Link href="/chapters" className="text-primary-600 hover:text-primary-700 font-medium">
                查看全部 →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.slice(0, 6).map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </div>
        </section>

        {/* 最新情报 */}
        <section className="py-12 bg-gray-50">
          <div className="container-responsive">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">最新情报</h2>
              <Link href="/news" className="text-primary-600 hover:text-primary-700 font-medium">
                查看全部 →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 3).map((item) => (
                <NewsCard key={item.slug} news={item} />
              ))}
            </div>
          </div>
        </section>

        {/* 快速导航 */}
        <section className="py-12">
          <div className="container-responsive">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">懒人专享OvO</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/chapters" className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">漫画资源</h3>
             
              </Link>
              
              <Link href="/characters" className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">出场人物介绍</h3>
              
              </Link>
              
              <Link href="/news" className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">📰</div>
                <h3 className="text-xl font-semibold mb-2">漫画情报</h3>
              
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const chapters = getAllChapters().slice(0, 6)
  const news = getAllNews().slice(0, 3)

  return {
    props: {
      chapters,
      news,
    },
  }
}
