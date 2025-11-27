import { ApiRequestState, KeyValueItem, RequestMethod } from "@/components/api-client/types"

export function parseCurlCommand(curlCommand: string): Partial<ApiRequestState> {
    const result: Partial<ApiRequestState> = {
        method: "GET",
        headers: [],
        params: [],
        body: { type: "none", content: "" },
        auth: { type: "none" },
    }

    // Normalize newlines and spaces
    const normalized = curlCommand.replace(/\\\n/g, " ").replace(/\s+/g, " ").trim()

    // Extract URL
    const urlMatch = normalized.match(/curl\s+(?:-X\s+\w+\s+)?['"]?([^'"]+\:\/\/[^'"]+)['"]?/)
    if (urlMatch) {
        let url = urlMatch[1]
        // Separate query params if present in URL
        if (url.includes("?")) {
            const [baseUrl, queryString] = url.split("?")
            result.url = baseUrl
            const params = new URLSearchParams(queryString)
            params.forEach((value, key) => {
                result.params?.push({
                    id: crypto.randomUUID(),
                    key,
                    value,
                    active: true,
                })
            })
        } else {
            result.url = url
        }
    }

    // Extract Method
    const methodMatch = normalized.match(/-X\s+([A-Z]+)/)
    if (methodMatch) {
        result.method = methodMatch[1] as RequestMethod
    }

    // Extract Headers
    const headerMatches = normalized.matchAll(/-H\s+['"]([^'"]+)['"]/g)
    for (const match of headerMatches) {
        const [key, value] = match[1].split(/:\s(.+)/)
        if (key && value) {
            result.headers?.push({
                id: crypto.randomUUID(),
                key: key.trim(),
                value: value.trim(),
                active: true,
            })
        }
    }

    // Extract Body
    const dataMatch = normalized.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/)
    if (dataMatch) {
        const content = dataMatch[1]
        try {
            JSON.parse(content)
            result.body = { type: "json", content }
            // If no method specified and has body, default to POST
            if (!methodMatch) {
                result.method = "POST"
            }
        } catch {
            result.body = { type: "text", content }
            if (!methodMatch) {
                result.method = "POST"
            }
        }
    }

    // Extract Auth (Basic)
    const userMatch = normalized.match(/-u\s+['"]?([^'"]+)['"]?/)
    if (userMatch) {
        const [username, password] = userMatch[1].split(":")
        result.auth = {
            type: "basic",
            username,
            password,
        }
    }

    // Extract Auth (Bearer) - usually in headers but good to check
    const authHeader = result.headers?.find(h => h.key.toLowerCase() === "authorization")
    if (authHeader && authHeader.value.startsWith("Bearer ")) {
        result.auth = {
            type: "bearer",
            token: authHeader.value.replace("Bearer ", ""),
        }
        // Remove from headers as it's handled in auth state
        result.headers = result.headers?.filter(h => h.id !== authHeader.id)
    }

    return result
}
