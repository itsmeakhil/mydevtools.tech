import { useState, useEffect, useCallback } from 'react';
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
import { emptyEditorContent } from './content';

export function useNotes() {
  const [user] = useAuthState(auth);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
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
  }, [user]);

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
      // Don't save if title is explicitly set to empty
      if (updates.title !== undefined && updates.title.trim() === '') {
        return false;
      }
      
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

  // Create a new note - but don't save to Firebase until a title is provided
  const createNewNote = async () => {
    if (!user) throw new Error('User not authenticated');
    
    // Create a local temporary note with empty title
    const tempNote = {
      id: `temp-${Date.now()}`, // Create a temporary ID
      title: '',
      content: emptyEditorContent,
      userId: user.uid
    };
    
    // Add to local state but don't persist to Firebase yet
    setNotes(prev => [tempNote, ...prev]);
    
    return tempNote;
  };

  // Add a function to persist a temporary note to Firebase
  const persistNewNote = async (tempNoteId: string, title: string, content: unknown) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Only save if there's a title
      if (!title || title.trim() === '') {
        return false;
      }
      
      // Create a real note in Firebase
      const savedNote = await createNote({
        title: title,
        content: content,
        userId: user.uid
      });
      
      // Replace the temp note with the real one in our state
      setNotes(prev => 
        prev.map(note => 
          note.id === tempNoteId 
            ? { id: savedNote.id, title, content, userId: user.uid } 
            : note
        )
      );
      
      return savedNote;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save note');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [user, fetchNotes]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    saveNote,
    updateNote: updateNoteContent,
    deleteNote: removeNote,
    createNewNote,
    persistNewNote
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
  const [localTitle, setLocalTitle] = useState<string>('');
  const [localContent, setLocalContent] = useState<unknown>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('Saved');

  const updateLocalTitle = (title: string) => {
    setLocalTitle(title);
    setIsDirty(true);
    setSaveStatus('Unsaved');
  };

  const updateLocalContent = (content: unknown) => {
    setLocalContent(content);
    setIsDirty(true);
    setSaveStatus('Unsaved');
  };

  const saveChanges = useCallback(async () => {
    if (!noteId || !isDirty) return;
    
    const updates: { title?: string; content?: unknown } = {};
    
    if (localTitle !== note?.title) {
      updates.title = localTitle;
    }
    
    if (localContent !== null) {
      updates.content = localContent;
    }
    
    if (Object.keys(updates).length > 0) {
      try {
        setSaveStatus('Saving...');
        await updateNote(noteId, updates);
        setNote(prev => prev ? { ...prev, ...updates } : null);
        setIsDirty(false);
        setSaveStatus('Saved');
        return true;
      } catch (err) {
        setSaveStatus('Failed to save');
        throw err instanceof Error ? err : new Error('Failed to save changes');
      }
    }
    
    return false;
  }, [noteId, isDirty, localTitle, localContent, note?.title]);

  // Debounced auto-save
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (isDirty && noteId) {
        saveChanges().catch(console.error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(saveTimer);
  }, [isDirty, localTitle, localContent, noteId, saveChanges]);

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
        setLocalTitle(fetchedNote.title);
        setLocalContent(fetchedNote.content);
        setIsDirty(false);
        setSaveStatus('Saved');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch note'));
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, user]);

  // Ensure changes are saved when component unmounts
  useEffect(() => {
    return () => {
      if (isDirty && noteId) {
        saveChanges().catch(console.error);
      }
    };
  }, [isDirty, noteId, saveChanges]);

  return { 
    note, 
    loading, 
    error, 
    localTitle, 
    localContent, 
    isDirty,
    saveStatus,
    updateLocalTitle, 
    updateLocalContent,
    saveChanges
  };
}
