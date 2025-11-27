"use client";

import { useState, useEffect } from "react";
import { Document } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconPlus, IconRefresh, IconSearch, IconTrash, IconPencil, IconCode, IconTable } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

interface DocumentViewProps {
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    onRefresh: () => void;
    onInsert: (doc: any) => Promise<void>;
    onUpdate: (id: string, update: any) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onSearch: (query: string) => void;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export function DocumentView({
    documents,
    total,
    page,
    limit,
    loading,
    onRefresh,
    onInsert,
    onUpdate,
    onDelete,
    onSearch,
    onPageChange,
    onLimitChange,
}: DocumentViewProps) {
    const [viewMode, setViewMode] = useState<"table" | "json">("json");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isInsertDialogOpen, setIsInsertDialogOpen] = useState(false);
    const [editorContent, setEditorContent] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleEdit = (doc: Document) => {
        setSelectedDoc(doc);
        setEditorContent(JSON.stringify(doc, null, 2));
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const updatedDoc = JSON.parse(editorContent);
            if (selectedDoc) {
                await onUpdate(selectedDoc._id, updatedDoc);
                setIsEditDialogOpen(false);
                toast.success("Document updated successfully");
                onRefresh();
            }
        } catch (e) {
            toast.error("Invalid JSON");
        }
    };

    const handleInsert = async () => {
        try {
            const newDoc = JSON.parse(editorContent);
            await onInsert(newDoc);
            setIsInsertDialogOpen(false);
            toast.success("Document inserted successfully");
            onRefresh();
        } catch (e) {
            toast.error("Invalid JSON");
        }
    };

    const openInsertDialog = () => {
        setEditorContent("{\n  \n}");
        setIsInsertDialogOpen(true);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search query (JSON)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button type="submit" variant="secondary" size="sm">Search</Button>
                </form>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => setViewMode("table")}
                        >
                            <IconTable className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "json" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => setViewMode("json")}
                        >
                            <IconCode className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                        <IconRefresh className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={openInsertDialog}>
                        <IconPlus className="h-4 w-4 mr-2" />
                        Insert Document
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Loading documents...
                    </div>
                ) : documents.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No documents found.
                    </div>
                ) : viewMode === "json" ? (
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div key={doc._id} className="border rounded-lg p-4 bg-card relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(doc)}>
                                            <IconPencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(doc._id)}>
                                            <IconTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <pre className="text-xs font-mono overflow-auto max-h-[300px]">
                                        {JSON.stringify(doc, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <ScrollArea className="h-full">
                        <div className="w-full">
                            <table className="w-full text-sm text-left relative">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 w-[50px] whitespace-nowrap font-medium text-center">#</th>
                                        {Array.from(new Set(documents.flatMap(Object.keys)))
                                            .filter(key => key !== "_id")
                                            .reduce((acc, key) => [...acc, key], ["_id"])
                                            .map((key) => (
                                                <th key={key} className="px-4 py-3 whitespace-nowrap font-medium">
                                                    {key}
                                                </th>
                                            ))}
                                        <th className="px-4 py-3 w-[100px] bg-muted/50 sticky right-0 z-20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc, index) => (
                                        <tr key={doc._id} className="border-b hover:bg-muted/50 group">
                                            <td className="px-4 py-3 font-mono text-xs text-center text-muted-foreground">
                                                {index + 1 + (page - 1) * limit}
                                            </td>
                                            {Array.from(new Set(documents.flatMap(Object.keys)))
                                                .filter(key => key !== "_id")
                                                .reduce((acc, key) => [...acc, key], ["_id"])
                                                .map((key) => (
                                                    <td key={key} className="px-4 py-3 font-mono text-xs align-top max-w-[300px] truncate" title={typeof doc[key] === 'object' ? JSON.stringify(doc[key]) : String(doc[key])}>
                                                        {doc[key] === undefined ? (
                                                            ""
                                                        ) : typeof doc[key] === 'object' && doc[key] !== null ? (
                                                            Array.isArray(doc[key]) ? (
                                                                <span className="text-blue-500">Array({doc[key].length})</span>
                                                            ) : (
                                                                <span className="text-yellow-500">{'{...}'}</span>
                                                            )
                                                        ) : (
                                                            String(doc[key])
                                                        )}
                                                    </td>
                                                ))}
                                            <td className="px-4 py-3 align-top sticky right-0 bg-background group-hover:bg-muted/50 border-l z-10">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(doc)}>
                                                        <IconPencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(doc._id)}>
                                                        <IconTrash className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ScrollArea>
                )}
            </div>

            <div className="p-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span>Items per page:</span>
                    <select
                        className="bg-transparent border rounded p-1"
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                    >
                        {[50, 100, 200, 500, 1000, 2000].map((val) => (
                            <option key={val} value={val}>
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span>
                        Page {page} of {Math.ceil(total / limit) || 1}
                    </span>
                    <div className="flex items-center border rounded overflow-hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-8 rounded-none px-0"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            &lt;
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-8 rounded-none px-0"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= Math.ceil(total / limit)}
                        >
                            &gt;
                        </Button>
                    </div>
                </div>
                <div>
                    Showing {documents.length} of {total} documents
                </div>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Document</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 border rounded-md overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            value={editorContent}
                            onChange={(value) => setEditorContent(value || "")}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isInsertDialogOpen} onOpenChange={setIsInsertDialogOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Insert Document</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 border rounded-md overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            value={editorContent}
                            onChange={(value) => setEditorContent(value || "")}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInsertDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleInsert}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
