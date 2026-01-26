import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import NewsCard from '@/components/ui/NewsCard'
import { getAllNews } from '@/lib/api'

interface NewsPageProps {
  news: any[]
}

export default function NewsPage({ news: staticNews }: NewsPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'news'>('all')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const filteredContent = () => {
    // 现在只显示新闻（移除推特）
    return staticNews
  }

  function openVideo(url: string) {
    setVideoUrl(url)
  }

  function closeVideo() {
    setVideoUrl(null)
  }

  return (
    <>
      <Head>
        <title>消息情报</title>
      </Head>

      <Layout>
        <div className="container-responsive py-8">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">消息情报</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              获取最新的漫画相关资讯和情报
            </p>
          </div>

          {/* 标签页（移除推特） */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('all')}
              >
                全部
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'news'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('news')}
              >
                新闻
              </button>
            </div>
          </div>

          {/* 内容列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent().map((item) => (
              <NewsCard key={item.slug || item.title} news={item} onPlayVideo={openVideo} />
            ))}
          </div>

          {filteredContent().length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无内容</p>
            </div>
          )}

          {/* 视频弹窗 */}
          {videoUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-4xl bg-transparent">
                <div className="relative">
                  <button
                    onClick={closeVideo}
                    className="absolute right-0 top-0 text-white bg-black/40 rounded-full p-2 z-20"
                    aria-label="关闭视频"
                  >
                    ✕
                  </button>
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const news = getAllNews()

  return {
    props: {
      news,
    }
  }
}