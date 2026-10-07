import { getAllowedOrigins } from "../src/infrastructure/utils/allowedOrigins";

interface RateLimiter {
    limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
    EFATURA_API_BASE_URL?: string;
    API_RATE_LIMITER: RateLimiter;
    AUTH_RATE_LIMITER: RateLimiter;
    CATEGORY_RATE_LIMITER: RateLimiter;
}

// Headers that must not be passed through to API Gateway
const STRIP_HEADERS = ["host", "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "cf-worker", "x-real-ip"];

const AUTH_SESSION_PATHS = ["/api/auth/me", "/api/auth/login", "/api/auth/logout"];
const CATEGORY_PATH_PREFIX = "/api/category/";

function proxyHeaders(request: Request): Headers {
    const headers = new Headers(request.headers);

    for (const name of STRIP_HEADERS) {
        headers.delete(name);
    }

    // Keep the real client IP visible to AWS (access logs, $context.identity.sourceIp is Cloudflare's IP)
    headers.set("x-forwarded-for", getClientIp(request));

    return headers;
}

// Errors produced by the Worker itself never reach API Gateway, so they need their
// own CORS headers — otherwise the extension sees a CORS error instead of the status.
function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("origin") ?? "";

    if (!getAllowedOrigins().includes(origin)) {
        return {};
    }

    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        Vary: "Origin"
    };
}

function jsonError(request: Request, status: number, message: string, extraHeaders: Record<string, string> = {}): Response {
    return Response.json({ error: message }, { status, headers: { ...corsHeaders(request), ...extraHeaders } });
}

function getClientIp(request: Request): string {
    return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

function selectLimiter(env: Env, pathname: string): RateLimiter {
    if (AUTH_SESSION_PATHS.includes(pathname)) {
        return env.AUTH_RATE_LIMITER;
    }

    if (pathname.startsWith(CATEGORY_PATH_PREFIX)) {
        return env.CATEGORY_RATE_LIMITER;
    }

    return env.API_RATE_LIMITER;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (!url.pathname.startsWith("/api/")) {
            return jsonError(request, 404, "Not found");
        }

        // Let CORS preflights through without spending rate-limit quota
        if (request.method !== "OPTIONS") {
            const { success } = await selectLimiter(env, url.pathname).limit({ key: getClientIp(request) });

            if (!success) {
                return jsonError(request, 429, "Too many requests", { "Retry-After": "60" });
            }
        }

        const baseUrl = env.EFATURA_API_BASE_URL?.trim();

        if (!baseUrl) {
            return jsonError(request, 500, "EFATURA_API_BASE_URL is not configured on the Worker");
        }

        try {
            const target = new URL(url.pathname + url.search, baseUrl);

            return await fetch(target, {
                method: request.method,
                headers: proxyHeaders(request),
                body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body
            });
        } catch (error) {
            console.error("API proxy error:", error);

            return jsonError(request, 502, "API proxy failed");
        }
    }
} satisfies ExportedHandler<Env>;