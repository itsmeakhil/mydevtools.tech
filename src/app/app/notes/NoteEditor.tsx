'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { NoteEditorProps } from './types';
import type EditorJS from '@editorjs/editorjs';
import { getAuth } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';
import styles from './NoteEditor.module.css';

function NoteEditor({ currentNote, onSave }: NoteEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
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
              config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              },
              toolbox: [
                {
                  title: 'Heading 1',
                  icon: '<svg width="28" height="24" viewBox="0 0 28 24"><text x="3" y="17" font-family="Arial" font-size="16" font-weight="bold" fill="currentColor">H1</text></svg>',
                  data: { level: 1 }
                },
                {
                  title: 'Heading 2',
                  icon: '<svg width="28" height="24" viewBox="0 0 28 24"><text x="3" y="17" font-family="Arial" font-size="16" font-weight="bold" fill="currentColor">H2</text></svg>',
                  data: { level: 2 }
                },
                {
                  title: 'Heading 3',
                  icon: '<svg width="28" height="24" viewBox="0 0 28 24"><text x="3" y="17" font-family="Arial" font-size="16" font-weight="bold" fill="currentColor">H3</text></svg>',
                  data: { level: 3 }
                },
                {
                  title: 'Heading 4',
                  icon: '<svg width="28" height="24" viewBox="0 0 28 24"><text x="3" y="17" font-family="Arial" font-size="16" font-weight="bold" fill="currentColor">H4</text></svg>',
                  data: { level: 4 }
                },
                {
                  title: 'Heading 5',
                  icon: '<svg width="28" height="24" viewBox="0 0 28 24"><text x="3" y="17" font-family="Arial" font-size="16" font-weight="bold" fill="currentColor">H5</text></svg>',
                  data: { level: 5 }
                },
                {
                  title: 'Heading 6',
                  icon: '<svg width="28" height="24" viewBox="0 0 28 24"><text x="3" y="17" font-family="Arial" font-size="16" font-weight="bold" fill="currentColor">H6</text></svg>',
                  data: { level: 6 }
                }
              ]
            },
            paragraph: {
              class: tools.paragraph,
              inlineToolbar: true
            },
            list: {
              class: tools.list,
              inlineToolbar: true
            },
            quote: {
              class: tools.quote,
              inlineToolbar: true
            },
            code: {
              class: tools.code
            },
            table: {
              class: tools.table,
              inlineToolbar: true,
              toolbox: {
                title: 'Table',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7v2h2V7H7zm4 0v2h2V7h-2zm4 0v2h2V7h-2zM7 11v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zM7 15v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z"/></svg>'
              }
            }
          },
          defaultBlock: 'paragraph',
          placeholder: 'Press Tab or click + to insert blocks...',
          inlineToolbar: ['link', 'bold', 'italic'],
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
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-destructive">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div id={editorContainerId} className={`min-h-[500px] p-4 pl-16 ${styles.editorContainer}`} />
      </CardContent>
    </Card>
  );
}

export default NoteEditor;
