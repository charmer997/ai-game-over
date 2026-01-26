import Link from 'next/link'

interface NewsCardProps {
  news: {
    slug: string
    title: string
    excerpt: string
    publishDate: string
    thumbnail?: string
    videoPath?: string // 新增字段，代表 video 在 Cloudflare 的路径，例如 /video/XXXX.mp4
  }
  onPlayVideo?: (url: string) => void
}

export default function NewsCard({ news, onPlayVideo }: NewsCardProps) {
  const hasVideo = Boolean(news.videoPath)

  return (
    <div>
      {/* 如果存在 videoPath，卡片本身不再直接跳转，保留可点击播放 */}
      {hasVideo ? (
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
          <div className="p-4">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <time>{new Date(news.publishDate).toLocaleDateString('zh-CN')}</time>
            </div>
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">
              {news.title}
            </h3>
            <p className="text-gray-600 text-sm text-truncate-3 mb-3">
              {news.excerpt}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => onPlayVideo && onPlayVideo(news.videoPath!)}
                className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
              >
                ▶ 播放视频
              </button>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}