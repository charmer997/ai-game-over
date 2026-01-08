/**
 * 评论系统API
 * 与Cloudflare D1数据库交互
 */

// API基础URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://lovegame-132.pages.dev/api' 
  : '/api'

export interface User {
  id: string
  name: string
  avatar: string
  token: string
  created_at?: string
  last_active?: string
}

export interface Comment {
  id: string
  content: string
  user_id: string
  page_id: string
  created_at: string
  updated_at?: string
  user?: User
}

export interface CommentWithUser extends Comment {
  user: User
}

/**
 * 生成随机用户名
 */
export const generateRandomUsername = () => {
  const adjectives = ['快乐的', '神秘的', '勇敢的', '聪明的', '友好的', '活泼的', '冷静的', '热情的']
  const animals = ['小猫', '小狗', '小兔', '小鸟', '小鱼', '小熊', '小狐狸', '小松鼠']
  const numbers = Math.floor(Math.random() * 999) + 1
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  
  return `${adjective}${animal}${numbers}`
}

/**
 * 生成随机token
 */
export const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * 生成随机头像
 */
export const generateAvatar = (username: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
}

/**
 * 创建或获取用户
 */
export const createOrGetUser = async (token: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      throw new Error('Failed to create or get user')
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('Error creating/getting user:', error)
    return null
  }
}

/**
 * 获取页面评论
 */
export const getPageComments = async (pageId: string): Promise<CommentWithUser[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments?page_id=${encodeURIComponent(pageId)}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }

    const data = await response.json()
    return data.comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

/**
 * 提交评论
 */
export const submitComment = async (
  pageId: string,
  content: string,
  userToken: string
): Promise<CommentWithUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_id: pageId,
        content,
        user_token: userToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit comment')
    }

    const data = await response.json()
    return data.comment
  } catch (error) {
    console.error('Error submitting comment:', error)
    return null
  }
}

/**
 * 删除评论
 */
export const deleteComment = async (
  commentId: string,
  userToken: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_token: userToken }),
    })

    return response.ok
  } catch (error) {
    console.error('Error deleting comment:', error)
    return false
  }
}

/**
 * 更新用户最后活跃时间
 */
export const updateUserActivity = async (userToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: userToken }),
    })

    return response.ok
  } catch (error) {
    console.error('Error updating user activity:', error)
    return false
  }
}