import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import { getAllVolumes, getExtraCategories, Volume } from '@/lib/volumes'

interface VolumesPageProps {
  volumes: Volume[]
  extraCategories: Array<{
    id: string
    title: string
    description: string
    cover: string
  }>
}

export default function VolumesPage({ volumes, extraCategories }: VolumesPageProps) {
  return (
    <>
      <Head>
        <title>单行本</title>
        <meta name="description" content="漫画单行本列表" />
      </Head>
      
      <Layout>
        <div className="container-responsive py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">单行本</h1>
          
          {/* 单行本列表 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">正篇</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {volumes.map((volume) => (
                <Link 
                  key={volume.id} 
                  href={`/chapters/volume/${volume.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                    <div className="aspect-[3/4] relative bg-gray-200">
                      <Image
                        src={volume.cover || '/images/cover.jpg'}
                        alt={volume.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors">
                        {volume.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {volume.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* 番外列表 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">番外</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {extraCategories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/chapters/${category.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                    <div className="aspect-[3/4] relative bg-gray-200">
                      <Image
                        src={category.cover || '/images/cover.jpg'}
                        alt={category.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const volumes = getAllVolumes()
  const extraCategories = getExtraCategories()
  
  return {
    props: {
      volumes,
      extraCategories
    }
  }
}