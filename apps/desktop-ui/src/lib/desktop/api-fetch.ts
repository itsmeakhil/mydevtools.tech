import { isDesktop } from "./is-desktop";
import { localApi, normalizeBackendPath, toResponse } from "./bridge";

/**
 * Dev-only failure message. It can only appear when this UI runs outside the
 * Tauri window (`pnpm dev` instead of `pnpm dev:desktop`), never in the
 * shipped app — so it is intentionally untranslated.
 */
const NOT_IN_DESKTOP =
  "No local data store: this UI is running outside the desktop app. Run `pnpm dev:desktop` and use the app window.";

function notInDesktopResponse(path: string): Response {
  return new Response(JSON.stringify({ detail: `${NOT_IN_DESKTOP} (${path})` }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Desktop-aware fetch for same-origin `/api/...` paths.
 *
 * On desktop it routes `/api/backend/*` (and `/api/v1/*`) paths to the Rust
 * local router. There is no server, so outside the Tauri window every path
 * here fails with a 501 instead of hitting Next's 404 page.
 */
/**
 * Send an api-client request and return the `/api/proxy` envelope directly.
 * On desktop this skips the stringify → Response → json() round-trip that
 * `apiFetch("/api/proxy")` does purely to fake a fetch — two extra full passes
 * over a multi-MB body on the UI thread.
 */
export interface ProxyEnvelope {
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  setCookies?: string[];
  redirectChain?: unknown[];
  body?: string;
  isBase64?: boolean;
  time?: number;
  size?: number;
  error?: string;
}

export async function sendProxyRequest(input: unknown, signal?: AbortSignal): Promise<ProxyEnvelope> {
  if (isDesktop()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return (await invoke("http_request", { input })) as ProxyEnvelope;
  }
  void signal;
  return { status: 0, error: NOT_IN_DESKTOP };
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!isDesktop()) {
    // This app has no HTTP API routes — `/api/...` is the Tauri local router's
    // contract only. Outside the desktop window those paths hit Next's 404
    // page, and its HTML would surface verbatim in a toast. Fail legibly.
    return notInDesktopResponse(path);
  }
  const method = (init?.method || "GET").toUpperCase();
  const body = typeof init?.body === "string" ? init.body : undefined;

  // api-client HTTP proxy → Rust http_request (returns the /api/proxy envelope).
  if (path === "/api/proxy" || path.startsWith("/api/proxy?")) {
    const { invoke } = await import("@tauri-apps/api/core");
    const input = body ? JSON.parse(body) : {};
    const envelope = await invoke("http_request", { input });
    return new Response(JSON.stringify(envelope), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Native gRPC → Rust h2 transport (returns the /api/proxy-grpc envelope).
  if (path.startsWith("/api/proxy-grpc")) {
    const { invoke } = await import("@tauri-apps/api/core");
    const input = body ? JSON.parse(body) : {};
    const envelope = await invoke("proxy_grpc", { input });
    return new Response(JSON.stringify(envelope), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Advanced proxies not available on desktop yet (v1.1). Mock serving on
  // desktop goes through the Rust loopback server (`mock_server_start`), not
  // this path — the guard below only catches stale web-origin mock URLs.
  if (
    path.startsWith("/api/proxy-ntlm") ||
    path.startsWith("/api/proxy-spnego") ||
    path.startsWith("/api/mock")
  ) {
    return new Response(
      JSON.stringify({ error: "This feature is not available in the desktop app yet" }),
      { status: 501, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = await localApi(method, normalizeBackendPath(path), body);
  return toResponse(res);
}
