"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNotes } from "@/app/app/notes/context/NotesContext";
import { Editor, EditorProvider, createEmptyContent } from "@/components/ui/rich-editor";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { ContainerNode, EditorState } from "@/components/ui/rich-editor/types";

export default function NotionEditor() {
    const { notes, activeNoteId, updateNote } = useNotes();
    const activeNote = notes.find(n => n.id === activeNoteId);

    const [title, setTitle] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (activeNote) {
            setTitle(activeNote.title);
        }
    }, [activeNoteId, activeNote]);

    const debouncedUpdate = useDebouncedCallback(async (updates: any) => {
        if (activeNoteId) {
            await updateNote(activeNoteId, updates);
        }
    }, 1000);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedUpdate({ title: newTitle });
    };

    const handleEditorChange = (state: EditorState) => {
        const currentContent = state.history[state.historyIndex];
        debouncedUpdate({ content: currentContent });
    };

    // Memoize initial content to prevent unnecessary re-renders/resets
    const initialContent = useMemo(() => {
        if (activeNote && activeNote.content) {
            // Check if content is compatible with Mina Rich Editor (has children array)
            const content = activeNote.content as any;
            if (content.type === 'container' && Array.isArray(content.children)) {
                return content as ContainerNode;
            }
            // If incompatible (e.g. old Tiptap content), fall back to empty
            // We'll preserve the old content in the database until the user saves new changes
        }
        return {
            id: "root",
            type: "container",
            children: createEmptyContent(),
            attributes: {},
        } as ContainerNode;
    }, [activeNoteId, activeNote]); // Only change when note ID changes

    if (!activeNoteId) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a note or create a new one to get started.
            </div>
        );
    }

    if (!activeNote) return null;

    if (!isMounted) return null;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
            <div className="p-8 pb-4 max-w-6xl mx-auto w-full">
                <Input
                    value={title}
                    onChange={handleTitleChange}
                    className="text-4xl font-bold border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50 h-auto bg-transparent"
                    placeholder="Untitled"
                />
            </div>

            <div className="flex-1 overflow-y-auto px-8 max-w-6xl mx-auto w-full pb-20">
                {/* Key forces re-mount when switching notes to ensure clean state */}
                <EditorProvider
                    key={activeNoteId}
                    initialContainer={initialContent}
                    onChange={handleEditorChange}
                >
                    <Editor />
                </EditorProvider>
            </div>
        </div>
    );
}
