import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  createOrGetUser,
  getPageComments,
  submitComment,
  generateRandomUsername,
  generateToken,
  generateAvatar,
  User,
  CommentWithUser
} from '@/lib/comments-api'

interface CustomCommentsProps {
  pageId: string
  title: string
}

export default function CustomComments({ pageId, title }: CustomCommentsProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 从localStorage加载用户信息
  useEffect(() => {
    initializeUser()
    loadComments()
  }, [pageId])

  // 初始化用户
  const initializeUser = async () => {
    let token = localStorage.getItem('userToken')
    
    if (!token) {
      token = generateToken()
      localStorage.setItem('userToken', token)
    }
    
    const userData = await createOrGetUser(token)
    if (userData) {
      setUser(userData)
      localStorage.setItem('commentUser', JSON.stringify(userData))
    } else {
      // 如果API调用失败，创建本地用户
      createLocalUser(token)
    }
  }

  // 创建本地用户（备用方案）
  const createLocalUser = (token: string) => {
    const username = generateRandomUsername()
    const newUser: User = {
      id: token,
      name: username,
      avatar: generateAvatar(username),
      token
    }
    
    setUser(newUser)
    localStorage.setItem('commentUser', JSON.stringify(newUser))
  }

  // 加载评论
  const loadComments = async () => {
    setIsLoading(true)
    try {
      const commentsData = await getPageComments(pageId)
      setComments(commentsData)
    } catch (error) {
      console.error('加载评论失败:', error)
      // 如果API调用失败，显示空评论列表
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('userToken')
    localStorage.removeItem('commentUser')
    // 重新创建新用户
    initializeUser()
  }

  const handleChangeUser = () => {
    const token = generateToken()
    localStorage.setItem('userToken', token)
    initializeUser()
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      const commentData = await submitComment(pageId, newComment.trim(), user.token)
      if (commentData) {
        setComments([commentData, ...comments])
        setNewComment('')
      } else {
        // 如果API调用失败，创建本地评论
        const localComment: CommentWithUser = {
          id: Date.now().toString(),
          content: newComment.trim(),
          user_id: user.id,
          page_id: pageId,
          created_at: new Date().toISOString(),
          user
        }
        setComments([localComment, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('提交评论失败:', error)
      alert('提交评论失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔍'
      case 'qq':
        return '🐧'
      default:
        return '👤'
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">评论区</h2>
        <span className="text-sm text-gray-500">{comments.length} 条评论</span>
      </div>

      {/* 登录/评论输入区域 */}
      <div className="mb-8">
        {!user ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">登录后发表评论</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn btn-primary"
            >
              登录发表评论
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">{getProviderIcon(user.provider)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{getProviderIcon(user.provider)}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    退出
                  </button>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="发表你的评论..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '发布中...' : '发布评论'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">加载评论中...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无评论，快来发表第一条评论吧！</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {comment.user.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">{getProviderIcon(comment.user.provider)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.user.name}</span>
                    <span className="text-xs text-gray-500">{getProviderIcon(comment.user.provider)}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 登录模态框 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">选择登录方式</h3>
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span>🔍</span>
                <span>使用 Google 登录</span>
              </button>
              <button
                onClick={handleQQLogin}
                className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span>🐧</span>
                <span>使用 QQ 登录</span>
              </button>
              <button
                onClick={handleGuestLogin}
                className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span>👤</span>
                <span>游客登录</span>
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}