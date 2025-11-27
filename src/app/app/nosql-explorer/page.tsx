"use client";

import { useState, useEffect } from "react";
import { ConnectionForm } from "@/components/nosql-explorer/connection-form";
import { ExplorerSidebar } from "@/components/nosql-explorer/explorer-sidebar";
import { DocumentView } from "@/components/nosql-explorer/document-view";
import { ConnectionState } from "@/components/nosql-explorer/types";
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

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);

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
            throw error; // Re-throw to let caller know it failed
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
        setPage(1);
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
                documents: [],
            }));
        } catch (error: any) {
            setState((prev) => ({ ...prev, loading: false }));
            toast.error("Failed to fetch collections");
        }
    };

    const handleSelectCollection = async (collectionName: string) => {
        setState((prev) => ({ ...prev, selectedCollection: collectionName, loading: true }));
        setPage(1); // Reset page on new collection
        await fetchDocuments(state.selectedDb!, collectionName, 1, limit);
    };

    const fetchDocuments = async (dbName: string, collectionName: string, pageNum: number, limitNum: number, query = "{}") => {
        try {
            const skip = (pageNum - 1) * limitNum;
            const res = await fetch(
                `/api/nosql/documents?connectionString=${encodeURIComponent(
                    state.connectionString
                )}&dbName=${dbName}&collectionName=${collectionName}&query=${encodeURIComponent(query)}&limit=${limitNum}&skip=${skip}`
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setState((prev) => ({
                ...prev,
                documents: data.documents,
                total: data.total,
                loading: false,
            }));
            // Ideally we should get total count from API too, but let's assume we have it or need to fetch it
            // The API returns { documents, total }
            // Let's update state to include total if we add it to types
            // For now let's assume total is returned and we can store it in documents length or separate state
            // Wait, state.documents is just array. We need total count for pagination.
            // Let's check API response again. It returns { documents, total }.
            // We need to add total to state or separate state.
            // Let's add total to state.
        } catch (error: any) {
            setState((prev) => ({ ...prev, loading: false }));
            toast.error("Failed to fetch documents");
        }
    };

    const handleRefresh = () => {
        if (state.selectedCollection && state.selectedDb) {
            fetchDocuments(state.selectedDb, state.selectedCollection, page, limit);
        } else if (state.isConnected) {
            // Refresh databases
            handleConnect(state.connectionString);
        }
    };

    const handleInsert = async (doc: any) => {
        try {
            const res = await fetch("/api/nosql/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: state.connectionString,
                    dbName: state.selectedDb,
                    collectionName: state.selectedCollection,
                    document: doc,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const handleUpdate = async (id: string, update: any) => {
        try {
            const res = await fetch("/api/nosql/documents", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: state.connectionString,
                    dbName: state.selectedDb,
                    collectionName: state.selectedCollection,
                    documentId: id,
                    update,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            const res = await fetch("/api/nosql/documents", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionString: state.connectionString,
                    dbName: state.selectedDb,
                    collectionName: state.selectedCollection,
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
        if (state.selectedDb && state.selectedCollection) {
            setState((prev) => ({ ...prev, loading: true }));
            setPage(1);
            fetchDocuments(state.selectedDb, state.selectedCollection, 1, limit, query);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (state.selectedDb && state.selectedCollection) {
            setState((prev) => ({ ...prev, loading: true }));
            fetchDocuments(state.selectedDb, state.selectedCollection, newPage, limit);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
        if (state.selectedDb && state.selectedCollection) {
            setState((prev) => ({ ...prev, loading: true }));
            fetchDocuments(state.selectedDb, state.selectedCollection, 1, newLimit);
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
                selectedCollection={state.selectedCollection}
                onSelectDb={handleSelectDb}
                onSelectCollection={handleSelectCollection}
                onRefresh={handleRefresh}
                onDisconnect={handleDisconnect}
            />
            <div className="flex-1 overflow-hidden bg-background">
                {state.selectedCollection ? (
                    <DocumentView
                        documents={state.documents}
                        total={state.total || 0}
                        page={page}
                        limit={limit}
                        loading={state.loading}
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
    );
}
