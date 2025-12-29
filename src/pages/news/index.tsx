import { GetStaticProps } from 'next'
import Head from 'next/head'
import Layout from '@/components/layout/Layout'
import NewsCard from '@/components/ui/NewsCard'
import { getAllNews } from '@/lib/api'

interface NewsPageProps {
  news: any[]
}

export default function NewsPage({ news }: NewsPageProps) {
  return (
    <>
      <Head>
        <title>漫画情报 - 漫画同好网站</title>
        <meta name="description" content="获取最新的漫画相关资讯和情报" />
      </Head>

      <Layout>
        <div className="container-responsive py-8">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">漫画情报</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              获取最新的漫画相关资讯和情报
            </p>
          </div>

          {/* 新闻列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.slug} news={item} />
            ))}
          </div>

          {news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无情报内容</p>
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
    },
  }
}