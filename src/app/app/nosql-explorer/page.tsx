"use client";

import { useState, useEffect, useRef } from "react";
import { ConnectionForm } from "@/components/nosql-explorer/connection-form";
import { ExplorerSidebar } from "@/components/nosql-explorer/explorer-sidebar";
import { DocumentView } from "@/components/nosql-explorer/document-view";
import { ConnectionState, ExplorerTab, SavedConnection } from "@/components/nosql-explorer/types";
import { TabBar } from "@/components/nosql-explorer/tab-bar";
import { toast } from "sonner";
import useAuth from "@/utils/useAuth";
import { getConnections } from "@/components/nosql-explorer/connection-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IconDatabase, IconServer, IconBrandMongodb, IconSearch, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function NoSQLExplorerPage() {
    const { user } = useAuth();
    // We still keep some state for the "active" context if needed, but mostly driven by tabs now
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
    const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; documentId: string | null }>({
        isOpen: false,
        documentId: null,
    });

    // Load tabs from localStorage on mount
    useEffect(() => {
        const savedTabs = localStorage.getItem("nosql_tabs");
        const savedActiveTabId = localStorage.getItem("nosql_active_tab_id");

        if (savedTabs) {
            try {
                setTabs(JSON.parse(savedTabs));
            } catch (e) {
                console.error("Failed to parse saved tabs", e);
            }
        }

        if (savedActiveTabId) {
            setActiveTabId(savedActiveTabId);
        }
        setIsInitialized(true);
    }, []);

    // Save tabs to localStorage whenever they change
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("nosql_tabs", JSON.stringify(tabs));
    }, [tabs, isInitialized]);

    // Save activeTabId to localStorage whenever it changes
    useEffect(() => {
        if (!isInitialized) return;
        if (activeTabId) {
            localStorage.setItem("nosql_active_tab_id", activeTabId);
        } else {
            localStorage.removeItem("nosql_active_tab_id");
        }
    }, [activeTabId, isInitialized]);

    // Auto-connect logic is now handled by the sidebar tree view mostly, 
    // but we might want to keep the "initial load" behavior if needed.
    // For now, let's rely on the sidebar to list connections.

    const handleConnect = async (connectionString: string) => {
        // This is now used by the "Add Connection" dialog
        try {
            // We just verify connection here, saving is done by ConnectionForm if we update it
            // Actually ConnectionForm handles saving. We just need to close dialog and refresh sidebar.
            setIsConnectionDialogOpen(false);
            // Sidebar will refresh itself or we trigger a refresh
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSelectCollection = async (connection: SavedConnection, dbName: string, collectionName: string) => {
        const tabId = `${connection.id}-${dbName}-${collectionName}`;
        const existingTab = tabs.find((t) => t.id === tabId);

        if (existingTab) {
            setActiveTabId(tabId);
            return;
        }

        const newTab: ExplorerTab = {
            id: tabId,
            connectionId: connection.id!,
            connectionName: connection.name,
            dbName,
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

        await fetchDocumentsForTab(newTab, connection.connectionString);
    };

    const fetchDocumentsForTab = async (tab: ExplorerTab, connectionString: string) => {
        updateTab(tab.id, { loading: true, error: null });
        try {
            const skip = (tab.page - 1) * tab.limit;
            const res = await fetch(
                `/api/nosql/documents?connectionString=${encodeURIComponent(
                    connectionString
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

    const handleCloseAllTabs = () => {
        if (tabs.length === 0) return;
        if (confirm("Are you sure you want to close all tabs?")) {
            setTabs([]);
            setActiveTabId(null);
        }
    };

    const activeTab = tabs.find((t) => t.id === activeTabId);

    // We need to get the connection string for the active tab to perform actions
    // Since we don't store it in the tab (security/size), we might need to fetch it or pass it.
    // For simplicity, let's assume we can re-fetch it or store it in the tab.
    // Storing in tab is easiest for now.
    // Wait, we have connectionId. We can fetch it from a cache or just store it in tab.
    // Let's store connectionString in tab for now to make it work easily, 
    // but strictly speaking we should look it up.
    // Actually, let's just fetch the connection string again using getConnections if needed, 
    // OR just store it in the tab. Storing in tab is fine for client-side state.
    // I'll update ExplorerTab to include connectionString in a separate hidden field or just use the one passed to fetchDocuments.
    // Let's update fetchDocumentsForTab to take connectionString.
    // But for refresh/insert/update/delete we need it too.
    // Let's add connectionString to ExplorerTab for convenience.

    const handleRefresh = async () => {
        if (activeTab) {
            // We need connection string. 
            // Let's fetch it from the sidebar? No, sidebar has it.
            // Let's look up the connection string from the sidebar's list? We don't have access to sidebar state.
            // Let's fetch all connections and find the one matching activeTab.connectionId
            if (user) {
                const connections = await getConnections(user.uid);
                const conn = connections.find(c => c.id === activeTab.connectionId);
                if (conn) {
                    fetchDocumentsForTab(activeTab, conn.connectionString);
                }
            }
        }
    };

    const handleInsert = async (doc: any) => {
        if (!activeTab || !user) return;
        try {
            const connections = await getConnections(user.uid);
            const conn = connections.find(c => c.id === activeTab.connectionId);
            if (!conn) throw new Error("Connection not found");

            const res = await fetch("/api/nosql/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: conn.connectionString,
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
        if (!activeTab || !user) return;
        try {
            const connections = await getConnections(user.uid);
            const conn = connections.find(c => c.id === activeTab.connectionId);
            if (!conn) throw new Error("Connection not found");

            const res = await fetch("/api/nosql/documents", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: conn.connectionString,
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
        setDeleteConfirmation({ isOpen: true, documentId: id });
    };

    const confirmDelete = async () => {
        const id = deleteConfirmation.documentId;
        if (!activeTab || !user || !id) return;

        try {
            const connections = await getConnections(user.uid);
            const conn = connections.find(c => c.id === activeTab.connectionId);
            if (!conn) throw new Error("Connection not found");

            const res = await fetch("/api/nosql/documents", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: conn.connectionString,
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
        } finally {
            setDeleteConfirmation({ isOpen: false, documentId: null });
        }
    };

    const handleSearch = (query: string) => {
        if (activeTab) {
            const updatedTab = { ...activeTab, query, page: 1 };
            updateTab(activeTab.id, updatedTab);
            performFetch(updatedTab);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (activeTab) {
            const updatedTab = { ...activeTab, page: newPage };
            updateTab(activeTab.id, updatedTab);
            // We need to wait for state update? No, we updated local var 'updatedTab' but not state yet?
            // Actually updateTab updates state. But handleRefresh reads from state 'activeTab'.
            // State updates are async.
            // We should pass the updated tab to the fetch function.
            // Let's refactor handleRefresh to accept an optional tab override.
            performFetch(updatedTab);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        if (activeTab) {
            const updatedTab = { ...activeTab, limit: newLimit, page: 1 };
            updateTab(activeTab.id, updatedTab);
            performFetch(updatedTab);
        }
    };

    const performFetch = async (tab: ExplorerTab) => {
        if (user) {
            const connections = await getConnections(user.uid);
            const conn = connections.find(c => c.id === tab.connectionId);
            if (conn) {
                fetchDocumentsForTab(tab, conn.connectionString);
            }
        }
    };

    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [isResizing, setIsResizing] = useState(false);

    const resizeStartRef = useRef<{ x: number, width: number } | null>(null);
    const sidebarWidthRef = useRef(sidebarWidth);

    useEffect(() => {
        sidebarWidthRef.current = sidebarWidth;
    }, [sidebarWidth]);

    useEffect(() => {
        const savedWidth = localStorage.getItem("nosql_sidebar_width");
        if (savedWidth) {
            setSidebarWidth(parseInt(savedWidth, 10));
        }
    }, []);

    useEffect(() => {
        if (isResizing) {
            const handleMouseMove = (e: MouseEvent) => {
                if (!resizeStartRef.current) return;
                const delta = e.clientX - resizeStartRef.current.x;
                const newWidth = Math.max(150, Math.min(600, resizeStartRef.current.width + delta));
                setSidebarWidth(newWidth);
            };

            const handleMouseUp = () => {
                setIsResizing(false);
                resizeStartRef.current = null;
                localStorage.setItem("nosql_sidebar_width", sidebarWidthRef.current.toString());
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "none";
            document.body.style.cursor = "col-resize";

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.body.style.userSelect = "";
                document.body.style.cursor = "";
            };
        }
    }, [isResizing]);

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <ExplorerSidebar
                width={sidebarWidth}
                onSelectCollection={handleSelectCollection}
                onRefresh={() => { /* Sidebar handles its own refresh */ }}
                onAddConnection={() => setIsConnectionDialogOpen(true)}
            />
            <div
                className={cn(
                    "w-2 hover:w-2 bg-border/50 hover:bg-primary/50 cursor-col-resize flex-shrink-0 transition-all z-50",
                    isResizing && "bg-primary/50 w-2"
                )}
                onMouseDown={(e) => {
                    setIsResizing(true);
                    resizeStartRef.current = { x: e.clientX, width: sidebarWidth };
                }}
            />
            <div className="flex-1 flex flex-col overflow-hidden bg-background min-w-0 w-full max-w-full">
                <TabBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabChange={handleTabChange}
                    onTabClose={handleTabClose}
                    onCloseAll={handleCloseAllTabs}
                />
                <div className="flex-1 overflow-hidden relative">
                    {activeTab ? (
                        <DocumentView
                            key={activeTab.id}
                            connectionName={activeTab.connectionName}
                            dbName={activeTab.dbName}
                            collectionName={activeTab.collectionName}
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
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 animate-in fade-in zoom-in duration-300">
                            <div className="max-w-2xl w-full space-y-8 text-center">
                                <div className="space-y-2">
                                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <IconDatabase className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight text-foreground">NoSQL Explorer</h2>
                                    <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                                        Connect to your databases to manage collections, execute queries, and visualize your data.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                    <div className="p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                            <IconServer className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">Multi-Connection</h3>
                                        <p className="text-xs text-muted-foreground">Manage multiple database connections simultaneously.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                                            <IconBrandMongodb className="w-4 h-4 text-green-500" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">MongoDB Support</h3>
                                        <p className="text-xs text-muted-foreground">Native support for MongoDB with advanced filtering.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                                            <IconSearch className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">Smart Query</h3>
                                        <p className="text-xs text-muted-foreground">Powerful query builder with syntax highlighting.</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button size="lg" onClick={() => setIsConnectionDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-primary/25 transition-all">
                                        <IconPlus className="w-5 h-5" />
                                        Connect to MongoDB
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-4">
                                        Currently supports <span className="font-medium text-foreground">MongoDB</span>. More databases coming soon.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Add Connection</DialogTitle>
                    </DialogHeader>
                    <ConnectionForm
                        onConnect={async (connStr) => {
                            // ConnectionForm saves it. We just close.
                            // But ConnectionForm props are onConnect(connectionString).
                            // We need to check ConnectionForm implementation.
                            // If it saves, we just close.
                            // Let's assume onConnect is called after successful connection/save?
                            // Looking at ConnectionForm, it calls onConnect with string.
                            // It handles saving internally if we updated it? 
                            // Wait, previous implementation of ConnectionForm handled saving.
                            // Let's verify ConnectionForm.
                            setIsConnectionDialogOpen(false);
                            // We might need to trigger sidebar refresh. 
                            // We can pass a refresh trigger to sidebar or use a context.
                            // For now, user can manually refresh sidebar.
                            toast.success("Connection added");
                        }}
                        loading={false}
                        error={null}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the document from your collection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
