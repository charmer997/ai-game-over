/**
 * Cloudflare Workers API
 * 处理评论系统的数据库操作
 */

import { generateRandomUsername, generateToken, generateAvatar } from './lib/comments-api'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // 设置CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // 处理OPTIONS请求（CORS预检）
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // 评论API路由
      if (path.startsWith('/api/comments')) {
        return handleCommentsAPI(request, env, corsHeaders)
      }

      // 用户API路由
      if (path.startsWith('/api/users')) {
        return handleUsersAPI(request, env, corsHeaders)
      }

      // 默认响应
      return new Response('Not Found', { status: 404 })
    } catch (error) {
      console.error('API Error:', error)
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
  }
}

/**
 * 处理评论API
 */
async function handleCommentsAPI(request, env, corsHeaders) {
  const url = new URL(request.url)
  const method = request.method

  if (method === 'GET') {
    // 获取评论列表
    const pageId = url.searchParams.get('page_id')
    if (!pageId) {
      return new Response(JSON.stringify({ error: 'page_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    const stmt = env.DB.prepare(`
      SELECT c.*, u.name, u.avatar, u.token
      FROM custom_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.page_id = ?
      ORDER BY c.created_at DESC
    `)

    const results = await stmt.bind(pageId).all()
    
    const comments = results.results.map(row => ({
      id: row.id,
      content: row.content,
      user_id: row.user_id,
      page_id: row.page_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        name: row.name,
        avatar: row.avatar,
        token: row.token
      }
    }))

    return new Response(JSON.stringify({ comments }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  if (method === 'POST') {
    // 提交新评论
    const body = await request.json()
    const { page_id, content, user_token } = body

    if (!page_id || !content || !user_token) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // 验证用户token
    const userStmt = env.DB.prepare('SELECT * FROM users WHERE token = ?')
    const userResult = await userStmt.bind(user_token).first()
    
    if (!userResult) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // 创建评论
    const commentId = generateToken()
    const commentStmt = env.DB.prepare(`
      INSERT INTO custom_comments (id, content, user_id, page_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    await commentStmt.bind(commentId, content, userResult.id, page_id).run()

    // 更新用户最后活跃时间
    const activityStmt = env.DB.prepare('UPDATE users SET last_active = datetime("now") WHERE id = ?')
    await activityStmt.bind(userResult.id).run()

    // 返回新创建的评论
    const newCommentStmt = env.DB.prepare(`
      SELECT c.*, u.name, u.avatar, u.token
      FROM custom_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `)

    const newComment = await newCommentStmt.bind(commentId).first()

    return new Response(JSON.stringify({ comment: newComment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  if (method === 'DELETE') {
    // 删除评论
    const commentId = path.split('/').pop()
    const body = await request.json()
    const { user_token } = body

    if (!commentId || !user_token) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // 验证用户token并检查是否为评论作者
    const commentStmt = env.DB.prepare(`
      SELECT c.*, u.token
      FROM custom_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `)

    const comment = await commentStmt.bind(commentId).first()

    if (!comment || comment.token !== user_token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // 删除评论
    const deleteStmt = env.DB.prepare('DELETE FROM custom_comments WHERE id = ?')
    await deleteStmt.bind(commentId).run()

    return new Response(null, { status: 204, headers: corsHeaders })
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
}

/**
 * 处理用户API
 */
async function handleUsersAPI(request, env, corsHeaders) {
  const url = new URL(request.url)
  const method = request.method
  const path = url.pathname

  if (method === 'POST' && path === '/api/users') {
    // 创建或获取用户
    const body = await request.json()
    const { token } = body

    if (!token) {
      return new Response(JSON.stringify({ error: 'token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // 检查用户是否已存在
    const existingUserStmt = env.DB.prepare('SELECT * FROM users WHERE token = ?')
    const existingUser = await existingUserStmt.bind(token).first()

    if (existingUser) {
      // 更新最后活跃时间
      const activityStmt = env.DB.prepare('UPDATE users SET last_active = datetime("now") WHERE id = ?')
      await activityStmt.bind(existingUser.id).run()

      return new Response(JSON.stringify({ user: existingUser }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // 创建新用户
    const userId = generateToken()
    const username = generateRandomUsername()
    const avatar = generateAvatar(username)

    const createUserStmt = env.DB.prepare(`
      INSERT INTO users (id, name, avatar, token, created_at, last_active)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    await createUserStmt.bind(userId, username, avatar, token).run()

    // 获取新创建的用户
    const newUserStmt = env.DB.prepare('SELECT * FROM users WHERE id = ?')
    const newUser = await newUserStmt.bind(userId).first()

    return new Response(JSON.stringify({ user: newUser }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  if (method === 'POST' && path === '/api/users/activity') {
    // 更新用户活跃时间
    const body = await request.json()
    const { token } = body

    if (!token) {
      return new Response(JSON.stringify({ error: 'token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    const stmt = env.DB.prepare('UPDATE users SET last_active = datetime("now") WHERE token = ?')
    await stmt.bind(token).run()

    return new Response(null, { status: 200, headers: corsHeaders })
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
}