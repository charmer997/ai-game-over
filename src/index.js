/**
 * Cloudflare Workers API
 * 基础API处理
 */

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