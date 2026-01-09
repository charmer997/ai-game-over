import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import GiscusComments from './GiscusComments'
import D1Comments from './D1Comments'

interface CommentSectionProps {
  title?: string
  className?: string
  pageId?: string // 用于D1评论系统的页面ID
}

export default function CommentSection({
  title = "评论区",
  className = "",
  pageId
}: CommentSectionProps) {
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState('')
  
  // 在客户端获取当前路径
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [router.pathname])
  
  // 使用传入的pageId或当前路径
  const finalPageId = pageId || currentPath
  const [showComments, setShowComments] = useState(false)
  const [commentType, setCommentType] = useState<'giscus' | 'd1'>('d1') // 默认使用D1评论
  const [giscusKey, setGiscusKey] = useState(0) // 用于强制重新渲染Giscus组件

  // Giscus配置 - 请替换为您的实际配置
  const giscusConfig = {
    repo: 'charmer997/ai-game-over', // 替换为您的GitHub仓库
    repoId: 'R_kgDOQwf42w', // 替换为您的仓库ID
    category: 'General', // 替换为您的讨论分类
    categoryId: 'DIC_kwDOQwf4284C0v4y', // 替换为您的分类ID
    mapping: 'pathname' as const,
    strict: false,
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'bottom' as const,
    theme: 'light' as const,
    lang: 'zh-CN',
    loading: 'lazy' as const
  }

  return (
    <div className={`comment-section ${className}`}>
      <div className="border-t border-gray-200 pt-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            {showComments ? '隐藏评论' : '显示评论'}
          </button>
        </div>
        
        {showComments && (
          <div className="comment-container">
            {/* 评论类型选择 */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">评论系统：</span>
              <button
                onClick={() => setCommentType('d1')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  commentType === 'd1'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                游客评论
              </button>
              <button
                onClick={() => {
                  setCommentType('giscus')
                  setGiscusKey(prev => prev + 1) // 强制重新渲染Giscus组件
                }}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  commentType === 'giscus'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                GitHub评论
              </button>
            </div>
            
            {/* 评论提示 */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                {commentType === 'd1'
                  ? '💬 游客评论：无需注册，直接输入昵称即可评论。'
                  : '💬 GitHub评论：需要登录GitHub账号，支持Markdown格式。'
                }
              </p>
            </div>
            
            {/* 评论组件 */}
            <div className="comment-container bg-gray-50 rounded-lg p-4">
              {commentType === 'd1' ? (
                <D1Comments pageId={finalPageId} />
              ) : (
                <GiscusComments key={giscusKey} {...giscusConfig} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}