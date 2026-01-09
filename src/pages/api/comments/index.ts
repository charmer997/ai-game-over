import { NextApiRequest, NextApiResponse } from 'next'

interface Comment {
  id: string
  content: string
  author: string
  page_id: string
  created_at: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许 POST、GET、PUT 和 DELETE 请求
  if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (req.method === 'GET') {
      // 获取评论
      const { page_id } = req.query
      
      if (!page_id) {
        return res.status(400).json({ error: 'page_id is required' })
      }

      // 从 D1 数据库查询评论
      // 在 Cloudflare Pages 中，D1 数据库通过全局变量 env.DB 访问
      try {
        // @ts-ignore - Cloudflare Pages 环境变量
        const { results } = await (globalThis as any).env?.DB?.prepare(
          'SELECT * FROM dicomments WHERE page_id = ? ORDER BY created_at DESC'
        )?.bind(page_id as string)?.all() || { results: [] }
        
        return res.status(200).json({ comments: results || [] })
      } catch (dbError) {
        console.error('Database query error:', dbError)
        // 数据库查询失败，返回空数组
        return res.status(200).json({ comments: [] })
      }
    } else if (req.method === 'POST') {
      // 创建新评论
      const { content, author, page_id } = req.body

      if (!content || !author || !page_id) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // 将评论保存到 D1 数据库
      try {
        // 在 Cloudflare Pages 中，D1 数据库通过全局变量 env.DB 访问
        // @ts-ignore - Cloudflare Pages 环境变量
        const { success, meta } = await (globalThis as any).env?.DB?.prepare(
          'INSERT INTO dicomments (content, author, page_id, created_at) VALUES (?, ?, ?, ?)'
        )?.bind(content, author, page_id, new Date().toISOString())?.run() || { success: false, meta: null }
        
        if (success && meta) {
          // 返回新创建的评论
          const newComment: Comment = {
            id: meta.last_row_id.toString(),
            content,
            author,
            page_id,
            created_at: new Date().toISOString()
          }
          
          return res.status(201).json({ comment: newComment })
        } else {
          // 如果插入失败，返回模拟数据
          console.warn('Failed to insert comment, returning mock comment')
          const newComment: Comment = {
            id: Date.now().toString(),
            content,
            author,
            page_id,
            created_at: new Date().toISOString()
          }
          
          return res.status(201).json({ comment: newComment })
        }
      } catch (dbError) {
        console.error('Database insert error:', dbError)
        // 数据库插入失败，返回模拟数据
        const newComment: Comment = {
          id: Date.now().toString(),
          content,
          author,
          page_id,
          created_at: new Date().toISOString()
        }
        
        return res.status(201).json({ comment: newComment })
      }
    } else if (req.method === 'DELETE') {
      // 删除评论
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({ error: 'Comment ID is required' })
      }

      try {
        // 在 Cloudflare Pages 中，D1 数据库通过全局变量 env.DB 访问
        // @ts-ignore - Cloudflare Pages 环境变量
        const { success, meta } = await (globalThis as any).env?.DB?.prepare(
          'DELETE FROM dicomments WHERE id = ?'
        )?.bind(id)?.run() || { success: false, meta: null }
        
        if (success && meta && meta.changes > 0) {
          return res.status(200).json({ success: true, message: '评论删除成功' })
        } else {
          return res.status(404).json({ error: '评论不存在或删除失败' })
        }
      } catch (dbError) {
        console.error('Database delete error:', dbError)
        return res.status(500).json({ error: '删除评论失败' })
      }
    } else if (req.method === 'PUT') {
      // 编辑评论
      const { id, content } = req.body
      
      if (!id || !content) {
        return res.status(400).json({ error: 'Comment ID and content are required' })
      }

      try {
        // 在 Cloudflare Pages 中，D1 数据库通过全局变量 env.DB 访问
        // @ts-ignore - Cloudflare Pages 环境变量
        const { success, meta } = await (globalThis as any).env?.DB?.prepare(
          'UPDATE dicomments SET content = ?, updated_at = ? WHERE id = ?'
        )?.bind(content, new Date().toISOString(), id)?.run() || { success: false, meta: null }
        
        if (success && meta && meta.changes > 0) {
          return res.status(200).json({ success: true, message: '评论更新成功' })
        } else {
          return res.status(404).json({ error: '评论不存在或更新失败' })
        }
      } catch (dbError) {
        console.error('Database update error:', dbError)
        return res.status(500).json({ error: '更新评论失败' })
      }
    }
  } catch (error) {
    console.error('Comments API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}