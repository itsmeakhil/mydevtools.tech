'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc, query, orderBy, onSnapshot, deleteDoc, where, getDoc } from 'firebase/firestore';
import { db } from '../../../database/firebase';
import { Note } from './types';
import dynamic from 'next/dynamic';
import { OutputData } from '@editorjs/editorjs';
import { getAuth } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';

// Import NoteEditor with dynamic import to disable SSR
const NoteEditor = dynamic(() => import('./NoteEditor'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full border rounded-lg bg-muted/40 p-8">
      <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
});

// Helper function to make content Firebase-compatible by converting nested arrays
const makeFirebaseCompatible = (content: OutputData): OutputData => {
  const processedContent = { ...content };
  
  // Process blocks to handle arrays in table cells
  if (processedContent.blocks && Array.isArray(processedContent.blocks)) {
    processedContent.blocks = processedContent.blocks.map(block => {
      // Handle table blocks specifically
      if (block.type === 'table' && block.data && block.data.content) {
        // Convert the nested array structure of tables to an object format
        // that Firestore can handle
        const tableContent = block.data.content;
        if (Array.isArray(tableContent)) {
          const tableRows: Record<string, Record<string, string>> = {};
          
          tableContent.forEach((row, rowIndex) => {
            if (Array.isArray(row)) {
              const cells: Record<string, string> = {};
              row.forEach((cell, cellIndex) => {
                cells[`cell${cellIndex}`] = cell;
              });
              tableRows[`row${rowIndex}`] = cells;
            }
          });
          
          // Replace the array with an object structure
          return {
            ...block,
            data: {
              ...block.data,
              content: tableRows,
              isFirebaseCompatible: true // Flag to identify converted tables
            }
          };
        }
      }
      return block;
    });
  }
  
  return processedContent;
};

// Helper function to restore content from Firebase-compatible format
const restoreFromFirebase = (content: OutputData): OutputData => {
  const processedContent = { ...content };
  
  // Process blocks to restore arrays
  if (processedContent.blocks && Array.isArray(processedContent.blocks)) {
    processedContent.blocks = processedContent.blocks.map(block => {
      // Handle table blocks specifically
      if (block.type === 'table' && block.data && block.data.content && block.data.isFirebaseCompatible) {
        // Convert the object format back to arrays
        const tableContent = block.data.content;
        if (typeof tableContent === 'object' && !Array.isArray(tableContent)) {
          // Get the number of rows
          const rowKeys = Object.keys(tableContent).sort((a, b) => {
            // Sort row keys numerically (row0, row1, row2, etc.)
            const numA = parseInt(a.replace('row', ''));
            const numB = parseInt(b.replace('row', ''));
            return numA - numB;
          });
          
          const tableArray = rowKeys.map(rowKey => {
            const row = tableContent[rowKey];
            // Get the number of cells in this row
            const cellKeys = Object.keys(row).sort((a, b) => {
              // Sort cell keys numerically (cell0, cell1, cell2, etc.)
              const numA = parseInt(a.replace('cell', ''));
              const numB = parseInt(b.replace('cell', ''));
              return numA - numB;
            });
            
            // Convert cells object back to array
            return cellKeys.map(cellKey => row[cellKey]);
          });
          
          // Replace the object with the restored array structure
          return {
            ...block,
            data: {
              ...block.data,
              content: tableArray,
              isFirebaseCompatible: undefined // Remove the flag
            }
          };
        }
      }
      return block;
    });
  }
  
  return processedContent;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id');

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
      } else {
        setAuthChecked(true);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Create a blank note template
  const createBlankNote = (): Omit<Note, 'id'> => ({
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
    created_by: user?.uid || '',
    isParent: true
  });

  // Load note from URL if ID is present
  useEffect(() => {
    const loadNoteFromUrl = async () => {
      if (!user) return;

      if (noteId) {
        try {
          const noteDoc = await getDoc(doc(db, 'notes', noteId));
          if (noteDoc.exists()) {
            const noteData = noteDoc.data() as Omit<Note, 'id'>;
            // Verify the note belongs to the current user
            if (noteData.created_by === user.uid) {
              // Restore nested arrays in content if needed
              const processedContent = noteData.content ? restoreFromFirebase(noteData.content) : noteData.content;
              
              setCurrentNote({
                id: noteDoc.id,
                ...noteData,
                content: processedContent
              } as Note);
            } else {
              setError(new Error("You don't have permission to view this note"));
              setCurrentNote(null);
            }
          } else {
            setCurrentNote(null);
          }
        } catch (err) {
          console.error('Error loading note:', err);
          setError(err instanceof Error ? err : new Error('Failed to load note'));
          setCurrentNote(null);
        }
      } else {
        // Create a fresh blank note, ensuring it has different timestamps
        // This forces a full reinitialize of the editor
        const freshNote = {
          ...createBlankNote(),
          id: '',
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
          }
        };
        setCurrentNote(freshNote);
      }
    };

    loadNoteFromUrl();
  }, [noteId, user]);

  // Fetch notes from Firebase
  useEffect(() => {
    if (!authChecked || !user) return;

    // Filter notes by current user ID
    const q = query(
      collection(db, 'notes'), 
      where('created_by', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    
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
  }, [user, authChecked]);

  // const handleSelectNote = (noteId: string) => {
  //   router.push(`/app/notes?id=${noteId}`);
  // };

  const handleCreateNewNote = () => {
    if (!user) {
      setError(new Error('You must be logged in to create notes'));
      return;
    }

    // Clear the note ID from URL when creating new note
    router.push('/app/notes');
    
    // Generate a unique key using timestamp AND a random string to ensure uniqueness
    const uniqueKey = `new-note-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Explicitly set a completely new note object to force re-render and reset
    const blankNote = {
      ...createBlankNote(),
      id: '', // Ensure no ID exists for new notes
      key: uniqueKey, // Add a unique key for forcing re-render
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
      }
    };
    
    // Force currentNote state update with the new blank note
    setCurrentNote(null); // First set to null to force cleanup
    
    // Use setTimeout to ensure the reset happens in a new render cycle
    setTimeout(() => {
      setCurrentNote(blankNote);
    }, 10);
  };

  const handleSaveNote = async (noteData: { title: string; content: OutputData }) => {
    if (!user) {
      throw new Error('You must be logged in to save notes');
    }

    try {
      const timestamp = Date.now();
      
      // Convert any nested arrays to Firebase-compatible format
      const processedContent = makeFirebaseCompatible(noteData.content);
      
      if (currentNote && currentNote.id) {
        // Verify the note belongs to the current user before updating
        if (currentNote.created_by !== user.uid) {
          throw new Error('You can only edit your own notes');
        }
        
        await updateDoc(doc(db, 'notes', currentNote.id), {
          title: noteData.title,
          content: processedContent, // Use the processed content
          updatedAt: timestamp
        });
        
        setCurrentNote({
          ...currentNote,
          title: noteData.title,
          content: noteData.content, // Keep the original format in state
          updatedAt: timestamp
        });
        
      } else {
        // Create new note
        const newNoteData = {
          ...createBlankNote(),
          title: noteData.title,
          content: processedContent, // Use the processed content
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        
        const newNoteRef = await addDoc(collection(db, 'notes'), newNoteData);
        
        const newNote = {
          id: newNoteRef.id,
          ...newNoteData,
          content: noteData.content // Keep the original format in state
        };
        
        setCurrentNote(newNote);
        // Update URL with new note ID
        router.push(`/app/notes?id=${newNote.id}`);
      }
    } catch (err) {
      console.error("Error saving note:", err);
      throw err;
    }
  };

  // const handleDeleteNote = async (noteId: string) => {
  //   if (!user) {
  //     throw new Error('You must be logged in to delete notes');
  //   }

  //   try {
  //     const noteToDelete = notes.find(note => note.id === noteId);
      
  //     // Verify the note belongs to the current user before deleting
  //     if (noteToDelete && noteToDelete.created_by !== user.uid) {
  //       throw new Error('You can only delete your own notes');
  //     }
      
  //     await deleteDoc(doc(db, 'notes', noteId));
      
  //     // If we deleted the currently selected note, clear the selection and URL
  //     if (currentNote?.id === noteId) {
  //       setCurrentNote(null);
  //       router.push('/app/notes');
  //     }
  //   } catch (err) {
  //     console.error("Error deleting note:", err);
  //     throw err;
  //   }
  // };

  // Do not render content until auth is checked
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Notes</h1>
      
      {/* Remove fixed height to allow content to grow naturally */}
      <div className="min-h-[calc(100vh-180px)]">
        {currentNote ? (
          <NoteEditor 
            key={currentNote.key || currentNote.id || `new-note-${currentNote.createdAt}-${Math.random().toString(36).substring(2, 10)}`}
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
