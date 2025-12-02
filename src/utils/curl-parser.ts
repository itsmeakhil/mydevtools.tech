import { ApiRequestState, RequestMethod } from "@/components/api-client/types"

export function parseCurlCommand(curlCommand: string): Partial<ApiRequestState> {
    const result: Partial<ApiRequestState> = {
        method: "GET",
        headers: [],
        params: [],
        body: { type: "none", content: "" },
        auth: { type: "none" },
    }

    if (!curlCommand.trim().startsWith("curl")) {
        throw new Error("Not a curl command")
    }

    const args = tokenize(curlCommand)

    // Remove 'curl'
    if (args[0] === "curl") {
        args.shift()
    }

    let urlFound = false

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]

        if (arg.startsWith("-")) {
            switch (arg) {
                case "-X":
                case "--request":
                    if (i + 1 < args.length) {
                        result.method = args[++i].toUpperCase() as RequestMethod
                    }
                    break
                case "-H":
                case "--header":
                    if (i + 1 < args.length) {
                        const header = args[++i]
                        const colonIndex = header.indexOf(":")
                        if (colonIndex !== -1) {
                            const key = header.substring(0, colonIndex).trim()
                            const value = header.substring(colonIndex + 1).trim()
                            result.headers?.push({
                                id: crypto.randomUUID(),
                                key,
                                value,
                                active: true
                            })
                        }
                    }
                    break
                case "-d":
                case "--data":
                case "--data-raw":
                case "--data-binary":
                case "--data-ascii":
                    if (i + 1 < args.length) {
                        const data = args[++i]
                        // If we already have body content, append it (curl concatenates multiple -d)
                        if (result.body?.type !== "none" && result.body?.content) {
                            result.body.content += "&" + data
                        } else {
                            // Try to detect JSON
                            try {
                                JSON.parse(data)
                                result.body = { type: "json", content: data }
                            } catch {
                                result.body = { type: "text", content: data }
                            }
                        }

                        if (result.method === "GET") {
                            result.method = "POST"
                        }
                    }
                    break
                case "-u":
                case "--user":
                    if (i + 1 < args.length) {
                        const credentials = args[++i]
                        const [username, password] = credentials.split(":")
                        result.auth = {
                            type: "basic",
                            username,
                            password: password || ""
                        }
                    }
                    break
                default:
                    // Ignore unknown flags or flags without arguments for now
                    // If it looks like a URL and we haven't found one, maybe it is?
                    // But usually flags start with -
                    break
            }
        } else if (!urlFound) {
            // Assume it's the URL
            let url = arg
            // Remove quotes if present (tokenizer handles this, but just in case)
            if ((url.startsWith("'") && url.endsWith("'")) || (url.startsWith('"') && url.endsWith('"'))) {
                url = url.substring(1, url.length - 1)
            }

            if (url.includes("://") || url.includes("localhost")) {
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
                urlFound = true
            }
        }
    }

    // Check for Bearer token in headers
    const authHeader = result.headers?.find(h => h.key.toLowerCase() === "authorization")
    if (authHeader && authHeader.value.startsWith("Bearer ")) {
        result.auth = {
            type: "bearer",
            token: authHeader.value.replace("Bearer ", ""),
        }
        result.headers = result.headers?.filter(h => h.id !== authHeader.id)
    }

    return result
}

function tokenize(str: string): string[] {
    const tokens: string[] = []
    let currentToken = ""
    let inSingleQuote = false
    let inDoubleQuote = false
    let escaped = false

    for (let i = 0; i < str.length; i++) {
        const char = str[i]

        if (escaped) {
            currentToken += char
            escaped = false
            continue
        }

        if (char === "\\") {
            // If inside single quotes, backslash is literal unless it escapes a single quote (shell dependent, but common)
            // Actually in strong single quotes '...', backslash is literal.
            // But let's handle common cases.
            if (inSingleQuote) {
                currentToken += char
            } else {
                escaped = true
            }
            continue
        }

        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            continue
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            continue
        }

        if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
            if (currentToken.length > 0) {
                tokens.push(currentToken)
                currentToken = ""
            }
        } else {
            currentToken += char
        }
    }

    if (currentToken.length > 0) {
        tokens.push(currentToken)
    }

    return tokens
}
