"use client";

import React, { useState, useEffect, useRef } from "react";
import TailwindAdvancedEditor from "./components/tailwind/advanced-editor";
import { useNotes } from "./lib/hooks";
import type { JSONContent } from "novel";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/database/firebase";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notes = () => {
  const [user, userLoading] = useAuthState(auth);
  const { createNewNote, updateNote, notes, loading, error } = useNotes();
  const [currentNote, setCurrentNote] = useState<{ id: string; title: string; content: JSONContent } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("Saved");
  const searchParams = useSearchParams();
  const shouldCreateNewNote = searchParams.get('new') === 'true';
  const processedNewNoteRef = useRef(false);

  // Handle new note creation in a separate effect with fewer dependencies
  useEffect(() => {
    const handleNewNote = async () => {
      if (!user || userLoading || loading || !shouldCreateNewNote || processedNewNoteRef.current) {
        return;
      }

      processedNewNoteRef.current = true;

      try {
        // First save the current note if it exists
        if (currentNote && currentNote.id) {
          setSaveStatus("Saving current note...");
          await updateNote(currentNote.id, { 
            title: currentNote.title,
            content: currentNote.content 
          });
        }
        
        // Then create a new note
        setSaveStatus("Creating new note...");
        const newNote = await createNewNote();
        setCurrentNote({
          id: newNote.id,
          title: newNote.title,
          content: newNote.content as JSONContent
        });
        setSaveStatus("Saved");
        
        // Remove the query parameter from the URL without refreshing
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        window.history.replaceState({}, '', url);
      } catch (error) {
        console.error("Failed to create new note:", error);
        setSaveStatus("Failed to create note");
      }
    };

    handleNewNote();
  }, [user, userLoading, loading, shouldCreateNewNote, createNewNote, updateNote]);

  // Load initial notes - separate from new note creation
  useEffect(() => {
    const initializeNote = async () => {
      // Don't do anything if user is still loading or if notes are still loading
      if (userLoading || loading) return;
      
      // User must be authenticated
      if (!user) {
        setSaveStatus("Please sign in to create notes");
        return;
      }

      // Don't initialize if we're creating a new note or if a note is already set
      if (shouldCreateNewNote || currentNote) {
        return;
      }

      // If there are notes, load the most recent one
      if (notes.length > 0) {
        const latestNote = notes[0];
        setCurrentNote({
          id: latestNote.id || '',
          title: latestNote.title,
          content: latestNote.content as JSONContent
        });
      }
      // We no longer automatically create a new note if none exist
      // We'll show an empty state instead
    };
    
    initializeNote();
  }, [userLoading, user, loading, notes, shouldCreateNewNote, createNewNote]);

  // When navigating away from the page, reset the flag
  useEffect(() => {
    return () => {
      processedNewNoteRef.current = false;
    };
  }, []);

  const handleTitleChange = async (title: string) => {
    if (!currentNote || !user) return;
    
    setSaveStatus("Saving...");
    try {
      await updateNote(currentNote.id, { title });
      setCurrentNote(prev => prev ? { ...prev, title } : null);
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to update title:", error);
      setSaveStatus("Failed to save");
    }
  };

  const handleContentChange = async (content: JSONContent) => {
    if (!currentNote || !user) return;
    
    setSaveStatus("Saving...");
    try {
      await updateNote(currentNote.id, { content });
      setCurrentNote(prev => prev ? { ...prev, content } : null);
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to update content:", error);
      setSaveStatus("Failed to save");
    }
  };

  const handleCreateNewNote = async () => {
    try {
      setSaveStatus("Creating new note...");
      const newNote = await createNewNote();
      setCurrentNote({
        id: newNote.id,
        title: newNote.title,
        content: newNote.content as JSONContent
      });
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to create new note:", error);
      setSaveStatus("Failed to create note");
    }
  };

  // Show authentication state
  if (userLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl">Checking authentication...</div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl">Please sign in to access your notes</div>
      </div>
    );
  }

  // Show loading state while notes are loading
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl">Loading notes...</div>
      </div>
    );
  }

  // Show error if there was a problem
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  // Empty state when no notes exist
  if (!currentNote && notes.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl mb-6">You don't have any notes yet</div>
        <Button onClick={handleCreateNewNote} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create your first note
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-4 sm:px-5">
      {currentNote ? (
        <TailwindAdvancedEditor
          initialTitle={currentNote.title}
          initialContent={currentNote.content}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          saveStatus={saveStatus}
        />
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-xl">Creating a new note...</div>
        </div>
      )}
    </div>
  );
};

export default Notes;
