'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NoteEditorProps } from './types';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
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
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const contentRef = useRef<OutputData | null>(null); // Store content in ref to avoid state updates
  const titleValueRef = useRef<string>('');
  const savingRef = useRef<boolean>(false);
  const editorReadyRef = useRef<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editorInitialized, setEditorInitialized] = useState<boolean>(false);
  const auth = getAuth();
  const editorContainerId = 'editorjs';
  
  // Check if user can edit this note
  useEffect(() => {
    const user = auth.currentUser;
    if (currentNote?.id && currentNote?.created_by && user) {
      if (currentNote.created_by !== user.uid) {
        setError("You don't have permission to edit this note");
        editorReadyRef.current = false;
      } else {
        setError(null);
      }
    }
  }, [currentNote, auth]);
  
  // Update the title ref without triggering state updates
  useEffect(() => {
    if (currentNote?.title) {
      titleValueRef.current = currentNote.title;
      // Update the actual DOM element if it exists
      if (titleRef.current) {
        titleRef.current.textContent = currentNote.title;
      }
    }
  }, [currentNote?.title]);

  // Debounced auto-save function
  const debouncedSave = useCallback(async () => {
    // Prevent saving if another save operation is in progress
    if (savingRef.current || !editorRef.current || !auth.currentUser || !editorReadyRef.current) return;
    
    try {
      savingRef.current = true;
      // Only update UI state after a short delay to prevent constant flickering
      const saveIndicatorTimeout = setTimeout(() => setIsSaving(true), 500);
      
      const outputData = await editorRef.current.save();
      contentRef.current = outputData; // Store in ref
      const currentTitle = titleValueRef.current.trim() || 'Untitled Note';
      
      // Create a simple hash of the content to avoid unnecessary saves
      const contentJSON = JSON.stringify(outputData);
      if (contentJSON === lastSavedContentRef.current && currentTitle === currentNote?.title) {
        clearTimeout(saveIndicatorTimeout);
        savingRef.current = false;
        setIsSaving(false);
        return;
      }
      
      await onSave({
        title: currentTitle,
        content: outputData
      });
      
      lastSavedContentRef.current = contentJSON;
      
      // Clear the save indicator after a short delay to prevent UI jumping
      setTimeout(() => {
        setIsSaving(false);
        savingRef.current = false;
      }, 300);
      
      clearTimeout(saveIndicatorTimeout);
    } catch (error) {
      console.error('Failed to auto-save note:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to save note');
      }
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [currentNote, onSave, auth]);
  
  // Trigger auto-save when content changes with massive debounce
  const triggerAutoSave = useCallback(() => {
    // Clear existing timeout to prevent multiple saves
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set a new timeout with a much longer delay (3.5 seconds)
    autoSaveTimeoutRef.current = setTimeout(() => {
      debouncedSave();
    }, 3500);
  }, [debouncedSave]);
  
  // Initialize Editor.js - only once per note ID change
  useEffect(() => {
    // Reset editor state when note changes
    if (currentNote?.id) {
      setEditorInitialized(false);
      editorReadyRef.current = false;
    }
  }, [currentNote?.id]);

  // Reset everything when a new note is created
  useEffect(() => {
    // For new notes (when there's no ID), completely reset the editor
    if (!currentNote?.id) {
      // Reset editor state
      setEditorInitialized(false);
      editorReadyRef.current = false;
      
      // Force destroy the editor if it exists
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
      
      // Clear the DOM element directly
      const editorElement = document.getElementById(editorContainerId);
      if (editorElement) {
        editorElement.innerHTML = '';
      }
      
      // Reset all refs
      contentRef.current = null;
      lastSavedContentRef.current = '';
      titleValueRef.current = '';
      
      // Ensure title is cleared
      if (titleRef.current) {
        titleRef.current.textContent = '';
      }
    }
  }, [currentNote?.id]);
  
  // Initialize Editor.js - only when currentNote changes (especially its ID or content)
  useEffect(() => {
    // We use a more comprehensive check to determine when to reinitialize
    const noteIdentifier = currentNote ? 
      `${currentNote.id || 'new'}-${currentNote.updatedAt || Date.now()}` : null;
    
    if (noteIdentifier) {
      setEditorInitialized(false);
      editorReadyRef.current = false;
    }
  }, [currentNote?.id, currentNote?.updatedAt]);

  // Handle actual editor initialization in a separate effect to prevent re-runs
  useEffect(() => {
    // Only run initialization once per note ID change
    if (editorInitialized || !currentNote || error) return;
    
    console.log('Initializing editor with note:', currentNote.id || 'new note');
    
    let isMounted = true;
    const initializeEditor = async () => {
      try {
        // Clean up existing editor instance if it exists
        if (editorRef.current && typeof editorRef.current.destroy === 'function') {
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
        const contentData = currentNote.id ? currentNote.content : {
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
        
        // Store in refs
        contentRef.current = contentData;
        titleValueRef.current = currentNote?.title || '';
        lastSavedContentRef.current = JSON.stringify(contentData);
        
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
              inlineToolbar: true,
              config: {
                preserveBlank: false, // Don't create empty paragraphs automatically
                placeholder: 'Type text or press "/" for commands...'
              }
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
          // Configure to use smaller baseline blocks
          minHeight: 100, // Set a smaller minimum height
          onChange: () => {
            // Trigger auto-save on editor content change - with massive debounce
            triggerAutoSave();
          },
          onReady: () => {
            if (isMounted) {
              editorReadyRef.current = true;
              setEditorInitialized(true);
              if (!editorElement) return;
              
              // Ensure editor element maintains height
              editorElement.style.minHeight = "300px";

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
            }
          }
        });
        
        editorRef.current = editor;
        
      } catch (error) {
        console.error('Editor initialization error:', error);
        setEditorInitialized(true); // Mark as initialized to prevent infinite retry
      }
    };
    
    // Initialize the editor
    initializeEditor();
    
    // Cleanup
    return () => {
      isMounted = false;
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentNote, error, triggerAutoSave, editorInitialized]);
  
  // Cleanup editor on component unmount
  useEffect(() => {
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
    };
  }, []);

  // Update title handling with auto-save, using refs to avoid state updates
  const handleTitleChange = (event: React.FormEvent<HTMLHeadingElement>) => {
    const newTitle = event.currentTarget.textContent || '';
    titleValueRef.current = newTitle; // Store in ref instead of state
    triggerAutoSave();
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
    <Card className="flex flex-col h-full">
      <CardContent className="p-0 flex flex-col"> {/* Remove h-full to allow natural growth */}
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
          {isSaving && (
            <div className={styles.savingIndicator}>
              <span className={styles.savingDot}></span>
              <span>Saving...</span>
            </div>
          )}
        </div>
        <div className={styles.editorContainer}>
          <div id="editorjs" className={styles.editorContent} />
        </div>
      </CardContent>
    </Card>
  );
}

export default NoteEditor;
