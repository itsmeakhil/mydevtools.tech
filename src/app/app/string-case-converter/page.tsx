'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Type, Check, History, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const HISTORY_KEY = 'string-case-converter-history';
const MAX_HISTORY = 10;

interface HistoryItem {
  input: string;
  timestamp: number;
  formats: Record<string, string>;
}

export default function StringCaseConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Main Converter */}
        <StringCaseConverter />
      </div>
    </div>
  );
}

function StringCaseConverter() {
  const [input, setInput] = useState('hello world');
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const convertCase = (type: string) => {
    if (!input.trim()) return '';

    const words = input.trim().split(/[\s\-_\s]+|(?=[A-Z])/).filter(Boolean);

    switch (type) {
      case 'camel':
        return words
          .map((word, i) => (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
          .join('');
      case 'pascal':
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
      case 'kebab':
        return words.map(word => word.toLowerCase()).join('-');
      case 'snake':
        return words.map(word => word.toLowerCase()).join('_');
      case 'constant':
        return words.map(word => word.toUpperCase()).join('_');
      case 'sentence':
        return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase() + 
               (words.slice(1).length > 0 ? ' ' + words.slice(1).map(w => w.toLowerCase()).join(' ') : '');
      case 'lower':
        return input.toLowerCase();
      case 'upper':
        return input.toUpperCase();
      case 'title':
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      default:
        return input;
    }
  };

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  const caseTypes = [
    { id: 'camel', label: 'camelCase', description: 'firstWord' },
    { id: 'pascal', label: 'PascalCase', description: 'FirstWord' },
    { id: 'kebab', label: 'kebab-case', description: 'first-word' },
    { id: 'snake', label: 'snake_case', description: 'first_word' },
    { id: 'constant', label: 'CONSTANT_CASE', description: 'FIRST_WORD' },
    { id: 'sentence', label: 'Sentence case', description: 'First word' },
    { id: 'lower', label: 'lowercase', description: 'first word' },
    { id: 'upper', label: 'UPPERCASE', description: 'FIRST WORD' },
    { id: 'title', label: 'Title Case', description: 'First Word' },
  ];

  // Save to history when input changes significantly
  useEffect(() => {
    if (input.trim() && input.length > 2) {
      const formats: Record<string, string> = {};
      caseTypes.forEach((type) => {
        formats[type.id] = convertCase(type.id);
      });

      const newHistoryItem: HistoryItem = {
        input: input.trim(),
        timestamp: Date.now(),
        formats,
      };

      setHistory((prev) => {
        // Remove duplicates
        const filtered = prev.filter((item) => item.input !== newHistoryItem.input);
        // Add to beginning and limit
        const updated = [newHistoryItem, ...filtered].slice(0, MAX_HISTORY);
        
        // Save to localStorage
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save history:', error);
        }
        
        return updated;
      });
    }
  }, [input]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      
      // Esc: Clear input
      if (e.key === 'Escape') {
        setInput('');
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = async (value: string, type: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Silent fail
    }
  };

  const handleCopyAll = async () => {
    const allFormats = caseTypes
      .map((type) => {
        const converted = convertCase(type.id);
        return `${type.label}: ${converted || '(empty)'}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(allFormats);
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Silent fail
    }
  };

  const handleExport = () => {
    const exportData = {
      input,
      timestamp: new Date().toISOString(),
      formats: caseTypes.reduce((acc, type) => {
        acc[type.id] = convertCase(type.id);
        return acc;
      }, {} as Record<string, string>),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-conversion-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    setInput(item.input);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <Type className="h-5 w-5 text-primary" />
            </div>
            String Case Converter
          </CardTitle>
          <CardDescription className="mt-2">
            Convert text between different naming conventions: camelCase, kebab-case, snake_case, and more.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 min-w-[120px]"
          >
            <History className="w-4 h-4 mr-2" />
            History ({history.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            disabled={!input.trim()}
            className="flex-1 min-w-[120px]"
          >
            {copied === 'all' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied All!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!input.trim()}
            className="flex-1 min-w-[120px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <Alert>
            <History className="h-4 w-4" />
            <AlertDescription className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Recent Conversions</span>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-6 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet. Start converting!</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-background rounded border cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleLoadFromHistory(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">{item.input}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2">
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <span>Input Text</span>
              <Badge variant="secondary">{input.length} chars</Badge>
            </label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput('');
                  textareaRef.current?.focus();
                }}
                disabled={!input}
              >
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            placeholder="Enter text to convert... (Press Ctrl+K to focus, Esc to clear)"
            className="font-mono min-h-[100px] md:min-h-[120px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            💡 Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> to focus,{' '}
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to clear
          </p>
        </div>

        {/* Converted Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Converted Formats</h3>
            <Badge variant="secondary">
              {caseTypes.filter((type) => convertCase(type.id)).length} formats
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {caseTypes.map((type) => {
              const converted = convertCase(type.id);
              return (
                <CaseItem
                  key={type.id}
                  label={type.label}
                  description={type.description}
                  value={converted}
                  onCopy={() => handleCopy(converted, type.id)}
                  copied={copied === type.id}
                />
              );
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-2">Common Use Cases</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>camelCase</strong>: JavaScript variables, CSS class names</li>
            <li>• <strong>PascalCase</strong>: JavaScript classes, React components</li>
            <li>• <strong>kebab-case</strong>: CSS class names, file names, URLs</li>
            <li>• <strong>snake_case</strong>: Python variables, database columns</li>
            <li>• <strong>CONSTANT_CASE</strong>: Environment variables, constants</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function CaseItem({
  label,
  description,
  value,
  onCopy,
  copied,
}: {
  label: string;
  description: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium">{label}</p>
          <Badge variant="outline" className="text-xs">
            {description}
          </Badge>
        </div>
        <p className="text-sm font-mono break-all text-muted-foreground">{value || '—'}</p>
      </div>
      {value && (
        <Button variant="ghost" size="sm" onClick={onCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      )}
    </div>
  );
}

