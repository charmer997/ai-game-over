export async function onRequest(context: { request: Request, env: any, params: Record<string, string[]>, next?: any }) {
  const { request, env, params } = context

  // params.path 是捕获的路径片段数组
  if (!params?.path || !Array.isArray(params.path)) {
    return new Response('Not Found', { status: 404 })
  }

  const rawKey = params.path.join('/') // e.g. chapters/第01话/44.jpg
  const decodedKey = decodeURIComponent(rawKey)
  const accept = (request.headers.get('Accept') || '').toLowerCase()
  const tryExts: string[] = []
  if (accept.includes('image/avif')) tryExts.push('.avif')
  if (accept.includes('image/webp')) tryExts.push('.webp')

  const debugMode = new URL(request.url).searchParams.get('debug') === '1'
  const triedKeys: string[] = []

  // helper
  async function tryGet(key: string) {
    triedKeys.push(key)
    try {
      return await env.R2.get(key)
    } catch (e) {
      return null
    }
  }

  // candidate bases - adjust if your R2 keys include or exclude an images/ prefix
  const candidateBases = [decodedKey, rawKey, `images/${decodedKey}`, `images/${rawKey}`]

  let object: any = null
  let usedKey = ''

  const m = decodedKey.match(/\.(\w+)$/)

  if (m) {
    const ext = '.' + m[1].toLowerCase()
    const base = decodedKey.slice(0, -ext.length)

    for (const b of candidateBases.map(c => c.endsWith(ext) ? c.slice(0, -ext.length) : c)) {
      // content negotiation
      for (const e of tryExts) {
        const altKey = b + e
        object = await tryGet(altKey)
        if (object) {
          usedKey = altKey
          break
        }
      }
      if (object) break

      // try original ext
      const origKey = b + ext
      object = await tryGet(origKey)
      if (object) {
        usedKey = origKey
        break
      }
    }
  } else {
    const fallbackExts = ['.webp', '.avif', '.png', '.jpg', '.jpeg']
    const exts = [...tryExts, ...fallbackExts.filter(x => !tryExts.includes(x))]

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

  // build headers
  const headers = new Headers()
  if (typeof object.writeHttpMetadata === 'function') {
    try {
      object.writeHttpMetadata(headers)
    } catch (e) {
      // ignore
    }
  }
  if (object.httpEtag) headers.set('etag', object.httpEtag)
  // Ensure Content-Type if not present
  if (!headers.has('Content-Type') && object.httpMetadata?.contentType) {
    headers.set('Content-Type', object.httpMetadata.contentType)
  }

  headers.set('Vary', 'Accept')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  if (debugMode) {
    return new Response(JSON.stringify({ ok: true, usedKey, triedKeys, contentType: headers.get('Content-Type') }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const body = (object as any).body as BodyInit
  return new Response(body, { headers })
}

