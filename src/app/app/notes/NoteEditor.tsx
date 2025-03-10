'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NoteEditorProps } from './types';
import type EditorJS from '@editorjs/editorjs';
import { getAuth } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';
import styles from './NoteEditor.module.css';

function NoteEditor({ currentNote, onSave }: NoteEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  interface EditorInstance {
    EditorJS: typeof EditorJS;
    tools: {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      [key: string]: any; // Necessary for EditorJS tool types compatibility
      /* eslint-enable @typescript-eslint/no-explicit-any */
    };
  }
  const editorInstanceRef = useRef<EditorInstance | null>(null); // Store the EditorJS class
  const [title, setTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const editorContainerId = 'editorjs';
  
  // Check if user can edit this note
  useEffect(() => {
    const user = auth.currentUser;
    if (currentNote?.id && currentNote?.created_by && user) {
      if (currentNote.created_by !== user.uid) {
        setError("You don't have permission to edit this note");
        setIsEditorReady(false);
      } else {
        setError(null);
      }
    }
  }, [currentNote, auth]);
  
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
          const Table = (await import('@editorjs/table')).default;
          
          editorInstanceRef.current = {
            EditorJS: EditorJSPackage.default,
            tools: {
              header: Header,
              list: List,
              quote: Quote,
              code: CodeTool,
              paragraph: Paragraph,
              table: Table
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
          tools: {
            header: {
              class: tools.header,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+H',
              config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              }
            },
            paragraph: {
              class: tools.paragraph,
              inlineToolbar: true
            },
            list: {
              class: tools.list,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+L'
            },
            quote: {
              class: tools.quote,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+O'
            },
            code: {
              class: tools.code,
              shortcut: 'CMD+SHIFT+C'
            },
            table: {
              class: tools.table,
              inlineToolbar: true
            }
          },
          defaultBlock: 'paragraph',
          placeholder: 'Press "/" for commands...',
          inlineToolbar: ['link', 'bold', 'italic'],
          data: contentData,
          autofocus: true,
          onReady: () => {
            if (isMounted) {
              setIsEditorReady(true);
              
              const editorElement = document.getElementById(editorContainerId);
              if (!editorElement) return;

              // Combined keyboard event handler
              const handleKeyEvents = (e: KeyboardEvent) => {
                // Handle Tab key
                if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  const plusButton = document.querySelector('.ce-toolbar__plus') as HTMLElement;
                  if (plusButton) {
                    plusButton.click();
                  }
                }
                
                // Handle slash command
                if (e.key === '/' && e.type === 'keypress') {
                  e.preventDefault();
                  e.stopPropagation();
                  const plusButton = document.querySelector('.ce-toolbar__plus') as HTMLElement;
                  if (plusButton) {
                    plusButton.click();
                  }
                }
              };

              // Add both event listeners with the same handler
              editorElement.addEventListener('keydown', handleKeyEvents, true);
              editorElement.addEventListener('keypress', handleKeyEvents, true);

              // Cleanup function
              return () => {
                editorElement.removeEventListener('keydown', handleKeyEvents, true);
                editorElement.removeEventListener('keypress', handleKeyEvents, true);
              };
            }
          }
        });
        
        editorRef.current = editor;
        
      } catch (error) {
        console.error('Editor initialization error:', error);
      }
    };
    
    // Initialize the editor
    if (!error) {
      initializeEditor();
    }
    
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
  }, [currentNote, error]);

  // Update title handling
  const handleTitleChange = (event: React.FormEvent<HTMLHeadingElement>) => {
    setTitle(event.currentTarget.textContent || '');
  };

  // Update handleSave
  const handleSave = async () => {
    if (!editorRef.current || !auth.currentUser) return;
    
    try {
      setIsSaving(true);
      const outputData = await editorRef.current.save();
      
      await onSave({
        title: title.trim() || 'Untitled Note',
        content: outputData
      });
      
    } catch (error) {
      console.error('Failed to save note:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to save note');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <Card className="flex flex-col h-full">
        <CardContent className="flex items-center justify-center flex-1 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="p-0">
        <div className={styles.titleContainer}>
          <h1
            ref={titleRef}
            className={styles.noteTitle}
            contentEditable
            onInput={handleTitleChange}
            suppressContentEditableWarning
            data-placeholder="Untitled Note"
          >
            {currentNote?.title || ''}
          </h1>
          <Button
            onClick={handleSave}
            disabled={!isEditorReady || isSaving}
            className={styles.saveButton}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <div className={styles.editorContainer}>
          <div id="editorjs" />
        </div>
      </CardContent>
    </Card>
  );
}

export default NoteEditor;
