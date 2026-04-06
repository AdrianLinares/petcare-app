import type { Context } from "@netlify/edge-functions";

const DEFAULT_TTL_SECONDS = 30;
const CACHE_TTL_DEFAULT_ENV = "EDGE_CACHE_TTL_DEFAULT";
const CACHE_TTL_MAP_ENV = "EDGE_CACHE_TTL_MAP";
const CACHE_ALLOWLIST_ENV = "EDGE_CACHE_ALLOWLIST";
const CACHE_BYPASS_ROLES_ENV = "EDGE_CACHE_BYPASS_ROLES";
const JWT_SECRET_ENV = "JWT_SECRET";

const DEFAULT_ALLOWLIST = [
    "/api/pets",
    "/api/appointments",
    "/api/medical-records",
    "/api/vaccinations",
    "/api/medications",
    "/api/clinical-records",
    "/api/notifications",
    "/api/users",
];
const DEFAULT_BYPASS_ROLES = ["administrator"];

async function sha256Hex(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function buildCacheKey(request: Request): Promise<Request> {
    const url = new URL(request.url);
    const auth = request.headers.get("authorization") || "";

    if (auth) {
        const authHash = await sha256Hex(auth);
        url.searchParams.set("__auth", authHash);
    }

    return new Request(url.toString(), { method: "GET" });
}

function parseCommaList(raw: string | null): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

function parseTtlMap(raw: string | null): Array<{ path: string; ttl: number }> {
    if (!raw) return [];
    const entries = raw
        .split(",")
        .map((pair) => pair.trim())
        .filter(Boolean)
        .map((pair) => {
            const [path, ttlRaw] = pair.split("=").map((part) => part.trim());
            const ttl = Number.parseInt(ttlRaw || "", 10);
            return {
                path,
                ttl: Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TTL_SECONDS,
            };
        })
        .filter((entry) => entry.path);

    return entries.sort((a, b) => b.path.length - a.path.length);
}

function isPathAllowed(pathname: string, allowlist: string[]): boolean {
    if (!allowlist.length) return false;
    return allowlist.some((prefix) => pathname.startsWith(prefix));
}

function getTtlForPath(pathname: string, ttlMap: Array<{ path: string; ttl: number }>, fallback: number): number {
    const match = ttlMap.find((entry) => pathname.startsWith(entry.path));
    return match ? match.ttl : fallback;
}

function base64UrlToBytes(input: string): Uint8Array {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) {
        diff |= a[i] ^ b[i];
    }
    return diff === 0;
}

async function verifyJwtHs256(token: string, secret: string): Promise<Record<string, unknown> | null> {
    try {
        const [headerB64, payloadB64, signatureB64] = token.split(".");
        if (!headerB64 || !payloadB64 || !signatureB64) return null;

        const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(headerB64)));
        if (header.alg !== "HS256") return null;

        const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
        const payload = JSON.parse(payloadJson) as Record<string, unknown>;

        const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
        const actual = base64UrlToBytes(signatureB64);

        if (!timingSafeEqual(actual, expected)) return null;

        if (typeof payload.exp === "number") {
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export default async (request: Request, context: Context) => {
    const url = new URL(request.url);

    if (request.method !== "GET" || !url.pathname.startsWith("/api/")) {
        return context.next();
    }

    if (request.headers.get("x-cache-bypass") === "1") {
        return context.next();
    }

    const allowlistEnv = Deno.env.get(CACHE_ALLOWLIST_ENV);
    const allowlist = parseCommaList(allowlistEnv);
    const allowedPaths = allowlist.length ? allowlist : DEFAULT_ALLOWLIST;
    if (!isPathAllowed(url.pathname, allowedPaths)) {
        return context.next();
    }

    const bypassRolesEnv = Deno.env.get(CACHE_BYPASS_ROLES_ENV);
    const bypassRoles = parseCommaList(bypassRolesEnv);
    const bypassList = bypassRoles.length ? bypassRoles : DEFAULT_BYPASS_ROLES;
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader.toLowerCase().startsWith("bearer ")) {
        const token = authHeader.slice("bearer ".length).trim();
        const secret = Deno.env.get(JWT_SECRET_ENV);
        if (secret) {
            const payload = await verifyJwtHs256(token, secret);
            const role = typeof payload?.userType === "string" ? payload.userType : "";
            if (role && bypassList.includes(role)) {
                return context.next();
            }
        }
    }

    const ttlDefaultEnv = Deno.env.get(CACHE_TTL_DEFAULT_ENV);
    const ttlDefault = Number.parseInt(ttlDefaultEnv || "", 10);
    const fallbackTtl = Number.isFinite(ttlDefault) && ttlDefault > 0 ? ttlDefault : DEFAULT_TTL_SECONDS;
    const ttlMapEnv = Deno.env.get(CACHE_TTL_MAP_ENV);
    const ttlMap = parseTtlMap(ttlMapEnv);
    const maxAge = getTtlForPath(url.pathname, ttlMap, fallbackTtl);

    const cacheKey = await buildCacheKey(request);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
        const hitResponse = new Response(cached.body, cached);
        hitResponse.headers.set("X-Edge-Cache", "HIT");
        return hitResponse;
    }

    const response = await context.next();
    if (!response || response.status !== 200) {
        return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", `private, s-maxage=${maxAge}, max-age=0`);
    headers.set("Vary", "Authorization");
    headers.set("X-Edge-Cache", "MISS");

    const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });

    context.waitUntil(cache.put(cacheKey, cachedResponse.clone()));

    return cachedResponse;
};
