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

  // 解码路径，支持中文目录/文件名
  const rawPath = url.pathname.replace(/^\/images\//, '')
  const key = decodeURIComponent(rawPath)

  const accept = (req.headers.get('Accept') || '').toLowerCase()

  // 内容协商优先级：avif -> webp -> 原始
  const tryExts: string[] = []
  if (accept.includes('image/avif')) tryExts.push('.avif')
  if (accept.includes('image/webp')) tryExts.push('.webp')

  const debugMode = url.searchParams.get('debug') === '1'
  const triedKeys: string[] = []

  // helper 尝试获取对象
  async function tryGet(k: string) {
    triedKeys.push(k)
    try {
      return await env.R2.get(k)
    } catch (e) {
      return null
    }
  }

  // 常见候选 key（增加容错）：
  // - 解码后的 key（key）
  // - 未解码的 rawPath（例如 URL 中本来就是编码的）
  // - 带 images/ 前缀的变体（有时上传脚本包含或不包含该前缀）
  const candidateBases = [key, rawPath, `images/${key}`, `images/${rawPath}`].filter(Boolean)

  // 如果 key 带有扩展名，例如 chapter/001/001.png
  const m = key.match(/\.(\w+)$/)
  let object: R2Object | null = null
  let usedKey = ''

  if (m) {
    const ext = '.' + m[1].toLowerCase()
    const base = key.slice(0, -ext.length)

    // 对每个候选 base 都尝试协商和原始
    for (const b of candidateBases.map(c => c.endsWith(ext) ? c.slice(0, -ext.length) : (c === rawPath ? base : c))) {
      // 协商后缀
      for (const e of tryExts) {
        const altKey = b + e
        object = await tryGet(altKey)
        if (object) {
          usedKey = altKey
          break
        }
      }
      if (object) break

      // 最后尝试原始扩展
      const origKey = b + ext
      object = await tryGet(origKey)
      if (object) {
        usedKey = origKey
        break
      }
    }
  } else {
    // key 没有扩展名，尝试常见图片后缀
    const fallbackExts = ['.webp', '.avif', '.png', '.jpg', '.jpeg']
    const exts = [...tryExts, ...fallbackExts.filter(x => !tryExts.includes(x))]
    // 遍历候选 base 和扩展
    outer: for (const baseCandidate of candidateBases) {
      for (const e of exts) {
        const altKey = baseCandidate + e
        object = await tryGet(altKey)
        if (object) {
          usedKey = altKey
          break outer
        }
      }
    }
  }

  if (!object) {
    if (debugMode) {
      return new Response(JSON.stringify({ ok: false, triedKeys }, null, 2), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return new Response('Not Found', { status: 404 })
  }

  const headers = new Headers()

  // 自动 Content-Type
  if (object.httpMetadata?.contentType) {
    headers.set('Content-Type', object.httpMetadata.contentType)
  } else {
    headers.set('Content-Type', guessContentType(usedKey || key))
  }

  // 告知基于 Accept 的缓存
  headers.set('Vary', 'Accept')

  // 强缓存（非常重要）
  headers.set(
    'Cache-Control',
    'public, max-age=31536000, immutable'
  )

  // R2Object 的类型定义在 typing 上可能未包含 body，安全地按 any 读取
  const body = (object as any).body as BodyInit

  if (debugMode) {
    // 返回匹配信息和 headers
    const info = {
      ok: true,
      usedKey,
      triedKeys,
      contentType: object.httpMetadata?.contentType || guessContentType(usedKey || key)
    }
    return new Response(JSON.stringify(info, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(body, { headers })
}

function guessContentType(key: string): string {
  const k = key.toLowerCase()
  if (k.endsWith('.webp')) return 'image/webp'
  if (k.endsWith('.png')) return 'image/png'
  if (k.endsWith('.jpg') || k.endsWith('.jpeg')) return 'image/jpeg'
  if (k.endsWith('.avif')) return 'image/avif'
  return 'application/octet-stream'
}