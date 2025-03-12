'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NoteEditorProps } from './types';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import { getAuth } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';
import styles from './NoteEditor.module.css';
import debounce from 'lodash/debounce';

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
  const editorInstanceRef = useRef<EditorInstance | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const contentRef = useRef<OutputData | null>(null);
  const titleValueRef = useRef<string>('');
  const savingRef = useRef<boolean>(false);
  const editorReadyRef = useRef<boolean>(false);
  const isTypingRef = useRef<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());
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
      if (titleRef.current) {
        titleRef.current.textContent = currentNote.title;
      }
    }
  }, [currentNote?.title]);

  // Track user activity to detect when typing has stopped
  const updateUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    isTypingRef.current = true;
    
    // Cancel any visible saving indicators immediately
    setIsSaving(false);
  }, []);
  
  // Save function that doesn't interfere with typing
  const saveContent = useCallback(async () => {
    // Only save if:
    // 1. Not currently in a save operation
    // 2. Editor is ready
    // 3. User is authenticated
    // 4. Enough time has passed since last typing activity (1500ms)
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityRef.current;
    
    if (
      savingRef.current || 
      !editorRef.current || 
      !editorReadyRef.current || 
      !auth.currentUser ||
      timeSinceLastActivity < 1500 ||
      isTypingRef.current
    ) {
      return;
    }
    
    try {
      // Mark as saving to prevent concurrent saves
      savingRef.current = true;
      
      // Only show saving indicator if user hasn't typed for a while
      if (timeSinceLastActivity > 2000) {
        setIsSaving(true);
      }
      
      // Get editor content without affecting cursor
      const outputData = await editorRef.current.save();
      const currentTitle = titleValueRef.current.trim() || 'Untitled Note';
      
      // Check if content has actually changed
      const contentJSON = JSON.stringify(outputData);
      if (contentJSON === lastSavedContentRef.current && currentTitle === currentNote?.title) {
        savingRef.current = false;
        setIsSaving(false);
        return;
      }
      
      // Perform the save
      await onSave({
        title: currentTitle,
        content: outputData
      });
      
      // Update last saved content reference
      lastSavedContentRef.current = contentJSON;
      
      // Clear saving state
      savingRef.current = false;
      
      // Only update UI if we're not currently typing
      if (Date.now() - lastActivityRef.current > 1000) {
        setTimeout(() => setIsSaving(false), 300);
      } else {
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to save note');
      }
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [currentNote, onSave, auth]);
  
  // Highly optimized debounced save that waits for typing to finish
  const debouncedSaveRef = useRef(
    debounce(() => {
      // Reset typing flag after debounce period
      isTypingRef.current = false;
      saveContent();
    }, 2000, { 
      leading: false,
      trailing: true,
      maxWait: 5000 
    })
  );
  
  // Setup background autosave interval
  useEffect(() => {
    // Check every 3 seconds if we should save
    const intervalId = setInterval(() => {
      // Only attempt saving if not currently typing
      if (!isTypingRef.current && Date.now() - lastActivityRef.current > 2000) {
        saveContent();
      }
    }, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [saveContent]);
  
  // Handler for editor changes - triggers autosave
  const handleEditorChange = useCallback(() => {
    // Update activity timestamp
    updateUserActivity();
    
    // Queue up a debounced save
    debouncedSaveRef.current();
  }, [updateUserActivity]);
  
  // Initialize Editor.js - only once per note ID change
  useEffect(() => {
    if (currentNote?.id) {
      setEditorInitialized(false);
      editorReadyRef.current = false;
    }
  }, [currentNote?.id]);

  // Reset everything when a new note is created
  useEffect(() => {
    if (!currentNote?.id) {
      // Reset editor state
      setEditorInitialized(false);
      editorReadyRef.current = false;
      isTypingRef.current = false;
      
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
  
  // Initialize Editor.js - only when currentNote changes
  useEffect(() => {
    const noteIdentifier = currentNote ? 
      `${currentNote.id || 'new'}-${currentNote.updatedAt || Date.now()}` : null;
    
    if (noteIdentifier) {
      setEditorInitialized(false);
      editorReadyRef.current = false;
    }
  }, [currentNote?.id, currentNote?.updatedAt]);

  // Handle editor initialization
  useEffect(() => {
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
                preserveBlank: false,
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
          minHeight: 100,
          
          // Optimized onChange handler to prevent cursor issues
          onChange: handleEditorChange,
          
          onReady: () => {
            if (isMounted) {
              editorReadyRef.current = true;
              setEditorInitialized(true);
              
              if (!editorElement) return;
              editorElement.style.minHeight = "300px";

              // Combined keyboard event handler
              const handleKeyEvents = (e: KeyboardEvent) => {
                // Update activity tracking on any key event
                updateUserActivity();
                
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

              // Event listeners with activity tracking
              editorElement.addEventListener('keydown', handleKeyEvents, true);
              editorElement.addEventListener('keypress', handleKeyEvents, true);
              editorElement.addEventListener('mousedown', updateUserActivity);
              editorElement.addEventListener('click', updateUserActivity);
              editorElement.addEventListener('focus', updateUserActivity);
            }
          }
        });
        
        editorRef.current = editor;
        
      } catch (error) {
        console.error('Editor initialization error:', error);
        setEditorInitialized(true); // Mark as initialized to prevent infinite retry
      }
    };
    
    initializeEditor();
    
    return () => {
      isMounted = false;
      if (debouncedSaveRef.current && typeof debouncedSaveRef.current.cancel === 'function') {
        debouncedSaveRef.current.cancel();
      }
    };
  }, [currentNote, error, handleEditorChange, updateUserActivity]);
  
  // Cleanup editor and timers on component unmount
  useEffect(() => {
    return () => {
      // Cancel any pending debounced functions
      if (debouncedSaveRef.current && typeof debouncedSaveRef.current.cancel === 'function') {
        debouncedSaveRef.current.cancel();
      }
      
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
      
      // Remove any global event listeners
      const editorElement = document.getElementById(editorContainerId);
      if (editorElement) {
        editorElement.removeEventListener('mousedown', updateUserActivity);
        editorElement.removeEventListener('click', updateUserActivity);
        editorElement.removeEventListener('focus', updateUserActivity);
      }
    };
  }, [updateUserActivity]);

  // Track title changes
  const handleTitleChange = (event: React.FormEvent<HTMLHeadingElement>) => {
    const newTitle = event.currentTarget.textContent || '';
    titleValueRef.current = newTitle;
    
    // Update activity timestamp to indicate typing
    updateUserActivity();
    
    // Queue up a debounced save
    debouncedSaveRef.current();
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
      <CardContent className="p-0 flex flex-col">
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
