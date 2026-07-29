const ASSET_PREFIX = "WebD_Minecraft_Site/";
const UPLOADABLE_PREFIXES = [
    `${ASSET_PREFIX}images/`,
    `${ASSET_PREFIX}videos/`,
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const LOCAL_UPLOAD_ORIGINS = new Set([
    "http://127.0.0.1:5501",
    "http://localhost:5501",
]);

function getAllowedOrigin(request, env) {
    const origin = request.headers.get("Origin");

    if (!origin) {
        return null;
    }

    if (LOCAL_UPLOAD_ORIGINS.has(origin)) {
        return origin;
    }

    try {
        const uploadUiOrigin = new URL(env.UPLOAD_UI_URL).origin;
        return origin === uploadUiOrigin ? origin : null;
    } catch {
        return null;
    }
}

function corsHeaders(origin) {
    const headers = new Headers({
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    });

    if (origin) {
        headers.set("Access-Control-Allow-Origin", origin);
    }

    return headers;
}

function jsonResponse(data, { status = 200, origin } = {}) {
    const headers = corsHeaders(origin);
    headers.set("Content-Type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(data), { status, headers });
}

function isAuthorised(request, env) {
    const configuredKey = env.API_KEY;
    const suppliedKey = request.headers.get("Authorization");
    return Boolean(configuredKey && suppliedKey && suppliedKey === configuredKey);
}

function isUploadableKey(key) {
    return typeof key === "string" && UPLOADABLE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function getFileExtension(file) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension && /^[a-z0-9]{1,10}$/.test(extension) ? extension : "bin";
}

function getAssetFolder(file) {
    if (file.type.startsWith("image/")) {
        return "images";
    }

    if (file.type.startsWith("video/")) {
        return "videos";
    }

    return null;
}

function publicUrlFor(key, baseUrl) {
    return `${baseUrl.replace(/\/+$/, "")}/${key}`;
}

export default {
    async fetch(request, env) {
        const origin = getAllowedOrigin(request, env);

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(origin),
            });
        }

        if (!isAuthorised(request, env)) {
            return jsonResponse({ message: "Unauthorized" }, { status: 401, origin });
        }

        try {
            if (request.method === "GET") {
                const objects = [];
                let cursor;

                do {
                    const page = await env.MY_BUCKET.list({
                        prefix: ASSET_PREFIX,
                        cursor,
                    });
                    objects.push(...page.objects);
                    cursor = page.truncated ? page.cursor : undefined;
                } while (cursor);

                const list = objects.map((object) => ({
                    key: object.key,
                    url: publicUrlFor(object.key, env.R2_PUBLIC_BASE_URL),
                    customUrl: publicUrlFor(object.key, env.CUSTOM_PUBLIC_BASE_URL),
                    size: object.size,
                    uploaded: object.uploaded,
                }));

                return jsonResponse(list, { origin });
            }

            if (request.method === "POST") {
                const formData = await request.formData();
                const file = formData.get("file");

                if (!(file instanceof File)) {
                    return jsonResponse({ message: "No file supplied" }, { status: 400, origin });
                }

                if (file.size > MAX_FILE_SIZE_BYTES) {
                    return jsonResponse({ message: "File is larger than 10 MB" }, { status: 400, origin });
                }

                const folder = getAssetFolder(file);
                if (!folder) {
                    return jsonResponse({ message: "Only image and video files are allowed" }, { status: 400, origin });
                }

                const key = `${ASSET_PREFIX}${folder}/${crypto.randomUUID()}.${getFileExtension(file)}`;
                await env.MY_BUCKET.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type },
                });

                return jsonResponse({
                    key,
                    url: publicUrlFor(key, env.R2_PUBLIC_BASE_URL),
                    customUrl: publicUrlFor(key, env.CUSTOM_PUBLIC_BASE_URL),
                }, { status: 201, origin });
            }

            if (request.method === "DELETE") {
                const body = await request.json().catch(() => null);
                const key = body?.key;

                if (!isUploadableKey(key)) {
                    return jsonResponse({ message: "Invalid asset key" }, { status: 400, origin });
                }

                await env.MY_BUCKET.delete(key);
                return jsonResponse({ success: true }, { origin });
            }

            return jsonResponse({ message: "Method not allowed" }, { status: 405, origin });
        } catch (error) {
            console.error("Upload API request failed", error);
            return jsonResponse({ message: "Server error" }, { status: 500, origin });
        }
    },
};
