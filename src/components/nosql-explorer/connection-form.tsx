"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconDatabase, IconTrash, IconHistory } from "@tabler/icons-react";
import { SavedConnection } from "./types";
import { getConnections, deleteConnection, saveConnection } from "./connection-service";
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
    const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
    const { user } = useAuth();
    const [isLoadingConnections, setIsLoadingConnections] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (connectionString) {
            await onConnect(connectionString);
            if (user) {
                try {
                    // Save connection after successful connect (handled by parent usually, but we can do it here too or just let parent handle it)
                    // Actually, parent handles connection logic. We should probably save it here if parent succeeds.
                    // But onConnect is async. If it resolves, we assume success.
                    await saveConnection(user.uid, connectionString);
                    loadConnections();
                } catch (e) {
                    console.error("Failed to save connection", e);
                }
            }
        }
    };

    const handleSelectConnection = (conn: SavedConnection) => {
        setConnectionString(conn.connectionString);
        // Optionally auto-submit? Let's just fill it for now.
    };

    const handleDeleteConnection = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!user) return;
        if (!confirm("Are you sure you want to delete this saved connection?")) return;

        try {
            await deleteConnection(user.uid, id);
            toast.success("Connection deleted");
            loadConnections();
        } catch (error) {
            toast.error("Failed to delete connection");
        }
    };

    return (
        <div className="flex items-center justify-center h-full p-4 gap-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconDatabase className="w-6 h-6" />
                        Connect to MongoDB
                    </CardTitle>
                    <CardDescription>
                        Enter your MongoDB connection string to start exploring your data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Button type="submit" className="w-full" disabled={loading || !connectionString}>
                            {loading ? "Connecting..." : "Connect"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {user && savedConnections.length > 0 && (
                <Card className="w-full max-w-sm h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <IconHistory className="w-5 h-5" />
                            Saved Connections
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-full px-6 pb-6">
                            <div className="space-y-2">
                                {savedConnections.map((conn) => (
                                    <div
                                        key={conn.id}
                                        className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer group transition-colors"
                                        onClick={() => handleSelectConnection(conn)}
                                    >
                                        <div className="flex-1 overflow-hidden">
                                            <div className="font-medium text-sm truncate">{conn.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">{conn.connectionString}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                Last used {formatDistanceToNow(conn.lastUsedAt?.toDate ? conn.lastUsedAt.toDate() : new Date())} ago
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                            onClick={(e) => handleDeleteConnection(e, conn.id)}
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
