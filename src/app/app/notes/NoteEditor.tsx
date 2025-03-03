'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { NoteEditorProps } from './types';
import type EditorJS from '@editorjs/editorjs';

function NoteEditor({ currentNote, onSave }: NoteEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  interface EditorInstance {
    EditorJS: typeof EditorJS;
    tools: {
      header: typeof import('@editorjs/header').default;
      list: typeof import('@editorjs/list').default;
      quote: typeof import('@editorjs/quote').default;
      code: typeof import('@editorjs/code').default;
      paragraph: typeof import('@editorjs/paragraph').default;
    };
  }
  const editorInstanceRef = useRef<EditorInstance | null>(null); // Store the EditorJS class
  const [title, setTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const editorContainerId = 'editorjs';
  
  // Initialize Editor.js
  useEffect(() => {
    let isMounted = true;
    
    const initializeEditor = async () => {
      try {
        // Clean up existing editor instance if it exists
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
        
        if (!isMounted) return;
        
        // Import necessary packages
        if (!editorInstanceRef.current) {
          const EditorJSPackage = await import('@editorjs/editorjs');
          const Header = (await import('@editorjs/header')).default;
          const List = (await import('@editorjs/list')).default;
          const Quote = (await import('@editorjs/quote')).default;
          const CodeTool = (await import('@editorjs/code')).default;
          const Paragraph = (await import('@editorjs/paragraph')).default;
          
          editorInstanceRef.current = {
            EditorJS: EditorJSPackage.default,
            tools: {
              header: Header,
              list: List,
              quote: Quote,
              code: CodeTool,
              paragraph: Paragraph
            }
          };
        }
        
        // Clear the editor container to prevent duplicate instances
        const editorElement = document.getElementById(editorContainerId);
        if (editorElement) {
          editorElement.innerHTML = '';
        }
        
        if (!isMounted) return;
        
        // Get current note content or use empty template
        const contentData = currentNote?.content || {
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
        
        // Set the title from current note
        setTitle(currentNote?.title || '');
        
        // Create a new editor instance
        const { EditorJS, tools } = editorInstanceRef.current;
        const editor = new EditorJS({
          holder: editorContainerId,
          tools,
          placeholder: 'Start typing your note here...',
          data: contentData,
          autofocus: true,
          onReady: () => {
            if (isMounted) {
              setIsEditorReady(true);
            }
          }
        });
        
        editorRef.current = editor;
        
      } catch (error) {
        console.error('Editor initialization error:', error);
      }
    };
    
    // Initialize the editor
    initializeEditor();
    
    // Cleanup
    return () => {
      isMounted = false;
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
    };
  }, [currentNote]);

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
        <div id={editorContainerId} className="min-h-[500px] p-4" />
      </CardContent>
    </Card>
  );
}

export default NoteEditor;
