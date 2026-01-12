import Link from 'next/link'

interface ChapterGridCardProps {
  chapter: {
    id: string
    title: string
    publishDate: string
    description?: string
    thumbnail?: string
  }
}

export default function ChapterGridCard({ chapter }: ChapterGridCardProps) {
  return (
    <Link href={`/chapters/${chapter.id}`} aria-label={chapter.title}>
      <div className="card cursor-pointer hover:shadow-lg transition-all duration-200 group p-1">
        {chapter.thumbnail ? (
          // 移动端使用固定小高度（h-16）
          <div className="mb-1 overflow-hidden rounded-md w-full h-16 md:aspect-[3/4] md:h-auto bg-white">
            <img
              src={chapter.thumbnail}
              alt={chapter.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="mb-1 bg-gray-200 rounded-md flex items-center justify-center w-full h-16 md:aspect-[3/4] md:h-auto">
            <span className="text-gray-500 text-xs">无封面</span>
          </div>
        )}

        {/* 小屏上隐藏文字，仅显示图标；md 以上显示标题和日期 */}
        <div className="hidden md:block">
          <h3 className="font-semibold text-sm mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
            {chapter.title}
          </h3>
          <p className="text-xs text-gray-500 mb-1">
            {new Date(chapter.publishDate).toLocaleDateString('zh-CN')}
          </p>
          {chapter.description && (
            <p className="text-gray-600 text-xs line-clamp-2">
              {chapter.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}