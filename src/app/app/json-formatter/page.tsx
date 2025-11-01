'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, FileCode, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function JsonFormatterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 via-primary/5 to-muted/10">
          <div className="p-8 md:p-12 text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileCode className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              JSON Formatter & Validator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beautify, validate, minify, and format JSON data with syntax highlighting.
            </p>
          </div>
        </Card>

        {/* Main Formatter */}
        <JsonFormatter />
      </div>
    </div>
  );
}

function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const formatJSON = (indentSize: number) => {
    setError(null);
    
    if (!input.trim()) {
      setOutput('');
      setIsValid(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setIsValid(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(`JSON Parse Error: ${errorMessage}`);
      setOutput('');
      setIsValid(false);
    }
  };

  const minifyJSON = () => {
    setError(null);
    
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(`JSON Parse Error: ${errorMessage}`);
      setOutput('');
      setIsValid(false);
    }
  };

  const validateJSON = () => {
    setError(null);
    
    if (!input.trim()) {
      setIsValid(null);
      return;
    }

    try {
      JSON.parse(input);
      setIsValid(true);
      setOutput('✓ Valid JSON');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(`Validation Error: ${errorMessage}`);
      setIsValid(false);
      setOutput('');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setIsValid(null);
  };

  const countStats = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return {
        keys: Object.keys(parsed).length,
        size: new Blob([jsonString]).size,
        lines: jsonString.split('\n').length,
      };
    } catch {
      return null;
    }
  };

  const stats = countStats(input);

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              Format & Validate JSON
            </CardTitle>
            <CardDescription className="mt-2">
              Enter JSON data to format, validate, or minify
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => formatJSON(indent)} size="lg" className="flex-1">
            <Sparkles className="w-5 h-5 mr-2" />
            Format
          </Button>
          <Button onClick={minifyJSON} variant="outline" size="lg" className="flex-1">
            Minify
          </Button>
          <Button onClick={validateJSON} variant="outline" size="lg" className="flex-1">
            <AlertCircle className="w-5 h-5 mr-2" />
            Validate
          </Button>
          <Button onClick={handleClear} variant="outline" size="lg">
            Clear
          </Button>
        </div>

        {/* Indent Selector */}
        <div className="flex items-center gap-4">
          <Label>Indentation: {indent} spaces</Label>
          <div className="flex gap-2">
            {[2, 3, 4, 0].map((size) => (
              <Button
                key={size}
                variant={indent === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setIndent(size);
                  if (input.trim()) formatJSON(size);
                }}
              >
                {size === 0 ? 'None' : `${size}sp`}
              </Button>
            ))}
          </div>
        </div>

        {/* Validation Status */}
        {isValid !== null && (
          <Alert variant={isValid ? 'default' : 'destructive'} className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isValid ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  JSON is valid
                </span>
              ) : (
                'JSON is invalid - check error details above'
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Keys</p>
              <p className="text-2xl font-bold">{stats.keys}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="text-2xl font-bold">{stats.size} B</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Lines</p>
              <p className="text-2xl font-bold">{stats.lines}</p>
            </div>
          </div>
        )}

        {/* Input/Output Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <span>Input JSON</span>
                <Badge variant="secondary">{input.length} chars</Badge>
              </label>
            </div>
            <Textarea
              placeholder='{"name":"John","age":30}'
              className="font-mono min-h-[400px] resize-none"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
                setIsValid(null);
              }}
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <span>Output</span>
                <Badge variant="secondary">{output.length} chars</Badge>
              </label>
              {output && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
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
            <Textarea
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="font-mono min-h-[400px] resize-none bg-muted/50"
              value={output}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-2">JSON Features</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Beautify: Format JSON with customizable indentation</li>
            <li>• Minify: Remove all whitespace to reduce file size</li>
            <li>• Validate: Check if JSON syntax is correct</li>
            <li>• Syntax highlighting and error detection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

