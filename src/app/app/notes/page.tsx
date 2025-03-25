"use client";

import React, { useState, useEffect } from "react";
import TailwindAdvancedEditor from "./components/tailwind/advanced-editor";
import { useNotes } from "./lib/hooks";
import type { JSONContent } from "novel";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/database/firebase";

const Notes = () => {
  const [user, userLoading] = useAuthState(auth);
  const { createNewNote, updateNote, notes, loading, error } = useNotes();
  const [currentNote, setCurrentNote] = useState<{ id: string; title: string; content: JSONContent } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("Saved");

  useEffect(() => {
    // Only try to initialize notes when user is authenticated and notes are loaded
    const initializeNote = async () => {
      // Don't do anything if user is still loading or if notes are still loading
      if (userLoading || loading) return;
      
      // User must be authenticated
      if (!user) {
        setSaveStatus("Please sign in to create notes");
        return;
      }

      if (notes.length === 0) {
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
      } else if (notes.length > 0) {
        // Use the most recent note
        const latestNote = notes[0];
        setCurrentNote({
          id: latestNote.id || '',
          title: latestNote.title,
          content: latestNote.content as JSONContent
        });
      }
    };
    
    initializeNote();
  }, [userLoading, user, loading, notes]);

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
