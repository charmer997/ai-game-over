import { useState, useEffect } from 'react'

interface Comment {
  id: string
  content: string
  author: string
  created_at: string
  page_id: string
  updated_at?: string
}

interface D1CommentsProps {
  pageId: string
}

export default function D1Comments({ pageId }: D1CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // 获取评论
  const fetchComments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/comments?page_id=${pageId}`)
      if (response.ok) {
  const data = (await response.json()) as {
    comments: Comment[]
  }

  setComments(data.comments ?? [])
}else {
        throw new Error('获取评论失败')
      }
    } catch (error) {
      console.error('获取评论失败:', error)
      setError('获取评论失败，请稍后再试')
    } finally {
      setIsLoading(false)
    }
  }

  // 提交评论
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !authorName.trim()) {
      setError('请填写昵称和评论内容')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          author: authorName,
          page_id: pageId,
        }),
      })

      if (response.ok) {
        setNewComment('')
        setAuthorName('')
        setSuccessMessage('评论发表成功！')
        fetchComments() // 重新获取评论
        // 3秒后清除成功消息
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error('发表评论失败')
      }
    } catch (error) {
      console.error('提交评论失败:', error)
      setError('发表评论失败，请稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除评论
  const deleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) {
      return
    }

    setDeletingCommentId(commentId)
    setError(null)
    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccessMessage('评论删除成功')
        fetchComments() // 重新获取评论
        // 3秒后清除成功消息
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error('删除评论失败')
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      setError('删除评论失败，请稍后再试')
    } finally {
      setDeletingCommentId(null)
    }
  }

  // 开始编辑评论
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingContent(comment.content)
  }

  // 取消编辑
  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditingContent('')
  }

  // 更新评论
  const updateComment = async () => {
    if (!editingContent.trim()) {
      setError('评论内容不能为空')
      return
    }

    setIsUpdating(true)
    setError(null)
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingCommentId,
          content: editingContent,
        }),
      })

      if (response.ok) {
        setSuccessMessage('评论更新成功')
        setEditingCommentId(null)
        setEditingContent('')
        fetchComments() // 重新获取评论
        // 3秒后清除成功消息
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error('更新评论失败')
      }
    } catch (error) {
      console.error('更新评论失败:', error)
      setError('更新评论失败，请稍后再试')
    } finally {
      setIsUpdating(false)
    }
  }

  // 组件挂载时获取评论
  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments, pageId])

  return (
    <div className="d1-comments">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium">路人评论 ({comments.length})</h4>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {showComments ? '收起' : '展开'}
        </button>
      </div>

      {showComments && (
        <>
          {/* 错误和成功消息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
              {successMessage}
            </div>
          )}

          {/* 评论列表 */}
          <div className="space-y-3 mb-6">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                <p className="text-gray-500 text-sm mt-2">加载评论中...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">暂无评论，快来发表第一条评论吧！</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">{comment.author.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{comment.author}</span>
                        <div className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                          {comment.updated_at && <span className="ml-1">(已编辑)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditing(comment)}
                        className="text-gray-400 hover:text-blue-500 text-xs px-2 py-1 rounded transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingCommentId === comment.id ? '删除中...' : '删除'}
                      </button>
                    </div>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                        rows={3}
                      />
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-gray-600 text-sm hover:bg-gray-100 rounded transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={updateComment}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                          {isUpdating ? '更新中...' : '更新'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{comment.content}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 评论表单 */}
          <form onSubmit={submitComment} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-600">
                  {authorName ? authorName.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="您的昵称"
                  className="w-full px-3 py-2 mb-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="发表您的评论..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none mb-3"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? '发布中...' : '发布评论'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  )
}