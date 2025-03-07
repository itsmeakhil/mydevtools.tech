import { OutputData } from '@editorjs/editorjs';

export interface Note {
  id: string;
  title: string;
  content: OutputData;
  createdAt: number;
  updatedAt: number;
  created_by: string;
  isParent: boolean;
}

export interface NoteEditorProps {
  currentNote: Note | null;
  onSave: (noteData: { title: string; content: OutputData }) => Promise<void>;
}

export interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNewNote: () => void;
  onDeleteNote: (noteId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}
