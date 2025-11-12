'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Search, X, Expand, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JSONViewerProps {
  data: string;
  className?: string;
  searchable?: boolean;
  onSearchChange?: (query: string) => void;
}

interface JSONNode {
  key: string | number;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  level: number;
  path: string;
  children?: JSONNode[];
}

function JSONViewerComponent({ data, className = '', searchable = true, onSearchChange }: JSONViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [allExpanded, setAllExpanded] = useState(false);

  // Parse JSON and build tree structure
  const { parsed, error, isJSON } = useMemo(() => {
    if (!data || !data.trim()) {
      return { parsed: null, error: null, isJSON: false };
    }

    try {
      const parsed = JSON.parse(data);
      return { parsed, error: null, isJSON: true };
    } catch (e) {
      return {
        parsed: null,
        error: e instanceof Error ? e.message : 'Invalid JSON',
        isJSON: false,
      };
    }
  }, [data]);

  // Build tree structure from parsed JSON
  const buildTree = useCallback((value: any, key: string | number = 'root', level: number = 0, path: string = 'root'): JSONNode => {
    const node: JSONNode = {
      key,
      value,
      level,
      path,
    };

    if (value === null) {
      node.type = 'null';
    } else if (Array.isArray(value)) {
      node.type = 'array';
      node.children = value.map((item, index) =>
        buildTree(item, index, level + 1, `${path}[${index}]`)
      );
    } else if (typeof value === 'object') {
      node.type = 'object';
      node.children = Object.entries(value).map(([k, v]) =>
        buildTree(v, k, level + 1, `${path}.${k}`)
      );
    } else {
      node.type = typeof value as 'string' | 'number' | 'boolean';
    }

    return node;
  }, []);

  const rootNode = useMemo(() => {
    if (!parsed || !isJSON) return null;
    return buildTree(parsed);
  }, [parsed, isJSON, buildTree]);

  // Expand/collapse node
  const toggleNode = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
        // Also collapse all children
        const allPaths = Array.from(newSet);
        allPaths.forEach(p => {
          if (p.startsWith(path + '.') || p.startsWith(path + '[')) {
            newSet.delete(p);
          }
        });
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  // Expand/collapse all
  const toggleExpandAll = useCallback(() => {
    if (!rootNode) return;

    const collectAllPaths = (node: JSONNode): string[] => {
      const paths: string[] = [];
      if (node.children && node.children.length > 0) {
        paths.push(node.path);
        node.children.forEach(child => {
          paths.push(...collectAllPaths(child));
        });
      }
      return paths;
    };

    if (allExpanded) {
      // Collapse all except root
      setExpandedPaths(new Set(['root']));
      setAllExpanded(false);
    } else {
      // Expand all
      const allPaths = collectAllPaths(rootNode);
      setExpandedPaths(new Set(allPaths));
      setAllExpanded(true);
    }
  }, [rootNode, allExpanded]);

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  }, [onSearchChange]);

  // Highlight search matches
  const highlightText = useCallback((text: string, query: string): React.ReactNode => {
    if (!query || !text) return text;

    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      );
    } catch {
      return text;
    }
  }, []);

  // Check if node or its children match search query
  const nodeMatchesSearch = useCallback((node: JSONNode, query: string): boolean => {
    if (!query) return true;

    const searchLower = query.toLowerCase();
    const keyStr = String(node.key).toLowerCase();
    let valueStr = '';
    
    if (node.type === 'object' || node.type === 'array') {
      valueStr = JSON.stringify(node.value).toLowerCase();
    } else {
      valueStr = String(node.value).toLowerCase();
    }

    if (keyStr.includes(searchLower) || valueStr.includes(searchLower)) {
      return true;
    }

    // Check children
    if (node.children) {
      return node.children.some(child => nodeMatchesSearch(child, query));
    }

    return false;
  }, []);

  // Filter nodes based on search
  const filterNode = useCallback((node: JSONNode, query: string): JSONNode | null => {
    if (!query) return node;

    const matches = nodeMatchesSearch(node, query);
    if (!matches) return null;

    if (!node.children || node.children.length === 0) {
      return node;
    }

    const filteredChildren = node.children
      .map(child => filterNode(child, query))
      .filter(child => child !== null) as JSONNode[];

    return {
      ...node,
      children: filteredChildren.length > 0 ? filteredChildren : node.children,
    };
  }, [nodeMatchesSearch]);

  const filteredRootNode = useMemo(() => {
    if (!rootNode || !searchQuery) return rootNode;
    return filterNode(rootNode, searchQuery);
  }, [rootNode, searchQuery, filterNode]);

  // Render value with syntax highlighting
  const renderValue = useCallback((value: any, type: string): React.ReactNode => {
    switch (type) {
      case 'string':
        return (
          <span className="text-green-600 dark:text-green-400">
            &quot;{highlightText(String(value), searchQuery)}&quot;
          </span>
        );
      case 'number':
        return <span className="text-blue-600 dark:text-blue-400">{highlightText(String(value), searchQuery)}</span>;
      case 'boolean':
        return <span className="text-purple-600 dark:text-purple-400">{String(value)}</span>;
      case 'null':
        return <span className="text-gray-500 dark:text-gray-400">null</span>;
      default:
        return <span>{highlightText(String(value), searchQuery)}</span>;
    }
  }, [searchQuery, highlightText]);

  // Render JSON node recursively
  const renderNode = useCallback((node: JSONNode | null): React.ReactNode => {
    if (!node) return null;

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedPaths.has(node.path);
    const indent = node.level * 20;
    const showKey = node.key !== 'root';

    if (node.type === 'object' || node.type === 'array') {
      const bracketOpen = node.type === 'object' ? '{' : '[';
      const bracketClose = node.type === 'object' ? '}' : ']';

      return (
        <React.Fragment key={node.path}>
          <div
            className="flex items-start hover:bg-muted/30 rounded px-1 py-0.5 -mx-1 cursor-pointer transition-colors group"
            style={{ paddingLeft: `${indent}px` }}
            onClick={() => hasChildren && toggleNode(node.path)}
          >
            <button className="mr-1 mt-0.5 text-muted-foreground hover:text-foreground flex-shrink-0">
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )
              ) : (
                <span className="w-3.5" />
              )}
            </button>
            {showKey && (
              <span className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0">
                {highlightText(String(node.key), searchQuery)}:
              </span>
            )}
            <span className="text-gray-600 dark:text-gray-400">{bracketOpen}</span>
            {!isExpanded && hasChildren && (
              <span className="text-muted-foreground ml-1">
                ... {node.children?.length} {node.type === 'object' ? 'keys' : 'items'}
              </span>
            )}
            {!hasChildren && <span className="text-muted-foreground ml-1">empty</span>}
            {!isExpanded && <span className="text-gray-600 dark:text-gray-400 ml-1">{bracketClose}</span>}
          </div>
          {isExpanded && hasChildren && (
            <div>
              {node.children?.map((child, index) => renderNode(child))}
            </div>
          )}
          {isExpanded && (
            <div
              className="flex items-center text-gray-600 dark:text-gray-400"
              style={{ paddingLeft: `${indent}px` }}
            >
              <span className="w-3.5 mr-1" />
              <span>{bracketClose}</span>
            </div>
          )}
        </React.Fragment>
      );
    } else {
      return (
        <div
          key={node.path}
          className="flex items-start hover:bg-muted/30 rounded px-1 py-0.5 -mx-1 transition-colors"
          style={{ paddingLeft: `${indent}px` }}
        >
          <span className="w-3.5 mr-1 flex-shrink-0" />
          {showKey && (
            <span className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0">
              {highlightText(String(node.key), searchQuery)}:
            </span>
          )}
          <span className="break-words">{renderValue(node.value, node.type)}</span>
        </div>
      );
    }
  }, [expandedPaths, searchQuery, toggleNode, highlightText, renderValue]);

  // If not JSON, return error or plain text
  if (error || !isJSON) {
    const trimmedData = data?.trim() || '';
    if (error && (trimmedData.startsWith('{') || trimmedData.startsWith('['))) {
      return (
        <div className={cn('text-red-500 dark:text-red-400 font-mono text-sm', className)}>
          <div className="mb-2 text-xs font-semibold">JSON Parse Error:</div>
          <pre className="whitespace-pre-wrap break-words leading-relaxed">{data}</pre>
        </div>
      );
    }
    return (
      <pre className={cn('font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90', className)}>
        {data}
      </pre>
    );
  }

  if (!rootNode) {
    return (
      <div className={cn('text-muted-foreground text-sm', className)}>
        No data to display
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {searchable && (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search in response..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-8 h-8 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => handleSearchChange('')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={toggleExpandAll}
            title={allExpanded ? 'Collapse All' : 'Expand All'}
          >
            {allExpanded ? (
              <>
                <Minus className="w-3 h-3 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <Expand className="w-3 h-3 mr-1" />
                Expand
              </>
            )}
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-auto font-mono text-sm leading-relaxed">
        {filteredRootNode ? (
          renderNode(filteredRootNode)
        ) : (
          <div className="text-muted-foreground text-sm py-4 text-center">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

export const JSONViewer = React.memo(JSONViewerComponent);
