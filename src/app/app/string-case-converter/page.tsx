'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Type, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StringCaseConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 via-primary/5 to-muted/10">
          <div className="p-8 md:p-12 text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Type className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              String Case Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert text between different naming conventions: camelCase, kebab-case, snake_case, and more.
            </p>
          </div>
        </Card>

        {/* Main Converter */}
        <StringCaseConverter />
      </div>
    </div>
  );
}

function StringCaseConverter() {
  const [input, setInput] = useState('hello world');
  const [copied, setCopied] = useState<string | null>(null);

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

  const handleCopy = async (value: string, type: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Silent fail
    }
  };

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

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Convert Text Case
          </CardTitle>
          <CardDescription className="mt-2">
            Enter text and convert to different naming conventions
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <span>Input Text</span>
            <Badge variant="secondary">{input.length} chars</Badge>
          </label>
          <Textarea
            placeholder="Enter text to convert..."
            className="font-mono min-h-[100px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Converted Results */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Converted Formats</h3>
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

