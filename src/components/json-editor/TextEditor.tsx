"use client";

import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    readOnly?: boolean;
}

export default function TextEditor({ value, onChange, error, readOnly = false }: TextEditorProps) {
    const { theme } = useTheme();

    return (
        <div className="h-full flex flex-col">
            <Editor
                height="100%"
                defaultLanguage="json"
                value={value}
                onChange={(newValue) => onChange(newValue || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    folding: true,
                    formatOnPaste: true,
                    formatOnType: true,
                }}
                loading={
                    <div className="flex items-center justify-center h-[500px] text-sm text-muted-foreground">
                        Loading editor...
                    </div>
                }
            />
            {error && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-destructive/10 border-t border-destructive/20">
                    <p className="text-xs text-destructive font-mono">{error}</p>
                </div>
            )}
        </div>
    );
}
