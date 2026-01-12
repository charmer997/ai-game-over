import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import ChapterGridCard from '@/components/ui/ChapterGridCard'
import { getAllVolumes, Volume } from '@/lib/volumes'
import { getChaptersByVolume, getAllChapters } from '@/lib/api'

interface VolumePageProps {
  volume: Volume
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

export default function VolumePage({ volume, chapters, allChapters }: VolumePageProps) {
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
        <title>{volume.title}</title>
        <meta name="description" content={`${volume.title} - ${volume.description}`} />
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

          {/* 单行本信息 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-64 relative bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={volume.cover || '/images/cover.jpg'}
                  alt={volume.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{volume.title}</h1>
                <p className="text-gray-600 text-lg mb-4">{volume.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>包含 {chapters.length} 话</span>
                </div>
              </div>
            </div>
          </div>

          {/* 章节列表 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">章节列表</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {chapters.map((chapter) => (
                <ChapterGridCard
                  key={chapter.id}
                  chapter={chapter}
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const volumes = getAllVolumes()
  const paths = volumes.map((volume) => ({
    params: { id: volume.id }
  }))
  
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string }
  
  const volumes = getAllVolumes()
  const volume = volumes.find(v => v.id === id)
  
  if (!volume) {
    return {
      notFound: true
    }
  }
  
  const chapters = getChaptersByVolume(id)
  const allChapters = getAllChapters()
  
  return {
    props: {
      volume,
      chapters,
      allChapters
    }
  }
}