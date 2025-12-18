"use client";

import { Editor, OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useRef } from 'react';

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    readOnly?: boolean;
}

export default function TextEditor({ value, onChange, readOnly = false }: TextEditorProps) {
    const { theme } = useTheme();
    const editorRef = useRef<any>(null);

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    return (
        <div className="h-full flex flex-col relative">
            <Editor
                height="100%"
                defaultLanguage="json"
                value={value}
                onChange={(newValue) => onChange(newValue || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                onMount={handleEditorMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    folding: true,
                    foldingHighlight: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    bracketPairColorization: { enabled: true },
                    guides: {
                        bracketPairs: true,
                        indentation: true,
                    },
                    padding: { top: 12, bottom: 12 },
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                }}
                loading={
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>Loading editor...</span>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
