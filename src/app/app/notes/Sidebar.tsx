'use client';

import { SidebarProps } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Sidebar({ 
  notes, 
  selectedNoteId, 
  onSelectNote, 
  onCreateNewNote,
  onDeleteNote,
  loading, 
  error 
}: SidebarProps) {
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // Prevent note selection when clicking delete
    setNoteToDelete(noteId);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      setIsDeleting(true);
      await onDeleteNote(noteToDelete);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(false);
      setNoteToDelete(null);
    }
  };

  return (
    <Card className="h-full">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Notes</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateNewNote}
          title="Create new note"
        >
          <PlusCircle size={20} />
        </Button>
      </div>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-sm text-muted-foreground">Loading notes...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-20 px-4">
            <p className="text-sm text-red-500">Failed to load notes</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex items-center justify-center h-20 px-4">
            <p className="text-sm text-muted-foreground">No notes yet. Create one!</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-1 p-2">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="flex items-center group"
                >
                  <Button
                    variant={selectedNoteId === note.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left font-normal truncate pr-8"
                    onClick={() => onSelectNote(note.id)}
                  >
                    {note.title}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => handleDeleteClick(e, note.id)}
                    title="Delete note"
                  >
                    <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
