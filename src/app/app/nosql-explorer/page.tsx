"use client";

import { useState, useEffect } from "react";
import { ConnectionForm } from "@/components/nosql-explorer/connection-form";
import { ExplorerSidebar } from "@/components/nosql-explorer/explorer-sidebar";
import { DocumentView } from "@/components/nosql-explorer/document-view";
import { ConnectionState, ExplorerTab } from "@/components/nosql-explorer/types";
import { TabBar } from "@/components/nosql-explorer/tab-bar";
import { toast } from "sonner";
import useAuth from "@/utils/useAuth";
import { getConnections } from "@/components/nosql-explorer/connection-service";

export default function NoSQLExplorerPage() {
    const { user } = useAuth();
    const [state, setState] = useState<ConnectionState>({
        isConnected: false,
        connectionString: "",
        databases: [],
        selectedDb: null,
        collections: [],
        selectedCollection: null,
        documents: [],
        total: 0,
        loading: false,
        error: null,
    });

    const [tabs, setTabs] = useState<ExplorerTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Auto-connect logic
    useEffect(() => {
        const autoConnect = async () => {
            if (user && !state.isConnected) {
                try {
                    const connections = await getConnections(user.uid);
                    if (connections.length > 0) {
                        const lastConnection = connections[0];
                        toast.info(`Auto-connecting to ${lastConnection.name || "last session"}...`);
                        await handleConnect(lastConnection.connectionString);
                    }
                } catch (e) {
                    console.error("Auto-connect failed", e);
                }
            }
        };

        // Only run once when user loads
        if (user && !state.isConnected && !state.loading) {
            autoConnect();
        }
    }, [user]);

    const handleConnect = async (connectionString: string) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const res = await fetch("/api/nosql/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionString }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setState((prev) => ({
                ...prev,
                isConnected: true,
                connectionString,
                databases: data.databases,
                loading: false,
            }));
            toast.success("Connected to MongoDB");
        } catch (error: any) {
            setState((prev) => ({ ...prev, loading: false, error: error.message }));
            toast.error(error.message);
            throw error;
        }
    };

    const handleDisconnect = () => {
        setState({
            isConnected: false,
            connectionString: "",
            databases: [],
            selectedDb: null,
            collections: [],
            selectedCollection: null,
            documents: [],
            loading: false,
            error: null,
        });
        setTabs([]);
        setActiveTabId(null);
    };

    const handleSelectDb = async (dbName: string) => {
        setState((prev) => ({ ...prev, selectedDb: dbName, loading: true }));
        try {
            const res = await fetch(
                `/api/nosql/collections?connectionString=${encodeURIComponent(
                    state.connectionString
                )}&dbName=${dbName}`
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setState((prev) => ({
                ...prev,
                collections: data.collections,
                loading: false,
                selectedCollection: null,
            }));
        } catch (error: any) {
            setState((prev) => ({ ...prev, loading: false }));
            toast.error("Failed to fetch collections");
        }
    };

    const handleSelectCollection = async (collectionName: string) => {
        if (!state.selectedDb) return;

        const tabId = `${state.selectedDb}-${collectionName}`;
        const existingTab = tabs.find((t) => t.id === tabId);

        if (existingTab) {
            setActiveTabId(tabId);
            return;
        }

        const newTab: ExplorerTab = {
            id: tabId,
            dbName: state.selectedDb,
            collectionName,
            documents: [],
            total: 0,
            page: 1,
            limit: 50,
            query: "{}",
            loading: true,
            error: null,
        };

        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(tabId);

        await fetchDocumentsForTab(newTab);
    };

    const fetchDocumentsForTab = async (tab: ExplorerTab) => {
        updateTab(tab.id, { loading: true, error: null });
        try {
            const skip = (tab.page - 1) * tab.limit;
            const res = await fetch(
                `/api/nosql/documents?connectionString=${encodeURIComponent(
                    state.connectionString
                )}&dbName=${tab.dbName}&collectionName=${tab.collectionName}&query=${encodeURIComponent(tab.query)}&limit=${tab.limit}&skip=${skip}`
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            updateTab(tab.id, {
                documents: data.documents,
                total: data.total,
                loading: false,
            });
        } catch (error: any) {
            updateTab(tab.id, { loading: false, error: error.message });
            toast.error(`Failed to fetch documents for ${tab.collectionName}`);
        }
    };

    const updateTab = (tabId: string, updates: Partial<ExplorerTab>) => {
        setTabs((prev) =>
            prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
        );
    };

    const handleTabChange = (tabId: string) => {
        setActiveTabId(tabId);
    };

    const handleTabClose = (tabId: string) => {
        setTabs((prev) => prev.filter((t) => t.id !== tabId));
        if (activeTabId === tabId) {
            const index = tabs.findIndex((t) => t.id === tabId);
            const newActiveTab = tabs[index - 1] || tabs[index + 1];
            setActiveTabId(newActiveTab ? newActiveTab.id : null);
        }
    };

    const activeTab = tabs.find((t) => t.id === activeTabId);

    const handleRefresh = () => {
        if (activeTab) {
            fetchDocumentsForTab(activeTab);
        } else if (state.isConnected) {
            handleConnect(state.connectionString);
        }
    };

    const handleInsert = async (doc: any) => {
        if (!activeTab) return;
        try {
            const res = await fetch("/api/nosql/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: state.connectionString,
                    dbName: activeTab.dbName,
                    collectionName: activeTab.collectionName,
                    document: doc,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            handleRefresh();
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const handleUpdate = async (id: string, update: any) => {
        if (!activeTab) return;
        try {
            const res = await fetch("/api/nosql/documents", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: state.connectionString,
                    dbName: activeTab.dbName,
                    collectionName: activeTab.collectionName,
                    documentId: id,
                    update,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            handleRefresh();
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!activeTab) return;
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            const res = await fetch("/api/nosql/documents", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: state.connectionString,
                    dbName: activeTab.dbName,
                    collectionName: activeTab.collectionName,
                    documentId: id,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Document deleted");
            handleRefresh();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSearch = (query: string) => {
        if (activeTab) {
            const updatedTab = { ...activeTab, query, page: 1 };
            updateTab(activeTab.id, updatedTab);
            fetchDocumentsForTab(updatedTab);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (activeTab) {
            const updatedTab = { ...activeTab, page: newPage };
            updateTab(activeTab.id, updatedTab);
            fetchDocumentsForTab(updatedTab);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        if (activeTab) {
            const updatedTab = { ...activeTab, limit: newLimit, page: 1 };
            updateTab(activeTab.id, updatedTab);
            fetchDocumentsForTab(updatedTab);
        }
    };

    if (!state.isConnected) {
        return (
            <ConnectionForm
                onConnect={handleConnect}
                loading={state.loading}
                error={state.error}
            />
        );
    }

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <ExplorerSidebar
                databases={state.databases}
                selectedDb={state.selectedDb}
                collections={state.collections}
                selectedCollection={state.selectedDb === activeTab?.dbName ? activeTab?.collectionName : null}
                onSelectDb={handleSelectDb}
                onSelectCollection={handleSelectCollection}
                onRefresh={handleRefresh}
                onDisconnect={handleDisconnect}
            />
            <div className="flex-1 flex flex-col overflow-hidden bg-background min-w-0 w-full max-w-full">
                <TabBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabChange={handleTabChange}
                    onTabClose={handleTabClose}
                />
                <div className="flex-1 overflow-hidden relative">
                    {activeTab ? (
                        <DocumentView
                            key={activeTab.id} // Force re-render on tab switch to reset internal state if needed
                            documents={activeTab.documents}
                            total={activeTab.total}
                            page={activeTab.page}
                            limit={activeTab.limit}
                            loading={activeTab.loading}
                            onRefresh={handleRefresh}
                            onInsert={handleInsert}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onSearch={handleSearch}
                            onPageChange={handlePageChange}
                            onLimitChange={handleLimitChange}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Select a collection to view documents
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
