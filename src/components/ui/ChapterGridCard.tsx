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
    <Link href={`/chapters/${chapter.id}`}>
      <div className="card cursor-pointer hover:shadow-lg transition-all duration-200 group">
        {chapter.thumbnail ? (
          <div className="aspect-[3/4] mb-2 overflow-hidden rounded-lg">
            <img
              src={chapter.thumbnail}
              alt={chapter.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-[3/4] mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-xs">无封面</span>
          </div>
        )}
        
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
    </Link>
  )
}