import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import { getAllCharacters } from '@/lib/api'

interface CharactersPageProps {
  characters: any[]
}

export default function CharactersPage({ characters }: CharactersPageProps) {
  return (
    <>
      <Head>
        <title>人物介绍 - 漫画同好网站</title>
        <meta name="description" content="了解漫画中的人物信息和背景故事" />
      </Head>

      <Layout>
        <div className="container-responsive py-8">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">人物介绍</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              了解漫画中的人物信息和背景故事
            </p>
          </div>

          {/* 人物列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters.map((character) => (
              <Link key={character.slug} href={`/characters/${character.slug}`}>
                <div className="card cursor-pointer hover:shadow-lg transition-all duration-200 group">
                  <div className="flex flex-col items-center">
                    {character.avatar && (
                      <div className="w-32 h-32 mb-4 overflow-hidden rounded-full">
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-xl mb-2 group-hover:text-primary-600 transition-colors text-center">
                      {character.name}
                    </h3>
                    {character.title && (
                      <p className="text-gray-600 text-sm mb-2">{character.title}</p>
                    )}
                    {character.firstAppearance && (
                      <p className="text-gray-500 text-sm">
                        首次登场：{character.firstAppearance}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {characters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无人物信息</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const characters = getAllCharacters()

  return {
    props: {
      characters,
    },
  }
}