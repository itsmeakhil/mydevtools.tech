import { useState, useEffect } from 'react';
import { auth } from '@/database/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  createNote, 
  getUserNotes, 
  updateNote, 
  deleteNote, 
  getNoteById,
  Note 
} from './firebase-notes';
import { defaultEditorContent } from './content';

export function useNotes() {
  const [user] = useAuthState(auth);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userNotes = await getUserNotes(user.uid);
      setNotes(userNotes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (note: { title: string; content: unknown }) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const savedNote = await createNote({
        title: note.title || 'Untitled Note',
        content: note.content,
        userId: user.uid
      });
      
      setNotes(prev => [savedNote, ...prev]);
      return savedNote;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save note');
    }
  };

  const updateNoteContent = async (noteId: string, updates: { title?: string; content?: unknown }) => {
    try {
      await updateNote(noteId, updates);
      
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId 
            ? { ...note, ...updates } 
            : note
        )
      );
      
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update note');
    }
  };

  const removeNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete note');
    }
  };

  const createNewNote = async () => {
    return await saveNote({
      title: 'Untitled Note',
      content: defaultEditorContent
    });
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [user]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    saveNote,
    updateNote: updateNoteContent,
    deleteNote: removeNote,
    createNewNote
  };
}

// When saveNote is called:
// 1. It calls the createNote function from firebase-notes.js
// 2. This function persists data to Firebase
// 3. Then the local state is updated with setNotes

// When updateNoteContent is called:
// 1. It calls updateNote function from firebase-notes.js 
// 2. This updates the data in Firebase
// 3. Then updates the local state to reflect changes

// When removeNote is called:
// 1. It calls deleteNote function from firebase-notes.js
// 2. This deletes the note from Firebase
// 3. Then updates the local state by filtering out the deleted note

// When createNewNote is called:
// 1. It calls saveNote which uses the createNote function
// 2. A new note is created in Firebase and the local state is updated

export function useSingleNote(noteId: string | null) {
  const [user] = useAuthState(auth);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId || !user) {
        setNote(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedNote = await getNoteById(noteId);
        
        // Verify note belongs to current user
        if (fetchedNote.userId !== user.uid) {
          throw new Error('You do not have permission to access this note');
        }
        
        setNote(fetchedNote);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch note'));
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, user]);

  return { note, loading, error };
}
