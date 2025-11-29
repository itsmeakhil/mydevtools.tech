"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconDatabase, IconTrash, IconHistory, IconPencil, IconPlugConnected, IconCheck, IconX } from "@tabler/icons-react";
import { SavedConnection } from "./types";
import { getConnections, deleteConnection, saveConnection, updateConnectionDetails } from "./connection-service";
import useAuth from "@/utils/useAuth";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ConnectionFormProps {
    onConnect: (connectionString: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export function ConnectionForm({ onConnect, loading, error }: ConnectionFormProps) {
    const [connectionString, setConnectionString] = useState("");
    const [name, setName] = useState("My Connection");
    const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
    const { user } = useAuth();
    const [isLoadingConnections, setIsLoadingConnections] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadConnections();
        }
    }, [user]);

    const loadConnections = async () => {
        if (!user) return;
        setIsLoadingConnections(true);
        try {
            const connections = await getConnections(user.uid);
            setSavedConnections(connections);
        } catch (error) {
            console.error("Failed to load connections", error);
        } finally {
            setIsLoadingConnections(false);
        }
    };

    const handleTestConnection = async () => {
        if (!connectionString) return;
        setIsTesting(true);
        try {
            const res = await fetch("/api/nosql/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionString }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Connection successful!");
        } catch (error: any) {
            toast.error(`Connection failed: ${error.message}`);
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (connectionString) {
            if (user) {
                try {
                    if (editingId) {
                        await updateConnectionDetails(user.uid, editingId, { name, connectionString });
                        toast.success("Connection updated");
                    } else {
                        await saveConnection(user.uid, connectionString, name);
                    }
                    loadConnections();
                } catch (e) {
                    console.error("Failed to save connection", e);
                }
            }
            // If we are editing, maybe we don't want to auto-connect? 
            // But usually user wants to use it.
            // Let's reset edit state
            setEditingId(null);
            await onConnect(connectionString);
        }
    };

    const handleSelectConnection = (conn: SavedConnection) => {
        setConnectionString(conn.connectionString);
        setName(conn.name);
        setEditingId(null); // Selecting just fills for new connection by default, or should it switch to edit?
        // Let's keep it as "fill to use/copy" but not edit mode unless explicitly clicked edit.
    };

    const handleEditConnection = (e: React.MouseEvent, conn: SavedConnection) => {
        e.stopPropagation();
        setEditingId(conn.id);
        setConnectionString(conn.connectionString);
        setName(conn.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setConnectionString("");
        setName("My Connection");
    };

    const handleDeleteConnection = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!user) return;
        if (!confirm("Are you sure you want to delete this saved connection?")) return;

        try {
            await deleteConnection(user.uid, id);
            toast.success("Connection deleted");
            if (editingId === id) handleCancelEdit();
            loadConnections();
        } catch (error) {
            toast.error("Failed to delete connection");
        }
    };

    return (
        <div className="flex items-start justify-center h-full p-4 gap-8">
            <div className="w-full max-w-md space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <IconDatabase className="w-5 h-5" />
                        {editingId ? "Edit Connection" : "Connect to MongoDB"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {editingId ? "Update your connection details." : "Enter your MongoDB connection string to start exploring your data."}
                    </p>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="connection-name">Name</Label>
                                <Input
                                    id="connection-name"
                                    placeholder="My Production DB"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="connection-string">Connection String</Label>
                                <Input
                                    id="connection-string"
                                    placeholder="mongodb://localhost:27017"
                                    value={connectionString}
                                    onChange={(e) => setConnectionString(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            {error && (
                                <div className="text-sm text-red-500 font-medium">
                                    {error}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={handleTestConnection}
                                    disabled={loading || isTesting || !connectionString}
                                >
                                    {isTesting ? <IconHistory className="w-4 h-4 animate-spin mr-2" /> : <IconPlugConnected className="w-4 h-4 mr-2" />}
                                    Test
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading || !connectionString}>
                                    {loading ? "Connecting..." : (editingId ? "Update & Connect" : "Connect")}
                                </Button>
                            </div>
                            {editingId && (
                                <Button type="button" variant="ghost" className="w-full" onClick={handleCancelEdit}>
                                    Cancel Edit
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>

            {user && savedConnections.length > 0 && (
                <div className="w-full max-w-sm h-[500px] flex flex-col space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <IconHistory className="w-5 h-5" />
                        Saved Connections
                    </div>
                    <Card className="flex-1 flex flex-col border-0 shadow-none bg-transparent">
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-3">
                                    {savedConnections.map((conn) => (
                                        <div
                                            key={conn.id}
                                            className={`flex items-start justify-between p-4 border rounded-lg hover:bg-muted/40 cursor-pointer group transition-all ${editingId === conn.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card shadow-sm hover:shadow-md hover:border-primary/20"}`}
                                            onClick={() => handleSelectConnection(conn)}
                                        >
                                            <div className="flex-1 overflow-hidden space-y-1">
                                                <div className="font-semibold text-sm truncate">{conn.name}</div>
                                                <div className="text-xs text-muted-foreground truncate font-mono bg-muted/50 p-1 rounded w-fit max-w-full">{conn.connectionString}</div>
                                                <div className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                                                    <IconHistory className="w-3 h-3" />
                                                    Last used {formatDistanceToNow(conn.lastUsedAt?.toDate ? conn.lastUsedAt.toDate() : new Date())} ago
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:bg-background hover:text-foreground"
                                                    onClick={(e) => handleEditConnection(e, conn)}
                                                >
                                                    <IconPencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => handleDeleteConnection(e, conn.id)}
                                                >
                                                    <IconTrash className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            )
            }
        </div >
    );
}
