"use client";

import React, { useState, useEffect, useRef } from "react";
import TailwindAdvancedEditor from "./components/tailwind/advanced-editor";
import { useNotes } from "./lib/hooks";
import type { JSONContent } from "novel";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/database/firebase";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notes = () => {
  const router = useRouter();
  const [user, userLoading] = useAuthState(auth);
  const { createNewNote, updateNote, persistNewNote, notes, loading, error } = useNotes();
  const [currentNote, setCurrentNote] = useState<{ id: string; title: string; content: JSONContent } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("Saved");
  const searchParams = useSearchParams();
  const shouldCreateNewNote = searchParams.get('new') === 'true';
  const skipLoading = searchParams.get('skipLoading') === 'true'; 
  const processedNewNoteRef = useRef(false);
  const isInitialMount = useRef(true);
  
  // On initial mount, store the session flag in localStorage to track first load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // If skipLoading is true, we want to skip all loading states
      if (skipLoading) {
        localStorage.setItem('notesInitialLoadComplete', 'true');
      }
    }
  }, [skipLoading]);
  
  // Function to check if we should show loading states
  const shouldShowLoadingState = () => {
    // Never show loading states if skipLoading is true
    if (skipLoading) return false;
    
    // Check if we've completed initial load before
    const initialLoadComplete = localStorage.getItem('notesInitialLoadComplete');
    return initialLoadComplete !== 'true';
  };

  // Handle new note creation from URL parameter
  useEffect(() => {
    const handleNewNoteFromUrl = async () => {
      if (!user || processedNewNoteRef.current || !shouldCreateNewNote) {
        return;
      }

      processedNewNoteRef.current = true;

      try {
        // First save the current note if it exists and has a title
        if (currentNote && currentNote.id && currentNote.title.trim() !== '') {
          // Check if it's a temporary note or a real note
          if (currentNote.id.startsWith('temp-')) {
            await persistNewNote(currentNote.id, currentNote.title, currentNote.content);
          } else {
            await updateNote(currentNote.id, { 
              title: currentNote.title,
              content: currentNote.content 
            });
          }
        }
        
        // Then create a new note (in memory only until titled)
        const newNote = await createNewNote();
        setCurrentNote({
          id: newNote.id,
          title: '',  // Start with empty title
          content: newNote.content as JSONContent
        });
        setSaveStatus("Title required to save");
        
        // Remove the query parameter from the URL without refreshing
        router.replace('/app/notes', { scroll: false });
      } catch (error) {
        console.error("Failed to create new note:", error);
        setSaveStatus("Failed to create note");
      }
    };

    // Only run after authentication and initial loading are done
    if (!userLoading && !loading && user) {
      handleNewNoteFromUrl();
    }
  }, [user, userLoading, loading, shouldCreateNewNote, currentNote, createNewNote, updateNote, persistNewNote, router]);

  // Load initial notes
  useEffect(() => {
    const initializeNote = async () => {
      // Skip processing if still in initial loading
      if (userLoading || loading) return;
      
      // Handle authentication check
      if (!user) return;

      // Don't initialize if we're handling shouldCreateNewNote or if a note is already set
      if (shouldCreateNewNote || currentNote) return;

      // If there are notes, load the most recent one
      if (notes.length > 0) {
        const latestNote = notes[0];
        
        // Only load notes that have real IDs (not temporary ones)
        // or temporary ones that have a title
        if (!latestNote.id.startsWith('temp-') || latestNote.title.trim() !== '') {
          setCurrentNote({
            id: latestNote.id || '',
            title: latestNote.title,
            content: latestNote.content as JSONContent
          });
        } else {
          // If the most recent note is a temporary note without a title,
          // create a fresh new note instead
          await handleCreateNewNote();
        }
      }
      
      // Mark that we've completed at least one initial load
      localStorage.setItem('notesInitialLoadComplete', 'true');
    };
    
    initializeNote();
  }, [userLoading, user, loading, notes, shouldCreateNewNote, currentNote]);

  // When navigating away from the page, reset the flag
  useEffect(() => {
    return () => {
      processedNewNoteRef.current = false;
    };
  }, []);

  const handleTitleChange = async (title: string) => {
    if (!currentNote || !user) return;
    
    // Only update the title in state, don't save immediately
    setCurrentNote(prev => prev ? { ...prev, title } : null);
    
    // If title is empty, indicate that it's not saved
    if (title.trim() === '') {
      setSaveStatus("Title required to save");
    } else {
      // Just mark as unsaved, don't persist immediately
      setSaveStatus("Unsaved changes");
    }
  };

  // Separate function to handle persisting temporary notes
  const persistTemporaryNoteIfNeeded = async () => {
    if (!currentNote || !user) return;
    
    // Only try to persist if it's a temporary note with a title
    if (currentNote.id.startsWith('temp-') && currentNote.title.trim() !== '') {
      try {
        setSaveStatus("Saving...");
        const savedNote = await persistNewNote(currentNote.id, currentNote.title, currentNote.content);
        if (savedNote) {
          setCurrentNote(prev => prev ? { ...prev, id: savedNote.id } : null);
          setSaveStatus("Saved");
        } else {
          setSaveStatus("Failed to save");
        }
      } catch (error) {
        console.error("Failed to persist note:", error);
        setSaveStatus("Failed to save");
      }
    }
  };

  // Modified handleContentChange to use the new persist function
  const handleContentChange = async (content: JSONContent) => {
    if (!currentNote || !user) return;
    
    // Update the content in state
    setCurrentNote(prev => prev ? { ...prev, content } : null);
    
    // Only save if this is not a temporary note or if it has a title
    if (currentNote.id.startsWith('temp-')) {
      if (currentNote.title.trim() === '') {
        setSaveStatus("Title required to save");
        return;
      } else {
        // Don't persist on every content change
        setSaveStatus("Unsaved changes");
      }
    } else {
      // Regular note with a title, save normally
      if (currentNote.title.trim() === '') {
        setSaveStatus("Unsaved changes");
        return;
      }
      
      setSaveStatus("Saving...");
      try {
        await updateNote(currentNote.id, { content });
        setSaveStatus("Saved");
      } catch (error) {
        console.error("Failed to update content:", error);
        setSaveStatus("Failed to save");
      }
    }
  };
  
  // Auto-save effect with debounce - now handles both temporary and permanent notes
  useEffect(() => {
    if (!currentNote || !user) return;
    
    // Don't save if the title is empty
    if (currentNote.title.trim() === '') return;
    
    const timer = setTimeout(() => {
      if (saveStatus === "Unsaved changes") {
        if (currentNote.id.startsWith('temp-')) {
          // For temporary notes, persist them to create real notes
          persistTemporaryNoteIfNeeded();
        } else {
          // For regular notes, update them
          updateNote(currentNote.id, { 
            title: currentNote.title,
            content: currentNote.content 
          })
            .then(() => setSaveStatus("Saved"))
            .catch(error => {
              console.error("Failed to save:", error);
              setSaveStatus("Failed to save");
            });
        }
      }
    }, 2000); // Wait 2 seconds after typing stops
    
    return () => clearTimeout(timer);
  }, [currentNote, user, saveStatus, updateNote]);

  const handleCreateNewNote = async () => {
    try {
      // First save the current note if it exists and has a title
      if (currentNote && currentNote.id && currentNote.title.trim() !== '') {
        // Check if it's a temporary note or a real note
        if (currentNote.id.startsWith('temp-')) {
          await persistNewNote(currentNote.id, currentNote.title, currentNote.content);
        } else {
          await updateNote(currentNote.id, { 
            title: currentNote.title,
            content: currentNote.content 
          });
        }
      }
      
      // Then create a new note (in memory only until titled)
      const newNote = await createNewNote();
      setCurrentNote({
        id: newNote.id,
        title: '',  // Start with empty title
        content: newNote.content as JSONContent
      });
      setSaveStatus("Title required to save");
    } catch (error) {
      console.error("Failed to create new note:", error);
      setSaveStatus("Failed to create note");
    }
  };

  // ONLY show loading states if we should (first time load)
  if (shouldShowLoadingState()) {
    // Show authentication checking ONLY on first visit
    if (userLoading) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-xl">Checking authentication...</div>
        </div>
      );
    }
    
    // Show login prompt 
    if (!user) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-xl">Please sign in to access your notes</div>
        </div>
      );
    }
    
    // Show notes loading ONLY on first visit
    if (loading) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-xl">Loading notes...</div>
        </div>
      );
    }
  } else {
    // If we shouldn't show loading states but user is not authenticated
    if (!user && !userLoading) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-xl">Please sign in to access your notes</div>
        </div>
      );
    }
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
  if (!currentNote && notes.length === 0 && !loading && !userLoading) {
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

  // Always show the editor if we have a note
  // If we don't have a note yet but we're loading (and not showing the loading screen), 
  // show a minimal spinner here instead of a full-page loading message
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-4 sm:px-5">
      {currentNote ? (
        <TailwindAdvancedEditor
          initialTitle={currentNote.title}
          initialContent={currentNote.content}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          saveStatus={saveStatus}
          titlePlaceholder="Untitled Note" 
        />
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center">
          {(loading || userLoading) ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          ) : (
            <div className="text-xl">Loading note...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes;
