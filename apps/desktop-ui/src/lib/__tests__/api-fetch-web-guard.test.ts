/**
 * Outside the Tauri window there is no local store and no HTTP API route, so
 * `/api/...` must fail with a readable 501 instead of falling through to
 * Next's 404 HTML page (which used to surface verbatim in error toasts).
 */
import { apiFetch, sendProxyRequest } from "@/lib/desktop/api-fetch"

describe("apiFetch outside the desktop app", () => {
  it("returns a 501 with a readable detail, never a network fetch", async () => {
    const fetchSpy = jest.spyOn(global, "fetch")
    const res = await apiFetch("/api/v1/user-preferences")

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(res.status).toBe(501)
    const { detail } = await res.json()
    expect(detail).toContain("/api/v1/user-preferences")
    expect(detail).toContain("pnpm dev:desktop")
    fetchSpy.mockRestore()
  })

  it("fails the api-client proxy with an envelope error", async () => {
    await expect(sendProxyRequest({ url: "https://example.com" })).resolves.toMatchObject({
      status: 0,
      error: expect.stringContaining("outside the desktop app"),
    })
  })
})
