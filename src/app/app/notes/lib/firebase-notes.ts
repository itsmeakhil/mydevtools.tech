import { db } from '@/database/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { auth } from '@/database/firebase';

const NOTES_COLLECTION = 'notes';
export interface Note {
  id?: string;
  title: string;
  content: unknown; // Rich text content with type safety
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
}

// Create a new note
export const createNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
      ...noteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...noteData };
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

// Get all notes for a user
export const getUserNotes = async (userId: string) => {
  try {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notes: Note[] = [];
    
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() } as Note);
    });
    
    return notes;
  } catch (error) {
    console.error('Error getting user notes:', error);
    throw error;
  }
};

// Get a specific note by ID
export const getNoteById = async (noteId: string) => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Note;
    } else {
      throw new Error('Note not found');
    }
  } catch (error) {
    console.error('Error getting note:', error);
    throw error;
  }
};

// Update an existing note
export const updateNote = async (noteId: string, noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await updateDoc(docRef, {
      ...noteData,
      updatedAt: serverTimestamp(),
    });
    return { id: noteId, ...noteData };
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (noteId: string) => {
  try {
    await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

// Get current user ID (helper function)
export const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};
