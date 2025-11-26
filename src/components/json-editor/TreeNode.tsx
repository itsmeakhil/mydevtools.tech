"use client";

import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, Edit2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JSONValue } from './types';

interface TreeNodeProps {
    label: string;
    value: JSONValue;
    path: string;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (path: string, newValue: JSONValue) => void;
    onDelete: (path: string) => void;
    onAdd: (path: string) => void;
    level: number;
}

export default function TreeNode({
    label,
    value,
    path,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    onAdd,
    level,
}: TreeNodeProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    const getValueType = (val: JSONValue): string => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return 'array';
        return typeof val;
    };

    const isExpandable = (val: JSONValue): boolean => {
        return val !== null && (typeof val === 'object' || Array.isArray(val));
    };

    const getDisplayValue = (val: JSONValue): string => {
        if (val === null) return 'null';
        if (typeof val === 'string') return `"${val}"`;
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'number') return val.toString();
        if (Array.isArray(val)) return `Array[${val.length}]`;
        if (typeof val === 'object') return `Object{${Object.keys(val).length}}`;
        return String(val);
    };

    const getTypeColor = (type: string): string => {
        switch (type) {
            case 'string': return 'text-green-600 dark:text-green-400';
            case 'number': return 'text-blue-600 dark:text-blue-400';
            case 'boolean': return 'text-purple-600 dark:text-purple-400';
            case 'null': return 'text-gray-500 dark:text-gray-400';
            case 'array': return 'text-orange-600 dark:text-orange-400';
            case 'object': return 'text-cyan-600 dark:text-cyan-400';
            default: return 'text-foreground';
        }
    };

    const handleStartEdit = () => {
        if (!isExpandable(value)) {
            setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
            setIsEditing(true);
        }
    };

    const handleSaveEdit = () => {
        try {
            let newValue: JSONValue;
            if (editValue === 'null') {
                newValue = null;
            } else if (editValue === 'true' || editValue === 'false') {
                newValue = editValue === 'true';
            } else if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
                newValue = Number(editValue);
            } else {
                newValue = editValue.replace(/^"|"$/g, ''); // Remove surrounding quotes if present
            }
            onEdit(path, newValue);
            setIsEditing(false);
        } catch (err) {
            console.error('Invalid edit value');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    };

    const valueType = getValueType(value);
    const expandable = isExpandable(value);
    const indent = level * 20;

    return (
        <div className="group">
            <div
                className="flex items-center gap-1 py-1 px-2 hover:bg-muted/50 rounded text-sm"
                style={{ paddingLeft: `${indent + 8}px` }}
            >
                {/* Expand/Collapse Icon */}
                <div className="w-4 h-4 flex items-center justify-center">
                    {expandable && (
                        <button
                            onClick={onToggle}
                            className="hover:bg-muted rounded p-0.5"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </button>
                    )}
                </div>

                {/* Label */}
                <span className="font-medium text-foreground/80 min-w-[80px]">
                    {label}:
                </span>

                {/* Value */}
                {isEditing ? (
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') setIsEditing(false);
                        }}
                        className="h-6 px-2 text-xs flex-1 max-w-[300px]"
                        autoFocus
                    />
                ) : (
                    <span className={`font-mono ${getTypeColor(valueType)} truncate max-w-[300px] inline-block align-bottom`}>
                        {getDisplayValue(value)}
                    </span>
                )}

                {/* Type Badge */}
                <span className="text-xs text-muted-foreground ml-2">
                    {valueType}
                </span>

                {/* Action Buttons */}
                <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!expandable && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleStartEdit}
                            title="Edit value"
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    )}
                    {expandable && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => onAdd(path)}
                            title="Add property"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={handleCopy}
                        title="Copy value"
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => onDelete(path)}
                        title="Delete"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Children */}
            {expandable && isExpanded && (
                <div>
                    {Array.isArray(value) ? (
                        value.map((item, index) => (
                            <TreeNodeContainer
                                key={`${path}[${index}]`}
                                label={`[${index}]`}
                                value={item}
                                path={`${path}[${index}]`}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAdd={onAdd}
                                level={level + 1}
                            />
                        ))
                    ) : (
                        Object.entries(value as object).map(([key, val]) => (
                            <TreeNodeContainer
                                key={`${path}.${key}`}
                                label={key}
                                value={val}
                                path={path ? `${path}.${key}` : key}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAdd={onAdd}
                                level={level + 1}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

interface TreeNodeContainerProps {
    label: string;
    value: JSONValue;
    path: string;
    onEdit: (path: string, newValue: JSONValue) => void;
    onDelete: (path: string) => void;
    onAdd: (path: string) => void;
    level: number;
}

function TreeNodeContainer({
    label,
    value,
    path,
    onEdit,
    onDelete,
    onAdd,
    level,
}: TreeNodeContainerProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <TreeNode
            label={label}
            value={value}
            path={path}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdd={onAdd}
            level={level}
        />
    );
}
