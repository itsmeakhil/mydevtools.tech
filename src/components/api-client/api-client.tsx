"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { RequestPanel } from "./request-panel"
import { RequestTabs } from "./request-tabs"
import { ResponsePanel } from "./response-panel"
import { TabBar } from "./tab-bar"
import { ImportCurlDialog } from "./import-curl-dialog"
import { parseCurlCommand } from "@/utils/curl-parser"
import { CollectionsSidebar } from "./collections/collections-sidebar"
import { useCollections } from "./collections/use-collections"
import { SaveRequestDialog } from "./collections/save-request-dialog"
import { useEnvironments } from "./use-environments"
import { EnvironmentManager } from "./environment-manager"
import { CodeGenerator } from "./code-generator"
import {
    RequestMethod,
    KeyValueItem,
    RequestBody,
    RequestAuth,
    ApiResponse,
    ApiRequestState,
    CollectionRequest,
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

const TABS_STORAGE_KEY = "api-client-tabs"
const ACTIVE_TAB_STORAGE_KEY = "api-client-active-tab"

export function ApiClient() {
    const [tabs, setTabs] = React.useState<ApiRequestState[]>([createNewTab()])
    const [activeTabId, setActiveTabId] = React.useState<string>(tabs[0].id)
    const [isInitialized, setIsInitialized] = React.useState(false)
    const { collections, addFolder, deleteItem, saveRequest, toggleFolder, createCollection, renameCollection } = useCollections()
    const {
        environments,
        activeEnvId,
        setActiveEnvId,
        addEnvironment,
        updateEnvironment,
        deleteEnvironment,
        substituteVariables
    } = useEnvironments()

    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

    // Load state from localStorage
    React.useEffect(() => {
        const storedTabs = localStorage.getItem(TABS_STORAGE_KEY)
        const storedActiveTabId = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY)

        if (storedTabs) {
            try {
                const parsedTabs = JSON.parse(storedTabs)
                if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
                    setTabs(parsedTabs)
                    if (storedActiveTabId) {
                        setActiveTabId(storedActiveTabId)
                    } else {
                        setActiveTabId(parsedTabs[0].id)
                    }
                }
            } catch (e) {
                console.error("Failed to parse stored tabs", e)
            }
        }
        setIsInitialized(true)
    }, [])

    // Save state to localStorage
    React.useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs))
    }, [tabs, isInitialized])

    React.useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId)
    }, [activeTabId, isInitialized])

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

    const handleImportCurl = (curl: string) => {
        try {
            const parsed = parseCurlCommand(curl)
            const newTab: ApiRequestState = {
                ...createNewTab(),
                ...parsed,
                name: parsed.url || "Imported Request",
                id: crypto.randomUUID(),
            }
            setTabs((prev) => [...prev, newTab])
            setActiveTabId(newTab.id)
            toast.success("cURL imported successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to parse cURL command")
        }
    }

    const handleSaveRequest = (parentId: string, name: string) => {
        const requestToSave: CollectionRequest = {
            id: crypto.randomUUID(),
            name,
            method: activeTab.method,
            url: activeTab.url,
            params: activeTab.params,
            headers: activeTab.headers,
            body: activeTab.body,
            auth: activeTab.auth,
        }
        saveRequest(parentId, requestToSave)
        updateActiveTab({ name })
    }

    const handleLoadRequest = (request: CollectionRequest) => {
        const newTab: ApiRequestState = {
            ...createNewTab(),
            ...request,
            id: crypto.randomUUID(), // New ID for the tab instance
            response: null,
            isLoading: false,
        }
        setTabs((prev) => [...prev, newTab])
        setActiveTabId(newTab.id)
    }

    const handleSend = async () => {
        if (!activeTab.url) return

        updateActiveTab({ isLoading: true, response: null })
        const startTime = performance.now()

        try {
            // Substitute variables in URL
            const finalUrl = substituteVariables(activeTab.url)

            // Construct URL with params
            const urlObj = new URL(finalUrl)
            activeTab.params.forEach((p) => {
                if (p.active && p.key) {
                    urlObj.searchParams.append(substituteVariables(p.key), substituteVariables(p.value))
                }
            })

            // Construct headers
            const headersObj: Record<string, string> = {}
            activeTab.headers.forEach((h) => {
                if (h.active && h.key) {
                    headersObj[substituteVariables(h.key)] = substituteVariables(h.value)
                }
            })

            // Add Auth
            if (activeTab.auth.type === "bearer" && activeTab.auth.token) {
                headersObj["Authorization"] = `Bearer ${substituteVariables(activeTab.auth.token)}`
            } else if (activeTab.auth.type === "basic" && activeTab.auth.username && activeTab.auth.password) {
                const credentials = btoa(`${substituteVariables(activeTab.auth.username)}:${substituteVariables(activeTab.auth.password)}`)
                headersObj["Authorization"] = `Basic ${credentials}`
            }

            // Prepare body
            let bodyContent: BodyInit | null = null
            if (activeTab.method !== "GET" && activeTab.method !== "HEAD" && activeTab.body.type !== "none") {
                if (activeTab.body.type === "json") {
                    try {
                        const substitutedBody = substituteVariables(activeTab.body.content)
                        // Validate JSON
                        JSON.parse(substitutedBody)
                        bodyContent = substitutedBody
                        headersObj["Content-Type"] = "application/json"
                    } catch (e) {
                        toast.error("Invalid JSON body")
                        updateActiveTab({ isLoading: false })
                        return
                    }
                } else {
                    bodyContent = substituteVariables(activeTab.body.content)
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
        <div className="flex h-[calc(100vh-4rem)] gap-4">
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                <div className="flex justify-end gap-2">
                    <EnvironmentManager
                        environments={environments}
                        activeEnvId={activeEnvId}
                        setActiveEnvId={setActiveEnvId}
                        addEnvironment={addEnvironment}
                        updateEnvironment={updateEnvironment}
                        deleteEnvironment={deleteEnvironment}
                    />
                    <CodeGenerator request={activeTab} />
                    <SaveRequestDialog
                        collections={collections}
                        onSave={handleSaveRequest}
                        defaultName={activeTab.name !== "New Request" ? activeTab.name : ""}
                    />
                    <ImportCurlDialog onImport={handleImportCurl} />
                </div>
                <Card className="overflow-hidden flex-1 flex flex-col">
                    <TabBar
                        tabs={tabs}
                        activeTabId={activeTabId}
                        onTabChange={setActiveTabId}
                        onTabClose={handleCloseTab}
                        onTabAdd={handleAddTab}
                    />
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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
                        <ResponsePanel response={activeTab.response} />
                    </div>
                </Card>
            </div>
            <CollectionsSidebar
                collections={collections}
                onAddFolder={addFolder}
                onDelete={deleteItem}
                onToggle={toggleFolder}
                onLoadRequest={handleLoadRequest}
                onCreateCollection={createCollection}
                onRenameCollection={renameCollection}
            />
        </div>
    )
}
