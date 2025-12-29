import Link from 'next/link'

interface NewsCardProps {
  news: {
    slug: string
    title: string
    excerpt: string
    publishDate: string
    thumbnail?: string
  }
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link href={`/news/${news.slug}`}>
      <div className="card cursor-pointer hover:shadow-lg transition-all duration-200 group">
        {news.thumbnail && (
          <div className="aspect-[16/9] mb-4 overflow-hidden rounded-lg">
            <img
              src={news.thumbnail}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <time>{new Date(news.publishDate).toLocaleDateString('zh-CN')}</time>
        </div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">
          {news.title}
        </h3>
        <p className="text-gray-600 text-sm text-truncate-3">
          {news.excerpt}
        </p>
      </div>
    </Link>
  )
}