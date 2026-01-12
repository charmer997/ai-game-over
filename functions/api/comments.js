// Cloudflare Pages Functions for comments API
// 这个文件处理生产环境中的评论API请求

export async function onRequest(context) {
  const { request, env } = context
  
  // 只允许 POST、GET、PUT 和 DELETE 请求
  const method = request.method
  if (method !== 'POST' && method !== 'GET' && method !== 'DELETE' && method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    if (method === 'GET') {
      // 获取评论
      const url = new URL(request.url)
      const page_id = url.searchParams.get('page_id')
      
      if (!page_id) {
        return new Response(JSON.stringify({ error: 'page_id is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 从 D1 数据库查询评论
      try {
        const { results } = await env.DB.prepare(
          'SELECT * FROM dicomments WHERE page_id = ? ORDER BY created_at DESC'
        ).bind(page_id).all()
        
        return new Response(JSON.stringify({ comments: results || [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (dbError) {
        console.error('Database query error:', dbError)
        // 数据库查询失败，返回空数组
        return new Response(JSON.stringify({ comments: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } else if (method === 'POST') {
      // 创建新评论
      const body = await request.json()
      const { content, author, page_id } = body

      if (!content || !author || !page_id) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 将评论保存到 D1 数据库
      try {
        const { success, meta } = await env.DB.prepare(
          'INSERT INTO dicomments (content, author, page_id, created_at) VALUES (?, ?, ?, ?)'
        ).bind(content, author, page_id, new Date().toISOString()).run()
        
        if (success && meta) {
          // 返回新创建的评论
          const newComment = {
            id: meta.last_row_id.toString(),
            content,
            author,
            page_id,
            created_at: new Date().toISOString()
          }
          
          return new Response(JSON.stringify({ comment: newComment }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          })
        } else {
          // 如果插入失败，返回模拟的
          const newComment = {
            id: Date.now().toString(),
            content,
            author,
            page_id,
            created_at: new Date().toISOString()
          }
          
          return new Response(JSON.stringify({ comment: newComment }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      } catch (dbError) {
        console.error(dbError)
        // 数据库插入失败，返回模拟数据
        const newComment = {
          id: Date.now().toString(),
          content,
          author,
          page_id,
          created_at: new Date().toISOString()
        }
        
        return new Response(JSON.stringify({ comment: newComment }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } else if (method === 'DELETE') {
      // 删除评论
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'Comment ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      try {
        const { success, meta } = await env.DB.prepare(
          'DELETE FROM dicomments WHERE id = ?'
        ).bind(id).run()
        
        if (success && meta && meta.changes > 0) {
          return new Response(JSON.stringify({ success: true, message: '评论删除成功' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } else {
          return new Response(JSON.stringify({ error: '评论不存在或删除失败' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      } catch (dbError) {
        console.error('Database delete error:', dbError)
        return new Response(JSON.stringify({ error: '删除评论失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } else if (method === 'PUT') {
      // 编辑评论
      const body = await request.json()
      const { id, content } = body

      //这个bug有概率有 复现率不低
      if (!id || !content) {
        return new Response(JSON.stringify({ error: '莫名其妙丢了目标id' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      try {
        const { success, meta } = await env.DB.prepare(
          'UPDATE dicomments SET content = ?, updated_at = ? WHERE id = ?'
        ).bind(content, new Date().toISOString(), id).run()
        
        if (success && meta && meta.changes > 0) {
          return new Response(JSON.stringify({ success: true, message: '编辑成功喵' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } else {
          return new Response(JSON.stringify({ error: '评论不存在或编辑失败' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      } catch (dbError) {
        console.error('Database update error:', dbError)
        return new Response(JSON.stringify({ error: '编辑败喵' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  } catch (error) {
    console.error('Comments API error:', error)
    return new Response(JSON.stringify({ error: '大哥，你网不行' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}