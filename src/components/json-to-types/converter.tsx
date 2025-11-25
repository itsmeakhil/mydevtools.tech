"use client";

import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from '@/components/ui/code-editor';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'swift', label: 'Swift' },
    { value: 'python', label: 'Python' },
    { value: 'go', label: 'Go' },
    { value: 'csharp', label: 'C#' },
    { value: 'java', label: 'Java' },
    { value: 'rust', label: 'Rust' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'dart', label: 'Dart' },
    { value: 'cpp', label: 'C++' },
];

export default function Converter() {
    const [jsonInput, setJsonInput] = useState('{\n  "name": "MyDevTools",\n  "version": 1.0,\n  "features": ["Tools", "Generators", "Converters"]\n}');
    const [targetLanguage, setTargetLanguage] = useState('typescript');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const convert = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/convert-json-to-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonInput,
                    targetLanguage,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate types');
            }

            setOutput(data.output);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to generate types. Please check your JSON input.');
            setOutput('');
        } finally {
            setIsLoading(false);
        }
    }, [jsonInput, targetLanguage]);

    // Debounce conversion
    useEffect(() => {
        const timer = setTimeout(() => {
            if (jsonInput.trim()) {
                convert();
            } else {
                setOutput('');
                setError(null);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [jsonInput, targetLanguage, convert]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Target Language:</h2>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output || !!error}
                >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied' : 'Copy Code'}
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                <Card className="flex flex-col overflow-hidden border-none shadow-md">
                    <div className="bg-muted/50 px-4 py-2 border-b text-sm font-medium text-muted-foreground flex justify-between items-center">
                        <span>JSON Input</span>
                        {error && <span className="text-destructive text-xs truncate max-w-[200px]">{error}</span>}
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <CodeEditor
                            value={jsonInput}
                            onChange={setJsonInput}
                            language="json"
                        />
                    </div>
                </Card>

                <Card className="flex flex-col overflow-hidden border-none shadow-md">
                    <div className="bg-muted/50 px-4 py-2 border-b text-sm font-medium text-muted-foreground flex justify-between items-center">
                        <span>Generated {LANGUAGES.find(l => l.value === targetLanguage)?.label}</span>
                        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <CodeEditor
                            value={output}
                            language={targetLanguage === 'csharp' ? 'csharp' : targetLanguage}
                            readOnly={true}
                        />
                        {error && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                                <div className="text-destructive max-w-md">
                                    <p className="font-semibold mb-2">Error Generating Types</p>
                                    <p className="text-sm opacity-90">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
