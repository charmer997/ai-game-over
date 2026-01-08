import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许POST和GET请求
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (req.method === 'GET') {
      // 获取评论列表
      const { page_id } = req.query
      
      if (!page_id || typeof page_id !== 'string') {
        return res.status(400).json({ error: 'page_id is required' })
      }

      // 这里应该连接到Cloudflare D1数据库查询评论
      // 由于这是静态导出的Next.js应用，我们需要通过Cloudflare Workers来处理数据库操作
      // 暂时返回模拟数据
      const mockComments = [
        {
          id: '1',
          content: '这一话太精彩了！期待下一话！',
          user_id: 'user1',
          page_id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: {
            id: 'user1',
            name: '快乐的小猫123',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=快乐的小猫123',
            token: 'token1'
          }
        },
        {
          id: '2',
          content: '画风很棒，故事情节也很吸引人。',
          user_id: 'user2',
          page_id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          user: {
            id: 'user2',
            name: '神秘的小狗456',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=神秘的小狗456',
            token: 'token2'
          }
        }
      ]

      return res.status(200).json({ comments: mockComments })
    }

    if (req.method === 'POST') {
      // 提交新评论
      const { page_id, content, user_token } = req.body

      if (!page_id || !content || !user_token) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // 这里应该通过Cloudflare Workers处理数据库操作
      // 暂时返回模拟数据
      const newComment = {
        id: Date.now().toString(),
        content,
        user_id: 'current_user',
        page_id,
        created_at: new Date().toISOString(),
        user: {
          id: 'current_user',
          name: '勇敢的小兔789',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=勇敢的小兔789',
          token: user_token
        }
      }

      return res.status(201).json({ comment: newComment })
    }
  } catch (error) {
    console.error('Comments API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}