"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ChevronsDown,
    ChevronsUp,
    Search,
    Plus,
    AlertCircle
} from 'lucide-react';
import TreeNode from './TreeNode';
import { JSONValue } from './types';

interface TreeViewProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
}

export default function TreeView({ value, onChange, error }: TreeViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    let parsed: JSONValue = null;
    let parseError: string | null = null;

    try {
        if (value.trim()) {
            parsed = JSON.parse(value);
        }
    } catch (err) {
        parseError = err instanceof Error ? err.message : 'Invalid JSON';
    }

    const handleEdit = (path: (string | number)[], newValue: JSONValue) => {
        try {
            const current = JSON.parse(value);
            setValueByPath(current, path, newValue);
            onChange(JSON.stringify(current, null, 2));
        } catch (err) {
            console.error('Failed to edit:', err);
        }
    };

    const handleDelete = (path: (string | number)[]) => {
        try {
            const current = JSON.parse(value);
            deleteByPath(current, path);
            onChange(JSON.stringify(current, null, 2));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleAdd = (path: (string | number)[]) => {
        try {
            const current = JSON.parse(value);
            const parent = getValueByPath(current, path);

            if (Array.isArray(parent)) {
                parent.push('');
            } else if (typeof parent === 'object' && parent !== null) {
                let newKey = 'newProperty';
                let counter = 1;
                while (newKey in parent) {
                    newKey = `newProperty${counter}`;
                    counter++;
                }
                (parent as Record<string, JSONValue>)[newKey] = '';
            }

            onChange(JSON.stringify(current, null, 2));
        } catch (err) {
            console.error('Failed to add:', err);
        }
    };

    const expandAll = () => {
        const paths = new Set<string>();
        const collectPaths = (obj: JSONValue, currentPath: (string | number)[] = []) => {
            if (obj !== null && typeof obj === 'object') {
                paths.add(JSON.stringify(currentPath));
                if (Array.isArray(obj)) {
                    obj.forEach((item, index) => {
                        collectPaths(item, [...currentPath, index]);
                    });
                } else {
                    Object.entries(obj).forEach(([key, val]) => {
                        collectPaths(val, [...currentPath, key]);
                    });
                }
            }
        };
        if (parsed) {
            collectPaths(parsed);
            setExpandedPaths(paths);
        }
    };

    const collapseAll = () => {
        setExpandedPaths(new Set());
    };

    if (parseError || error) {
        return (
            <div className="p-4 h-full flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Cannot display tree view: {parseError || error}
                        <div className="mt-2 text-xs">
                            Please fix JSON errors in Text mode or use the Repair feature.
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!parsed) {
        return (
            <div className="p-4 h-full flex items-center justify-center text-sm text-muted-foreground">
                Paste or type JSON to view as tree...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
                <div className="flex-1 flex items-center gap-2">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <Input
                        placeholder="Search in tree..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-7 text-xs flex-1"
                    />
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={expandAll}
                    className="h-7 px-2 text-xs gap-1"
                >
                    <ChevronsDown className="h-3 w-3" />
                    <span className="hidden sm:inline">Expand All</span>
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={collapseAll}
                    className="h-7 px-2 text-xs gap-1"
                >
                    <ChevronsUp className="h-3 w-3" />
                    <span className="hidden sm:inline">Collapse All</span>
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAdd([])}
                    className="h-7 px-2 text-xs gap-1"
                >
                    <Plus className="h-3 w-3" />
                    <span className="hidden sm:inline">Add Root</span>
                </Button>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto p-2">
                {typeof parsed === 'object' && parsed !== null ? (
                    Array.isArray(parsed) ? (
                        <div className="space-y-0.5">
                            {parsed.map((item, index) => {
                                const path = [index];
                                const pathKey = JSON.stringify(path);
                                return (
                                    <TreeNode
                                        key={pathKey}
                                        label={`[${index}]`}
                                        value={item}
                                        path={path}
                                        isExpanded={expandedPaths.has(pathKey)}
                                        onToggle={() => {
                                            const newPaths = new Set(expandedPaths);
                                            if (newPaths.has(pathKey)) {
                                                newPaths.delete(pathKey);
                                            } else {
                                                newPaths.add(pathKey);
                                            }
                                            setExpandedPaths(newPaths);
                                        }}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAdd={handleAdd}
                                        level={0}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {Object.entries(parsed).map(([key, val]) => {
                                const path = [key];
                                const pathKey = JSON.stringify(path);
                                return (
                                    <TreeNode
                                        key={pathKey}
                                        label={key}
                                        value={val}
                                        path={path}
                                        isExpanded={expandedPaths.has(pathKey)}
                                        onToggle={() => {
                                            const newPaths = new Set(expandedPaths);
                                            if (newPaths.has(pathKey)) {
                                                newPaths.delete(pathKey);
                                            } else {
                                                newPaths.add(pathKey);
                                            }
                                            setExpandedPaths(newPaths);
                                        }}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAdd={handleAdd}
                                        level={0}
                                    />
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="text-sm text-muted-foreground p-4">
                        Primitive value: <span className="font-mono">{String(parsed)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper functions
function setValueByPath(obj: any, path: (string | number)[], value: JSONValue) {
    let current = obj;

    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
}

function deleteByPath(obj: any, path: (string | number)[]) {
    let current = obj;

    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }

    const lastKey = path[path.length - 1];
    if (Array.isArray(current)) {
        current.splice(Number(lastKey), 1);
    } else {
        delete current[lastKey];
    }
}

function getValueByPath(obj: any, path: (string | number)[]): JSONValue {
    if (path.length === 0) return obj;
    let current = obj;

    for (const part of path) {
        current = current[part];
    }

    return current;
}
