"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { RequestPanel } from "./request-panel"
import { RequestTabs } from "./request-tabs"
import { ResponsePanel } from "./response-panel"
import { TabBar } from "./tab-bar"
import {
    RequestMethod,
    KeyValueItem,
    RequestBody,
    RequestAuth,
    ApiResponse,
    ApiRequestState,
} from "./types"
import { toast } from "sonner"

const createNewTab = (): ApiRequestState => ({
    id: crypto.randomUUID(),
    name: "New Request",
    method: "GET",
    url: "",
    params: [{ id: "1", key: "", value: "", active: true }],
    headers: [{ id: "1", key: "", value: "", active: true }],
    body: { type: "none", content: "" },
    auth: { type: "none" },
    response: null,
    isLoading: false,
})

export function ApiClient() {
    const [tabs, setTabs] = React.useState<ApiRequestState[]>([createNewTab()])
    const [activeTabId, setActiveTabId] = React.useState<string>(tabs[0].id)

    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

    const updateActiveTab = (updates: Partial<ApiRequestState>) => {
        setTabs((prev) =>
            prev.map((tab) =>
                tab.id === activeTabId ? { ...tab, ...updates } : tab
            )
        )
    }

    const handleAddTab = () => {
        const newTab = createNewTab()
        setTabs((prev) => [...prev, newTab])
        setActiveTabId(newTab.id)
    }

    const handleCloseTab = (id: string) => {
        if (tabs.length === 1) {
            // Don't close the last tab, just reset it
            setTabs([createNewTab()])
            return
        }

        const newTabs = tabs.filter((t) => t.id !== id)
        setTabs(newTabs)

        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id)
        }
    }

    const handleSend = async () => {
        if (!activeTab.url) return

        updateActiveTab({ isLoading: true, response: null })
        const startTime = performance.now()

        try {
            // Construct URL with params
            const urlObj = new URL(activeTab.url)
            activeTab.params.forEach((p) => {
                if (p.active && p.key) {
                    urlObj.searchParams.append(p.key, p.value)
                }
            })

            // Construct headers
            const headersObj: Record<string, string> = {}
            activeTab.headers.forEach((h) => {
                if (h.active && h.key) {
                    headersObj[h.key] = h.value
                }
            })

            // Add Auth
            if (activeTab.auth.type === "bearer" && activeTab.auth.token) {
                headersObj["Authorization"] = `Bearer ${activeTab.auth.token}`
            } else if (activeTab.auth.type === "basic" && activeTab.auth.username && activeTab.auth.password) {
                const credentials = btoa(`${activeTab.auth.username}:${activeTab.auth.password}`)
                headersObj["Authorization"] = `Basic ${credentials}`
            }

            // Prepare body
            let bodyContent: BodyInit | null = null
            if (activeTab.method !== "GET" && activeTab.method !== "HEAD" && activeTab.body.type !== "none") {
                if (activeTab.body.type === "json") {
                    try {
                        // Validate JSON
                        JSON.parse(activeTab.body.content)
                        bodyContent = activeTab.body.content
                        headersObj["Content-Type"] = "application/json"
                    } catch (e) {
                        toast.error("Invalid JSON body")
                        updateActiveTab({ isLoading: false })
                        return
                    }
                } else {
                    bodyContent = activeTab.body.content
                    if (!headersObj["Content-Type"]) {
                        headersObj["Content-Type"] = "text/plain"
                    }
                }
            }

            const res = await fetch(urlObj.toString(), {
                method: activeTab.method,
                headers: headersObj,
                body: bodyContent,
            })

            const endTime = performance.now()
            const time = Math.round(endTime - startTime)
            const size = Number(res.headers.get("content-length")) || 0

            const responseHeaders: Record<string, string> = {}
            res.headers.forEach((value, key) => {
                responseHeaders[key] = value
            })

            const text = await res.text()
            let formattedBody = text
            try {
                formattedBody = JSON.stringify(JSON.parse(text), null, 2)
            } catch {
                // Not JSON, keep as text
            }

            updateActiveTab({
                response: {
                    status: res.status,
                    statusText: res.statusText,
                    headers: responseHeaders,
                    body: formattedBody,
                    time,
                    size: size || text.length,
                },
                isLoading: false,
            })
        } catch (error) {
            console.error(error)
            toast.error("Request failed: " + (error as Error).message)
            updateActiveTab({
                response: {
                    status: 0,
                    statusText: "Error",
                    headers: {},
                    body: (error as Error).message,
                    time: 0,
                    size: 0,
                    error: (error as Error).message,
                },
                isLoading: false,
            })
        }
    }

    return (
        <div className="grid gap-6">
            <Card className="overflow-hidden">
                <TabBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabChange={setActiveTabId}
                    onTabClose={handleCloseTab}
                    onTabAdd={handleAddTab}
                />
                <div className="p-6 space-y-6">
                    <RequestPanel
                        method={activeTab.method}
                        setMethod={(method) => updateActiveTab({ method })}
                        url={activeTab.url}
                        setUrl={(url) => updateActiveTab({ url, name: url || "New Request" })}
                        onSend={handleSend}
                        isLoading={activeTab.isLoading}
                    />
                    <RequestTabs
                        params={activeTab.params}
                        setParams={(params) => updateActiveTab({ params })}
                        headers={activeTab.headers}
                        setHeaders={(headers) => updateActiveTab({ headers })}
                        body={activeTab.body}
                        setBody={(body) => updateActiveTab({ body })}
                        auth={activeTab.auth}
                        setAuth={(auth) => updateActiveTab({ auth })}
                    />
                </div>
            </Card>
            <ResponsePanel response={activeTab.response} />
        </div>
    )
}
