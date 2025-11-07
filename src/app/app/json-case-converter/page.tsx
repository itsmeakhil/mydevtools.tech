'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Braces, Check, Download, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CaseType = 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case' | 'CONSTANT_CASE';

const defaultInput = `user_name`;

export default function CaseConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <CaseConverter />
      </div>
    </div>
  );
}

function CaseConverter() {
  const [input, setInput] = useState(defaultInput);
  const [output, setOutput] = useState('');
  const [targetCase, setTargetCase] = useState<CaseType>('camelCase');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [detectedCase, setDetectedCase] = useState<string | null>(null);

  const caseOptions: { value: CaseType; label: string; example: string }[] = [
    { value: 'camelCase', label: 'camelCase', example: 'firstName' },
    { value: 'PascalCase', label: 'PascalCase', example: 'FirstName' },
    { value: 'snake_case', label: 'snake_case', example: 'first_name' },
    { value: 'kebab-case', label: 'kebab-case', example: 'first-name' },
    { value: 'CONSTANT_CASE', label: 'CONSTANT_CASE', example: 'FIRST_NAME' },
  ];

  // Convert a single string to the target case
  const convertStringCase = (str: string, targetCase: CaseType): string => {
    // Split the string into words based on various separators
    const words = str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase/PascalCase
      .split(/[\s\-_]+/) // Split on spaces, hyphens, underscores
      .filter(Boolean)
      .map(word => word.toLowerCase());

    if (words.length === 0) return str;

    switch (targetCase) {
      case 'camelCase':
        return words
          .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
          .join('');
      case 'PascalCase':
        return words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      case 'snake_case':
        return words.join('_');
      case 'kebab-case':
        return words.join('-');
      case 'CONSTANT_CASE':
        return words.map(word => word.toUpperCase()).join('_');
      default:
        return str;
    }
  };

  // Recursively convert all keys in an object or array
  const convertKeysRecursive = (obj: any, targetCase: CaseType): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => convertKeysRecursive(item, targetCase));
    }

    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = convertStringCase(key, targetCase);
        newObj[newKey] = convertKeysRecursive(value, targetCase);
      }
      return newObj;
    }

    return obj;
  };

  // Detect the case style of input (JSON keys or plain string)
  const detectCaseStyle = (inputString: string): string => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(inputString);
      const keys = extractKeys(parsed).slice(0, 10); // Sample first 10 keys

      if (keys.length === 0) return 'Unknown (no keys found)';

      let snakeCount = 0;
      let kebabCount = 0;
      let camelCount = 0;
      let pascalCount = 0;
      let constantCount = 0;

      keys.forEach(key => {
        if (/^[A-Z_]+$/.test(key) && key.includes('_')) {
          constantCount++;
        } else if (/_/.test(key) && !/[A-Z]/.test(key)) {
          snakeCount++;
        } else if (/-/.test(key)) {
          kebabCount++;
        } else if (/^[a-z]/.test(key) && /[A-Z]/.test(key)) {
          camelCount++;
        } else if (/^[A-Z]/.test(key) && /[a-z]/.test(key)) {
          pascalCount++;
        }
      });

      const max = Math.max(snakeCount, kebabCount, camelCount, pascalCount, constantCount);
      
      if (max === 0) return 'Mixed or unclear';
      if (constantCount === max) return 'CONSTANT_CASE';
      if (snakeCount === max) return 'snake_case';
      if (kebabCount === max) return 'kebab-case';
      if (camelCount === max) return 'camelCase';
      if (pascalCount === max) return 'PascalCase';

      return 'Mixed or unclear';
    } catch {
      // If not JSON, analyze the plain string
      const trimmed = inputString.trim();
      if (!trimmed) return 'Empty input';
      
      if (/^[A-Z_]+$/.test(trimmed) && trimmed.includes('_')) {
        return 'CONSTANT_CASE';
      } else if (/_/.test(trimmed) && !/[A-Z]/.test(trimmed)) {
        return 'snake_case';
      } else if (/-/.test(trimmed)) {
        return 'kebab-case';
      } else if (/^[a-z]/.test(trimmed) && /[A-Z]/.test(trimmed)) {
        return 'camelCase';
      } else if (/^[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed)) {
        return 'PascalCase';
      }
      
      return 'Mixed or unclear';
    }
  };

  // Extract all keys from a JSON object
  const extractKeys = (obj: any): string[] => {
    const keys: string[] = [];

    const traverse = (current: any) => {
      if (current === null || current === undefined) return;

      if (Array.isArray(current)) {
        current.forEach(item => traverse(item));
      } else if (typeof current === 'object') {
        Object.keys(current).forEach(key => {
          keys.push(key);
          traverse(current[key]);
        });
      }
    };

    traverse(obj);
    return keys;
  };

  const handleConvert = () => {
    try {
      setError(null);
      
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(input);
        
        // Convert all keys recursively
        const converted = convertKeysRecursive(parsed, targetCase);
        
        // Format the output with 2-space indentation
        const formatted = JSON.stringify(converted, null, 2);
        
        setOutput(formatted);
      } catch {
        // If JSON parsing fails, treat it as a plain string/variable name
        const trimmedInput = input.trim();
        if (!trimmedInput) {
          setError('Please enter some text to convert.');
          setOutput('');
          return;
        }
        
        // Convert the plain string
        const converted = convertStringCase(trimmedInput, targetCase);
        setOutput(converted);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An error occurred during conversion.');
      }
      setOutput('');
    }
  };

  const handleDetectCase = () => {
    const detected = detectCaseStyle(input);
    setDetectedCase(detected);
  };

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  const handleDownload = () => {
    if (!output) return;

    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${targetCase}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setDetectedCase(null);
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <Braces className="h-5 w-5 text-primary" />
            </div>
            Case Converter
          </CardTitle>
          <CardDescription className="mt-2">
            Convert variable names or JSON keys between camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE.
            Supports both plain text and JSON input.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls Section */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-sm font-medium">Target Case Style</label>
            <Select value={targetCase} onValueChange={(value) => setTargetCase(value as CaseType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {caseOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">({option.example})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleConvert} className="flex-shrink-0">
            Convert
          </Button>

          <Button onClick={handleDetectCase} variant="outline" className="flex-shrink-0">
            <Search className="w-4 h-4 mr-2" />
            Detect Input Case
          </Button>

          <Button onClick={handleClear} variant="outline" className="flex-shrink-0">
            Clear
          </Button>
        </div>

        {/* Detected Case Display */}
        {detectedCase && (
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              <strong>Detected case style:</strong> {detectedCase}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input/Output Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <span>Input</span>
                <Badge variant="secondary">{input.length} chars</Badge>
              </label>
            </div>
            <Textarea
              placeholder='user_name or {"user_name": "John Doe"}'
              className="font-mono min-h-[400px] resize-none"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
                setDetectedCase(null);
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
                <div className="flex gap-2">
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
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            <Textarea
              readOnly
              placeholder="Converted output will appear here..."
              className="font-mono min-h-[400px] resize-none bg-muted/50"
              value={output}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-3">Common Use Cases</h3>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-medium min-w-[140px]">camelCase:</span>
              <span>JavaScript variables, React props, most frontend APIs</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium min-w-[140px]">PascalCase:</span>
              <span>TypeScript interfaces, class names, React components</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium min-w-[140px]">snake_case:</span>
              <span>Python variables, Ruby on Rails, PostgreSQL columns</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium min-w-[140px]">kebab-case:</span>
              <span>CSS properties, HTML attributes, URLs, file names</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium min-w-[140px]">CONSTANT_CASE:</span>
              <span>Environment variables, constants, configuration keys</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> You can enter either a single variable name (e.g., "user_name") or a complete JSON object. 
              The converter will automatically detect the input type and convert accordingly.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

