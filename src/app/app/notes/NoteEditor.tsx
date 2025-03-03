'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { NoteEditorProps } from './types';
import type EditorJS from '@editorjs/editorjs';

function NoteEditor({ currentNote, onSave }: NoteEditorProps) {
  const editorRef = useRef<EditorJS>(null);
  const [title, setTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  
  // Initialize Editor.js
  useEffect(() => {
    let EditorJS: any;
    
    const initEditor = async () => {
      if (typeof window === 'undefined') return;
      
      const EditorJSPackage = await import('@editorjs/editorjs');
      EditorJS = EditorJSPackage.default;
      
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;
      const Quote = (await import('@editorjs/quote')).default;
      const CodeTool = (await import('@editorjs/code')).default;
      const Paragraph = (await import('@editorjs/paragraph')).default;

      try {
        // Destroy existing instance if it exists
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
        
        // Create new instance
        const editor = new EditorJS({
          holder: 'editorjs',
          tools: {
            header: Header,
            list: List,
            quote: Quote,
            code: CodeTool,
            paragraph: {
              config: {
                inlineToolbar: true,
              },
              class: Paragraph,
            }
          },
          placeholder: 'Start typing your note here...',
          onReady: () => {
            editorRef.current = editor;
            setIsEditorReady(true);
            
            // If we have a currentNote already, load it now
            if (currentNote) {
              loadNoteContent();
            }
          },
          autofocus: true,
          data: currentNote?.content || {
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
        });
      } catch (error) {
        console.error('Editor initialization error:', error);
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
        setIsEditorReady(false);
      }
    };
  }, []); // Only run once on component mount

  // Function to load note content into editor
  const loadNoteContent = () => {
    if (!editorRef.current || !isEditorReady || !currentNote) return;
    
    try {
      // Instead of clear + render, we recreate the editor with the new data
      const currentData = currentNote.content || {
        time: Date.now(),
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ]
      };
      
      // Use EditorJS's data replacement method
      editorRef.current.render(currentData);
      setTitle(currentNote.title || '');
      
    } catch (error) {
      console.error('Error loading note content:', error);
    }
  };

  // Handle note changes
  useEffect(() => {
    if (!currentNote) {
      setTitle('');
      return;
    }
    
    // Check if we're switching to a different note
    if (currentNote.id !== currentNoteId) {
      setCurrentNoteId(currentNote.id);
      setTitle(currentNote.title || '');
      
      // If editor is ready, load the content
      if (editorRef.current && isEditorReady) {
        // Small delay to ensure the editor is fully ready
        setTimeout(() => {
          try {
            // First destroy and recreate the editor to avoid block removal errors
            editorRef.current.destroy();
            editorRef.current = null;
            setIsEditorReady(false);
            
            // Reinitialize the editor with the new content
            const initEditor = async () => {
              if (typeof window === 'undefined') return;
              
              const EditorJSPackage = await import('@editorjs/editorjs');
              const EditorJS = EditorJSPackage.default;
              
              const Header = (await import('@editorjs/header')).default;
              const List = (await import('@editorjs/list')).default;
              const Quote = (await import('@editorjs/quote')).default;
              const CodeTool = (await import('@editorjs/code')).default;
              const Paragraph = (await import('@editorjs/paragraph')).default;
              
              const editor = new EditorJS({
                holder: 'editorjs',
                tools: {
                  header: Header,
                  list: List,
                  quote: Quote,
                  code: CodeTool,
                  paragraph: {
                    config: {
                      inlineToolbar: true,
                    },
                    class: Paragraph,
                  }
                },
                placeholder: 'Start typing your note here...',
                onReady: () => {
                  editorRef.current = editor;
                  setIsEditorReady(true);
                },
                autofocus: true,
                data: currentNote.content
              });
            };
            
            initEditor();
          } catch (err) {
            console.error('Error switching notes:', err);
          }
        }, 50);
      }
    }
  }, [currentNote, isEditorReady, currentNoteId]);

  const handleSave = async () => {
    if (!editorRef.current) return;
    
    try {
      setIsSaving(true);
      const outputData = await editorRef.current.save();
      
      await onSave({
        title: title.trim() || 'Untitled Note',
        content: outputData
      });
      
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="px-4 py-3 space-y-2">
        <Input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !isEditorReady} 
          className="self-end"
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <div id="editorjs" className="min-h-[500px] p-4" />
      </CardContent>
    </Card>
  );
}

export default NoteEditor;
