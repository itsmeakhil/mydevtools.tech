'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Clock, Calendar, Check, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TimestampConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 via-primary/5 to-muted/10">
          <div className="p-8 md:p-12 text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Timestamp Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert between Unix timestamps and human-readable dates in multiple formats.
            </p>
          </div>
        </Card>

        {/* Main Converter */}
        <TimestampConverter />
      </div>
    </div>
  );
}

function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimestampConvert = () => {
    setError(null);
    
    if (!timestamp.trim()) {
      setDateInput('');
      return;
    }

    try {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) {
        throw new Error('Invalid timestamp number');
      }
      
      const date = new Date(ts * 1000); // Convert to milliseconds
      if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp value');
      }

      setDateInput(date.toISOString().slice(0, 16));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setDateInput('');
    }
  };

  const handleDateConvert = () => {
    setError(null);
    
    if (!dateInput.trim()) {
      setTimestamp('');
      return;
    }

    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date value');
      }

      const ts = Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setTimestamp('');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const setCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    handleTimestampConvert();
  };

  const formats = timestamp
    ? {
        unix: timestamp,
        iso: new Date(parseInt(timestamp) * 1000).toISOString(),
        utc: new Date(parseInt(timestamp) * 1000).toUTCString(),
        local: new Date(parseInt(timestamp) * 1000).toLocaleString(),
      }
    : null;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Convert Timestamps
            </CardTitle>
            <CardDescription className="mt-2">
              Convert between Unix timestamps and readable dates
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={setCurrentTimestamp}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Now
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Time Display */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Current Time</p>
              <p className="text-lg font-mono">{currentTime.toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="text-lg font-mono">
              {Math.floor(Date.now() / 1000)}
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Timestamp to Date */}
        <div className="space-y-3">
          <Label>Unix Timestamp (seconds)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter Unix timestamp (e.g., 1704067200)"
              value={timestamp}
              onChange={(e) => {
                setTimestamp(e.target.value);
                setError(null);
              }}
              className="flex-1"
            />
            <Button onClick={handleTimestampConvert}>
              Convert
            </Button>
          </div>
        </div>

        {/* Date to Timestamp */}
        <div className="space-y-3">
          <Label>Date & Time</Label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                setError(null);
              }}
              className="flex-1"
            />
            <Button onClick={handleDateConvert}>
              Convert
            </Button>
          </div>
        </div>

        {/* Results */}
        {formats && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Converted Formats</h3>
              <div className="space-y-3">
                <FormatItem
                  label="Unix Timestamp"
                  value={formats.unix}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <FormatItem
                  label="ISO 8601"
                  value={formats.iso}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <FormatItem
                  label="UTC String"
                  value={formats.utc}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <FormatItem
                  label="Local String"
                  value={formats.local}
                  onCopy={handleCopy}
                  copied={copied}
                />
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-2">About Unix Timestamps</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Unix timestamp is the number of seconds since January 1, 1970 (UTC)</li>
            <li>• Used in databases, APIs, and file systems</li>
            <li>• Supports dates from 1901 to 2038 (32-bit systems)</li>
            <li>• 64-bit systems support much wider date ranges</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FormatItem({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: (value: string) => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-mono break-all">{value}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onCopy(value)}>
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
    </div>
  );
}

