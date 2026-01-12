/// <reference types="@cloudflare/workers-types" />

export interface Env {
  R2: R2Bucket
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)

    // 只处理图片请求
    if (url.pathname.startsWith('/images/')) {
      return handleImage(req, env)
    }

    // 其他请求交给 Pages
    return fetch(req)
  },
}

async function handleImage(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url)

  // /images/chapters/001/001.webp → chapters/001/001.webp
  const key = url.pathname.replace(/^\/images\//, '')

  const object = await env.R2.get(key)

  if (!object) {
    return new Response('Not Found', { status: 404 })
  }

  const headers = new Headers()

  // 自动 Content-Type
  if (object.httpMetadata?.contentType) {
    headers.set('Content-Type', object.httpMetadata.contentType)
  } else {
    headers.set('Content-Type', guessContentType(key))
  }

  // ⭐ 强缓存（非常重要）
  headers.set(
    'Cache-Control',
    'public, max-age=31536000, immutable'
  )

  return new Response(object.body, { headers })
}

function guessContentType(key: string): string {
  if (key.endsWith('.webp')) return 'image/webp'
  if (key.endsWith('.png')) return 'image/png'
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg'
  if (key.endsWith('.avif')) return 'image/avif'
  return 'application/octet-stream'
}