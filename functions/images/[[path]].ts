export async function onRequest({ env, params }: any) {
    if (!params.path || !Array.isArray(params.path)) {
        return new Response("no path", { status: 400 })
    }

    const decodedPath = (params.path as string[]).map(
        (p: string) => decodeURIComponent(p)
    )

    const key = `images/${decodedPath.join("/")}`

    const object = await env.R2.get(key)

    //R2 MISS
    if (!object) {
        return new Response(
            `R2 MISS\nkey = ${key}`,
            { status: 404 }
        )
    }

    return new Response(object.body, {
        headers: {

            "Cache-Control": "public, max-age=31536000, immutable",
            "Accept-Ranges": "bytes",
            "Content-Type": "image/png",
        }
    })

}
