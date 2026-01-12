import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import { getExtraChapters, getAllChapters } from '@/lib/api'

interface FanboxPageProps {
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

export default function FanboxPage({ chapters, allChapters }: FanboxPageProps) {
  return (
    <>
      <Head>
        <title>Fanbox</title>
        <meta name="description" content="Fanbox限定内容" />
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

          {/* Fanbox信息 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-64 relative bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src="/images/volumes/fanbox.jpg"
                  alt="Fanbox"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Fanbox</h1>
                <p className="text-gray-600 text-lg mb-4">饭盒限定内容</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>包含 {chapters.length} 话</span>
                </div>
              </div>
            </div>
          </div>

          {/* 章节列表 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">饭盒内容列表</h2>
            {chapters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/chapters/${chapter.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[3/4] relative bg-gray-200">
                      <Image
                        src={chapter.thumbnail}
                        alt={chapter.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{chapter.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{chapter.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {chapter.publishDate}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无Fanbox内容</h3>
                <p className="text-gray-500">Fanbox限定内容正在准备中，敬请期待</p>
                <div className="mt-6">
                  <a
                    href="https://www.pixiv.net/fanbox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    访问Fanbox
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const chapters = getExtraChapters('fanbox')
  const allChapters = getAllChapters()
  
  return {
    props: {
      chapters,
      allChapters
    }
  }
}