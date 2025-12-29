import { useState } from 'react'
import GiscusComments from './GiscusComments'

interface CommentSectionProps {
  title: string
  identifier: string
}

export default function CommentSection({ title, identifier }: CommentSectionProps) {
  const [showComments, setShowComments] = useState(false)

  // Giscus 配置 - 需要在实际使用时替换为真实的配置
  const giscusConfig = {
    repo: 'your-username/your-repo', // 替换为你的 GitHub 仓库
    repoId: 'your-repo-id', // 替换为你的仓库 ID
    category: 'General', // 讨论分类
    categoryId: 'your-category-id', // 替换为分类 ID
    mapping: 'specific', // 使用特定标识符
    term: identifier, // 当前页面的唯一标识符
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'bottom' as const,
    theme: 'light',
    lang: 'zh-CN',
    loading: 'lazy' as const,
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">评论区</h2>
        {!showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="btn btn-primary"
          >
            加载评论
          </button>
        )}
      </div>

      {!showComments ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-gray-600 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-lg font-medium mb-2">参与讨论</p>
            <p className="text-sm text-gray-500 mb-4">
              点击上方按钮加载评论区，支持 Markdown 格式
            </p>
            <div className="text-xs text-gray-400">
              <p>• 支持 GitHub 账号登录</p>
              <p>• 支持 Markdown 语法</p>
              <p>• 支持 @ 提及其他用户</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 评论区使用 GitHub Discussions，请使用 GitHub 账号登录参与讨论。
              支持 Markdown 格式，可以插入代码、链接和图片。
            </p>
          </div>
          
          {/* 这里需要配置真实的 Giscus 参数 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              ⚠️ 请先配置 Giscus 参数：
            </p>
            <ol className="text-sm text-yellow-700 mt-2 text-left list-decimal list-inside">
              <li>在 GitHub 仓库中启用 Discussions</li>
              <li>访问 <a href="https://giscus.app" target="_blank" rel="noopener noreferrer" className="underline">giscus.app</a> 获取配置参数</li>
              <li>在 <code className="bg-yellow-100 px-1">src/components/comments/CommentSection.tsx</code> 中更新配置</li>
            </ol>
          </div>
          
          {/* 取消注释下面的代码并配置正确的参数后即可使用 */}
          {/* <GiscusComments {...giscusConfig} /> */}
        </div>
      )}
    </div>
  )
}