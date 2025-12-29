import Link from 'next/link'

interface ChapterCardProps {
  chapter: {
    id: string
    title: string
    publishDate: string
    description?: string
    thumbnail?: string
  }
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Link href={`/chapters/${chapter.id}`}>
      <div className="card cursor-pointer hover:shadow-lg transition-all duration-200 group">
        {chapter.thumbnail && (
          <div className="aspect-[3/4] mb-4 overflow-hidden rounded-lg">
            <img
              src={chapter.thumbnail}
              alt={chapter.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">
          {chapter.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {new Date(chapter.publishDate).toLocaleDateString('zh-CN')}
        </p>
        {chapter.description && (
          <p className="text-gray-600 text-sm text-truncate-2">
            {chapter.description}
          </p>
        )}
      </div>
    </Link>
  )
}