'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../../database/firebase';
import { Note } from './types';
import Sidebar from './Sidebar';
import dynamic from 'next/dynamic';
import { OutputData } from '@editorjs/editorjs';
import { getAuth } from 'firebase/auth';

// Import NoteEditor with dynamic import to disable SSR
const NoteEditor = dynamic(() => import('./NoteEditor'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full border rounded-lg bg-muted/40 p-8">
      <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
});

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch notes from Firebase
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Note));
        
        setNotes(notesList);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch notes:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSelectNote = (noteId: string) => {
    const selected = notes.find((note) => note.id === noteId) || null;
    setCurrentNote(selected);
  };

  const handleCreateNewNote = () => {
    // Create a blank note with default values
    setCurrentNote({
      id: '',  // Will be replaced when saved
      title: '',
      content: {
        time: Date.now(),
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ]
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      created_by: user?.uid || 'anonymous'
    });
  };

  const handleSaveNote = async (noteData: { title: string; content: OutputData }) => {
    try {
      const timestamp = Date.now();
      
      if (currentNote && currentNote.id) {
        // Update existing note
        await updateDoc(doc(db, 'notes', currentNote.id), {
          title: noteData.title,
          content: noteData.content,
          updatedAt: timestamp
        });
        
        setCurrentNote({
          ...currentNote,
          title: noteData.title,
          content: noteData.content,
          updatedAt: timestamp
        });
        
      } else {
        // Create new note
        const newNoteRef = await addDoc(collection(db, 'notes'), {
          title: noteData.title,
          content: noteData.content,
          createdAt: timestamp,
          updatedAt: timestamp,
          created_by: user?.uid || 'anonymous'
        });
        
        const newNote = {
          id: newNoteRef.id,
          title: noteData.title,
          content: noteData.content,
          createdAt: timestamp,
          updatedAt: timestamp,
          created_by: user?.uid || 'anonymous'
        };
        
        setCurrentNote(newNote);
      }
    } catch (err) {
      console.error("Error saving note:", err);
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      
      // If we deleted the currently selected note, clear the selection
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      throw err;
    }
  };

  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Notes</h1>
      
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        <div className="col-span-3">
          <Sidebar
            notes={notes}
            selectedNoteId={currentNote?.id || null}
            onSelectNote={handleSelectNote}
            onCreateNewNote={handleCreateNewNote}
            onDeleteNote={handleDeleteNote}
            loading={loading}
            error={error}
          />
        </div>
        
        <div className="col-span-9 h-full">
          {currentNote ? (
            <NoteEditor 
              currentNote={currentNote}
              onSave={handleSaveNote}
            />
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg bg-muted/40">
              <div className="text-center p-6">
                <h3 className="text-xl font-medium mb-2">No Note Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select an existing note or create a new one to get started.
                </p>
                <Button onClick={handleCreateNewNote}>Create New Note</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Button component to fix the missing import error
function Button({ 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  children: React.ReactNode 
}) {
  return (
    <button 
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2" 
      {...props}
    >
      {children}
    </button>
  );
}
