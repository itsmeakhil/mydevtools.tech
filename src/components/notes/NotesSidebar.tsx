"use client";

import React, { useState } from "react";
import { useNotes } from "@/app/app/notes/context/NotesContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronRight,
    ChevronDown,
    FileText,
    Plus,
    MoreHorizontal,
    Trash2,
    Edit2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Note } from "@/app/app/notes/types/Note";

interface NoteItemProps {
    note: Note;
    level: number;
}

const NoteItem = ({ note, level }: NoteItemProps) => {
    const { notes, activeNoteId, setActiveNoteId, createNote, deleteNote } = useNotes();
    const [isExpanded, setIsExpanded] = useState(false);

    const children = notes.filter(n => n.parentId === note.id);
    const hasChildren = children.length > 0;
    const isActive = activeNoteId === note.id;

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleSelect = () => {
        setActiveNoteId(note.id);
    };

    const handleCreateChild = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await createNote(note.id);
        setIsExpanded(true);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this note?")) {
            await deleteNote(note.id);
        }
    };

    return (
        <div>
            <div
                className={cn(
                    "group flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer transition-colors min-h-[32px]",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleSelect}
            >
                <div
                    className={cn(
                        "h-5 w-5 flex items-center justify-center rounded-sm hover:bg-muted-foreground/20 transition-colors",
                        !hasChildren && "opacity-0 group-hover:opacity-100" // Show expander on hover even if no children (to allow adding?) No, only if children.
                    )}
                    onClick={hasChildren ? handleExpand : undefined}
                >
                    {hasChildren && (
                        isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
                    )}
                </div>

                <span className="mr-1 text-sm">{note.icon || "📄"}</span>
                <span className="flex-1 truncate text-sm font-medium">{note.title || "Untitled"}</span>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCreateChild}
                        title="Add sub-page"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {children.map(child => (
                        <NoteItem key={child.id} note={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function NotesSidebar() {
    const { notes, createNote, isLoading } = useNotes();

    // Get top-level notes
    const rootNotes = notes.filter(n => !n.parentId);

    return (
        <div className="flex flex-col h-full border-r bg-muted/10 w-64 flex-shrink-0">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        📝
                    </span>
                    Notes
                </div>
                <Button variant="ghost" size="icon" onClick={() => createNote(null)} className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        <div className="p-4 text-xs text-muted-foreground text-center">Loading...</div>
                    ) : rootNotes.length === 0 ? (
                        <div className="p-4 text-xs text-muted-foreground text-center">
                            No notes yet. Click + to create one.
                        </div>
                    ) : (
                        rootNotes.map(note => (
                            <NoteItem key={note.id} note={note} level={0} />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
