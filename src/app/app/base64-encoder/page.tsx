'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Code2, FileText, Check, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from 'use-debounce';

export default function Base64EncoderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Main Converter */}
        <Base64Converter />
      </div>
    </div>
  );
}

function Base64Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const convert = useCallback(() => {
    setError(null);
    setIsConverting(true);
    
    if (!input.trim()) {
      setOutput('');
      setIsConverting(false);
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        // Validate Base64 string before decoding
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const cleanInput = input.trim().replace(/\s/g, '');
        
        if (!base64Regex.test(cleanInput)) {
          throw new Error('Invalid Base64 string. Base64 strings should only contain A-Z, a-z, 0-9, +, /, and = padding characters.');
        }
        
        if (cleanInput.length % 4 !== 0) {
          throw new Error('Invalid Base64 string length. Base64 strings should have a length that is a multiple of 4.');
        }
        
        try {
          const decoded = decodeURIComponent(escape(atob(cleanInput)));
          setOutput(decoded);
        } catch (e) {
          throw new Error('Failed to decode Base64 string. The string may contain invalid characters or be corrupted.');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMessage);
      setOutput('');
    } finally {
      setIsConverting(false);
    }
  }, [input, mode]);

  // Debounced auto-conversion (300ms delay)
  const debouncedConvert = useDebouncedCallback(convert, 300);

  // Auto-convert when input or mode changes
  useEffect(() => {
    debouncedConvert();
  }, [debouncedConvert]);

  // Manual convert handler (for button click)
  const handleConvert = () => {
    debouncedConvert.cancel(); // Cancel any pending debounced calls
    convert();
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

  const handleSwap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError(null);
    // Auto-convert will trigger via useEffect
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    debouncedConvert.cancel();
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setError(null);
    // Auto-convert will trigger via useEffect
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            Base64 Encoder/Decoder
          </CardTitle>
          <CardDescription className="mt-2">
            Encode and decode text to/from Base64 format. Safe for URLs and data transmission.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            variant={mode === 'encode' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('encode')}
          >
            Encode
          </Button>
          <Button
            variant={mode === 'decode' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('decode')}
          >
            Decode
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleConvert} 
            size="lg" 
            className="flex-1 min-w-[120px]"
            disabled={isConverting}
          >
            <RotateCw className={`w-5 h-5 mr-2 ${isConverting ? 'animate-spin' : ''}`} />
            {isConverting ? 'Converting...' : mode === 'encode' ? 'Encode' : 'Decode'}
          </Button>
          <Button onClick={handleSwap} variant="outline" size="lg" className="flex-1 min-w-[100px]">
            <RotateCw className="w-5 h-5 mr-2" />
            Swap
          </Button>
          <Button onClick={handleClear} variant="outline" size="lg" className="flex-1 min-w-[100px]">
            Clear
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertDescription className="flex items-start gap-2">
              <span className="flex-1">{error}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-conversion indicator */}
        {input.trim() && !error && !isConverting && (
          <div className="text-xs text-muted-foreground text-center">
            💡 Auto-converting as you type
          </div>
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
              placeholder={
                mode === 'encode'
                  ? 'Enter text to encode...'
                  : 'Enter Base64 string to decode...'
              }
              className="font-mono min-h-[200px] md:min-h-[300px] resize-none"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
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
              placeholder={
                mode === 'encode'
                  ? 'Base64 encoded output will appear here...'
                  : 'Decoded text will appear here...'
              }
              className="font-mono min-h-[200px] md:min-h-[300px] resize-none bg-muted/50"
              value={output}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-2">About Base64</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Base64 encoding converts binary data to ASCII text</li>
            <li>• Safe for URLs, emails, and data transmission</li>
            <li>• Increases data size by approximately 33%</li>
            <li>• Supports all characters including Unicode</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

