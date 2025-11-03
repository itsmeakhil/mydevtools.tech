'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Clock, Calendar, Check, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from 'use-debounce';

export default function TimestampConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
  const [conversionDirection, setConversionDirection] = useState<'timestamp-to-date' | 'date-to-timestamp' | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const convertTimestampToDate = useCallback(() => {
    setError(null);
    setConversionDirection('timestamp-to-date');
    
    if (!timestamp.trim()) {
      setDateInput('');
      return;
    }

    try {
      const ts = parseInt(timestamp.trim());
      
      // Check if it's a valid number
      if (isNaN(ts)) {
        throw new Error('Timestamp must be a valid number. Enter seconds since Unix epoch (e.g., 1704067200).');
      }
      
      // Check if it's in a reasonable range (between 1970 and 2100)
      const minTimestamp = 0;
      const maxTimestamp = 4102444800; // Jan 1, 2100
      
      if (ts < minTimestamp) {
        throw new Error(`Timestamp too small. Unix timestamps start from 0 (January 1, 1970).`);
      }
      
      if (ts > maxTimestamp) {
        throw new Error(`Timestamp too large. Did you mean milliseconds? Divide by 1000 if so.`);
      }
      
      // Check if it might be milliseconds (if > reasonable seconds value)
      if (ts > 9999999999) {
        throw new Error(`Timestamp appears to be in milliseconds. Unix timestamps should be in seconds. Try dividing by 1000.`);
      }
      
      const date = new Date(ts * 1000); // Convert to milliseconds
      if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp: resulted in an invalid date.');
      }

      setDateInput(date.toISOString().slice(0, 16));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMessage);
      setDateInput('');
    }
  }, [timestamp]);

  const convertDateToTimestamp = useCallback(() => {
    setError(null);
    setConversionDirection('date-to-timestamp');
    
    if (!dateInput.trim()) {
      setTimestamp('');
      return;
    }

    try {
      const date = new Date(dateInput);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format. Please use a valid date and time.');
      }
      
      // Check if date is in reasonable range
      const minDate = new Date('1970-01-01');
      const maxDate = new Date('2100-01-01');
      
      if (date < minDate) {
        throw new Error('Date is before Unix epoch (January 1, 1970).');
      }
      
      if (date > maxDate) {
        throw new Error('Date is too far in the future.');
      }

      const ts = Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMessage);
      setTimestamp('');
    }
  }, [dateInput]);

  // Debounced auto-conversion
  const debouncedTimestampConvert = useDebouncedCallback(convertTimestampToDate, 300);
  const debouncedDateConvert = useDebouncedCallback(convertDateToTimestamp, 300);

  // Auto-convert when inputs change
  useEffect(() => {
    if (timestamp.trim() && conversionDirection !== 'date-to-timestamp') {
      debouncedTimestampConvert();
    }
  }, [timestamp, debouncedTimestampConvert, conversionDirection]);

  useEffect(() => {
    if (dateInput.trim() && conversionDirection !== 'timestamp-to-date') {
      debouncedDateConvert();
    }
  }, [dateInput, debouncedDateConvert, conversionDirection]);

  // Manual conversion handlers
  const handleTimestampConvert = () => {
    debouncedTimestampConvert.cancel();
    convertTimestampToDate();
  };

  const handleDateConvert = () => {
    debouncedDateConvert.cancel();
    convertDateToTimestamp();
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
    // Auto-convert will trigger via useEffect
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
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            Timestamp Converter
          </CardTitle>
          <CardDescription className="mt-2">
            Convert between Unix timestamps and human-readable dates in multiple formats.
          </CardDescription>
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
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Enter Unix timestamp (e.g., 1704067200)"
              value={timestamp}
              onChange={(e) => {
                setTimestamp(e.target.value);
                setError(null);
              }}
              className="flex-1"
            />
            <Button onClick={handleTimestampConvert} className="w-full sm:w-auto">
              Convert
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Auto-converts as you type. Timestamp is in seconds since Unix epoch (Jan 1, 1970).
          </p>
        </div>

        {/* Date to Timestamp */}
        <div className="space-y-3">
          <Label>Date & Time</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                setError(null);
              }}
              className="flex-1"
            />
            <Button onClick={handleDateConvert} className="w-full sm:w-auto">
              Convert
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Auto-converts as you select a date/time.
          </p>
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

