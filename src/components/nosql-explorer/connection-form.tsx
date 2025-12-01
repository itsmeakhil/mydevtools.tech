"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconDatabase, IconTrash, IconHistory, IconPencil, IconPlugConnected, IconCheck, IconX, IconBrandMongodb, IconServer } from "@tabler/icons-react";
import { SavedConnection } from "./types";
import { getConnections, deleteConnection, saveConnection, updateConnectionDetails } from "./connection-service";
import useAuth from "@/utils/useAuth";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
            setEditingId(null);
            await onConnect(connectionString);
        }
    };

    const handleSelectConnection = (conn: SavedConnection) => {
        setConnectionString(conn.connectionString);
        setName(conn.name);
        setEditingId(null);
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
        <div className="flex flex-col md:flex-row items-start justify-center h-full gap-6 p-1">
            <div className="w-full md:w-1/2 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <IconBrandMongodb className="w-8 h-8 text-green-500" />
                        {editingId ? "Edit Connection" : "Connect to MongoDB"}
                    </h2>
                    <p className="text-muted-foreground">
                        {editingId ? "Update your connection details below." : "Enter your MongoDB connection string to start exploring your data."}
                    </p>
                </div>

                <Card className="border-muted/50 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="connection-name" className="text-xs font-medium uppercase text-muted-foreground">Name</Label>
                                <Input
                                    id="connection-name"
                                    placeholder="e.g. Production DB"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="connection-string" className="text-xs font-medium uppercase text-muted-foreground">Connection String</Label>
                                <div className="relative">
                                    <Input
                                        id="connection-string"
                                        placeholder="mongodb://localhost:27017"
                                        value={connectionString}
                                        onChange={(e) => setConnectionString(e.target.value)}
                                        disabled={loading}
                                        className="bg-background/50 font-mono text-sm pl-9"
                                    />
                                    <IconDatabase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Format: mongodb://username:password@host:port/database
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
                                    <IconX className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleTestConnection}
                                    disabled={loading || isTesting || !connectionString}
                                >
                                    {isTesting ? <IconHistory className="w-4 h-4 animate-spin mr-2" /> : <IconPlugConnected className="w-4 h-4 mr-2" />}
                                    Test Connection
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading || !connectionString}>
                                    {loading ? "Connecting..." : (editingId ? "Update & Connect" : "Connect")}
                                </Button>
                            </div>

                            {editingId && (
                                <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground" onClick={handleCancelEdit}>
                                    Cancel Edit
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full md:w-1/2 h-full min-h-[400px] flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                        <IconHistory className="w-5 h-5 text-primary" />
                        Saved Connections
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {savedConnections.length}
                    </span>
                </div>

                <Card className="flex-1 flex flex-col border-muted/50 shadow-inner bg-muted/10">
                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-[450px] pr-4 p-4">
                            {savedConnections.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12 gap-2">
                                    <IconServer className="w-10 h-10 opacity-20" />
                                    <p className="text-sm">No saved connections yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {savedConnections.map((conn) => (
                                        <div
                                            key={conn.id}
                                            className={cn(
                                                "relative flex items-start justify-between p-4 border rounded-xl cursor-pointer group transition-all duration-200",
                                                editingId === conn.id
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                    : "bg-card hover:bg-card/80 hover:border-primary/30 hover:shadow-md"
                                            )}
                                            onClick={() => handleSelectConnection(conn)}
                                        >
                                            <div className="flex-1 overflow-hidden space-y-1.5">
                                                <div className="font-semibold text-sm truncate flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", editingId === conn.id ? "bg-primary" : "bg-green-500/50")} />
                                                    {conn.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate font-mono bg-muted/50 p-1.5 rounded-md w-fit max-w-full border border-border/50">
                                                    {conn.connectionString.replace(/:([^@]+)@/, ":****@")}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                                                    <IconHistory className="w-3 h-3" />
                                                    Last used {formatDistanceToNow(conn.lastUsedAt?.toDate ? conn.lastUsedAt.toDate() : new Date())} ago
                                                </div>
                                            </div>

                                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md p-0.5 shadow-sm border">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:text-primary"
                                                    onClick={(e) => handleEditConnection(e, conn)}
                                                    title="Edit"
                                                >
                                                    <IconPencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => handleDeleteConnection(e, conn.id)}
                                                    title="Delete"
                                                >
                                                    <IconTrash className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
