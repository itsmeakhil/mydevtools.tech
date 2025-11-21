"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, Copy, CheckCircle } from 'lucide-react';
import { JSONPath } from 'jsonpath-plus';

interface TransformDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
    onApply?: (result: string) => void;
}

export default function TransformDialog({
    open,
    onOpenChange,
    content,
    onApply,
}: TransformDialogProps) {
    const [query, setQuery] = useState('$');
    const [result, setResult] = useState<{ data: any; error: string | null }>({
        data: null,
        error: null,
    });
    const [copied, setCopied] = useState(false);

    const handleQuery = () => {
        if (!content) {
            setResult({ data: null, error: 'No JSON content to query' });
            return;
        }

        try {
            const parsed = JSON.parse(content);
            const queryResult = JSONPath({ path: query, json: parsed });

            setResult({ data: queryResult, error: null });
        } catch (err) {
            setResult({
                data: null,
                error: err instanceof Error ? err.message : 'Query execution failed',
            });
        }
    };

    const handleCopy = async () => {
        if (!result.data) return;

        try {
            await navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleApply = () => {
        if (result.data && onApply) {
            onApply(JSON.stringify(result.data, null, 2));
            onOpenChange(false);
        }
    };

    const handleClose = () => {
        setQuery('$');
        setResult({ data: null, error: null });
        setCopied(false);
        onOpenChange(false);
    };

    // Common example queries
    const exampleQueries = [
        { label: 'Root', query: '$' },
        { label: 'All values', query: '$..*' },
        { label: 'Array items', query: '$[*]' },
        { label: 'Filter by property', query: '$[?(@.age > 18)]' },
    ];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        JSONPath Query
                    </DialogTitle>
                    <DialogDescription>
                        Extract and transform JSON data using JSONPath expressions
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {/* Query Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">JSONPath Expression</label>
                        <div className="flex gap-2">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., $.users[*].name"
                                className="flex-1 font-mono text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleQuery();
                                    }
                                }}
                            />
                            <Button onClick={handleQuery}>
                                <Search className="h-4 w-4 mr-2" />
                                Query
                            </Button>
                        </div>
                    </div>

                    {/* Example Queries */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Common Queries
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {exampleQueries.map(({ label, query: exampleQuery }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs font-mono"
                                    onClick={() => setQuery(exampleQuery)}
                                >
                                    {label}: <span className="ml-1 text-primary">{exampleQuery}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Result */}
                    {result.error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                    ) : result.data !== null ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Result</label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopy}
                                        className="h-7 text-xs"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="border rounded-lg p-3 bg-muted/30 max-h-[300px] overflow-y-auto">
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </div>
                            {Array.isArray(result.data) && (
                                <p className="text-xs text-muted-foreground">
                                    Found {result.data.length} item{result.data.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
                            Enter a JSONPath expression and click Query to see results
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="border rounded-lg p-3 bg-muted/10">
                        <p className="text-xs font-semibold mb-2">JSONPath Syntax Guide:</p>
                        <ul className="text-xs space-y-1 text-muted-foreground font-mono">
                            <li><span className="text-primary">$</span> - Root object</li>
                            <li><span className="text-primary">@</span> - Current object</li>
                            <li><span className="text-primary">.property</span> - Select property</li>
                            <li><span className="text-primary">[index]</span> - Array index</li>
                            <li><span className="text-primary">[*]</span> - All array elements</li>
                            <li><span className="text-primary">..*</span> - Recursive descent</li>
                            <li><span className="text-primary">[?(@.age &gt; 18)]</span> - Filter expression</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {onApply && result.data !== null && (
                        <Button onClick={handleApply}>
                            Apply to Editor
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
