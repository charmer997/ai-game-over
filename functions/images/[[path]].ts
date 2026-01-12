export async function onRequest({ env, params }: any) {
    // 1️⃣ params.path 必须是数组
    if (!params.path || !Array.isArray(params.path)) {
        return new Response("no path", { status: 400 })
    }

    // 2️⃣ 拼 R2 key
    const key = `images/${params.path.join("/")}`

    // 3️⃣ 直接 get，不做任何花活
    const object = await env.R2.get(key)

    if (!object) {
        return new Response(
            `R2 MISS\nkey = ${key}`,
            { status: 404 }
        )
    }

    return new Response(object.body, {
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=31536000"
        }
    })
}
