'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileDiff, Copy, Download } from 'lucide-react';

interface DiffResult {
  type: 'add' | 'remove' | 'equal';
  value: string;
  lineNumber?: number;
}

interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
  totalChanges: number;
}

// Improved diff algorithm using LCS (Longest Common Subsequence)
function computeDiffLines(lines1: string[], lines2: string[]): { result1: DiffResult[], result2: DiffResult[] } {
  const result1: DiffResult[] = [];
  const result2: DiffResult[] = [];
  
  // Simple LCS-based diff
  const lcs = computeLCS(lines1, lines2);
  let i1 = 0, i2 = 0, lcsIndex = 0;
  let lineNum1 = 1, lineNum2 = 1;
  
  while (i1 < lines1.length || i2 < lines2.length) {
    if (lcsIndex < lcs.length && i1 < lines1.length && i2 < lines2.length && 
        lines1[i1] === lcs[lcsIndex] && lines2[i2] === lcs[lcsIndex]) {
      // Match found
      result1.push({ type: 'equal', value: lines1[i1], lineNumber: lineNum1++ });
      result2.push({ type: 'equal', value: lines2[i2], lineNumber: lineNum2++ });
      i1++;
      i2++;
      lcsIndex++;
    } else if (lcsIndex < lcs.length && i1 < lines1.length && lines1[i1] === lcs[lcsIndex]) {
      // Line added in text2
      result1.push({ type: 'equal', value: '', lineNumber: lineNum1 });
      result2.push({ type: 'add', value: lines2[i2], lineNumber: lineNum2++ });
      i2++;
    } else if (lcsIndex < lcs.length && i2 < lines2.length && lines2[i2] === lcs[lcsIndex]) {
      // Line removed from text1
      result1.push({ type: 'remove', value: lines1[i1], lineNumber: lineNum1++ });
      result2.push({ type: 'equal', value: '', lineNumber: lineNum2 });
      i1++;
    } else {
      // No match, treat as different
      if (i1 < lines1.length && i2 < lines2.length) {
        result1.push({ type: 'remove', value: lines1[i1], lineNumber: lineNum1++ });
        result2.push({ type: 'add', value: lines2[i2], lineNumber: lineNum2++ });
        i1++;
        i2++;
      } else if (i1 < lines1.length) {
        result1.push({ type: 'remove', value: lines1[i1], lineNumber: lineNum1++ });
        result2.push({ type: 'equal', value: '', lineNumber: lineNum2 });
        i1++;
      } else if (i2 < lines2.length) {
        result1.push({ type: 'equal', value: '', lineNumber: lineNum1 });
        result2.push({ type: 'add', value: lines2[i2], lineNumber: lineNum2++ });
        i2++;
      }
    }
  }
  
  return { result1, result2 };
}

// Simple LCS computation
function computeLCS(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Reconstruct LCS
  const lcs: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}

const TextDiffComponent = () => {
  const [text1, setText1] = useState<string>('international\nin\non\nimages');
  const [text2, setText2] = useState<string>('international\nin\none\nimage\n');
  const [diffResult1, setDiffResult1] = useState<DiffResult[]>([]);
  const [diffResult2, setDiffResult2] = useState<DiffResult[]>([]);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  // Improved diff computation
  const computeDiff = useCallback(() => {
    let processedText1 = text1;
    let processedText2 = text2;
    
    if (ignoreCase) {
      processedText1 = text1.toLowerCase();
      processedText2 = text2.toLowerCase();
    }
    
    const lines1 = processedText1.split('\n');
    const lines2 = processedText2.split('\n');
    
    if (ignoreWhitespace) {
      for (let i = 0; i < lines1.length; i++) {
        lines1[i] = lines1[i].trim();
      }
      for (let i = 0; i < lines2.length; i++) {
        lines2[i] = lines2[i].trim();
      }
    }
    
    const { result1, result2 } = computeDiffLines(lines1, lines2);
    
    // Map back to original text for display (preserving case)
    const originalLines1 = text1.split('\n');
    const originalLines2 = text2.split('\n');
    
    let origIdx1 = 0, origIdx2 = 0;
    const finalResult1: DiffResult[] = [];
    const finalResult2: DiffResult[] = [];
    
    result1.forEach((item, idx) => {
      if (item.type === 'equal' && item.value) {
        finalResult1.push({ ...item, value: originalLines1[origIdx1] || '' });
        finalResult2.push({ ...result2[idx], value: originalLines2[origIdx2] || '' });
        origIdx1++;
        origIdx2++;
      } else if (item.type === 'remove') {
        finalResult1.push({ ...item, value: originalLines1[origIdx1] || '' });
        finalResult2.push({ ...result2[idx], value: '' });
        origIdx1++;
      } else if (result2[idx].type === 'add') {
        finalResult1.push({ ...item, value: '' });
        finalResult2.push({ ...result2[idx], value: originalLines2[origIdx2] || '' });
        origIdx2++;
      } else {
        finalResult1.push(item);
        finalResult2.push(result2[idx]);
      }
    });
    
    setDiffResult1(finalResult1);
    setDiffResult2(finalResult2);
  }, [text1, text2, ignoreWhitespace, ignoreCase]);
  
  // Automatically compute diff when text1 or text2 changes
  useEffect(() => {
    computeDiff();
  }, [computeDiff]);

  // Calculate statistics
  const stats: DiffStats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0;
    
    diffResult1.forEach((item, idx) => {
      if (item.type === 'equal' && item.value) {
        unchanged++;
      } else if (item.type === 'remove') {
        removed++;
      } else if (diffResult2[idx]?.type === 'add') {
        added++;
      }
    });
    
    return {
      added,
      removed,
      unchanged,
      totalChanges: added + removed,
    };
  }, [diffResult1, diffResult2]);

  const handleCopyDiff = async () => {
    const diffText = diffResult1.map((item, idx) => {
      const prefix = item.type === 'remove' ? '-' : item.type === 'add' ? '+' : ' ';
      return `${prefix} ${item.value}`;
    }).join('\n');
    
    try {
      await navigator.clipboard.writeText(diffText);
    } catch {
      // Silent fail
    }
  };

  const handleExport = () => {
    const exportData = {
      text1,
      text2,
      stats,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-diff-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLineColor = (type: string) => {
    if (type === 'add') return 'bg-green-500/20 dark:bg-green-900/30';
    if (type === 'remove') return 'bg-red-500/20 dark:bg-red-900/30';
    return '';
  };

  const getLinePrefix = (type: string) => {
    if (type === 'add') return '+';
    if (type === 'remove') return '-';
    return ' ';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <FileDiff className="h-5 w-5 text-primary" />
                </div>
                Text Diff
              </CardTitle>
              <CardDescription className="mt-2">
                Compare two texts and see the differences between them.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Options */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ignore-whitespace"
                  checked={ignoreWhitespace}
                  onCheckedChange={setIgnoreWhitespace}
                />
                <Label htmlFor="ignore-whitespace" className="text-sm cursor-pointer">
                  Ignore whitespace
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ignore-case"
                  checked={ignoreCase}
                  onCheckedChange={setIgnoreCase}
                />
                <Label htmlFor="ignore-case" className="text-sm cursor-pointer">
                  Ignore case
                </Label>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleCopyDiff}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Diff
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary">
                {stats.unchanged} unchanged lines
              </Badge>
              <Badge variant="destructive">
                {stats.removed} removed
              </Badge>
              <Badge className="bg-green-600">
                {stats.added} added
              </Badge>
              <Badge variant="outline">
                {stats.totalChanges} total changes
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Text 1</Label>
                <Textarea 
                  value={text1} 
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="Enter first text..."
                  className="font-mono min-h-[200px] md:min-h-[300px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Text 2</Label>
                <Textarea 
                  value={text2} 
                  onChange={(e) => setText2(e.target.value)}
                  placeholder="Enter second text..."
                  className="font-mono min-h-[200px] md:min-h-[300px] resize-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Diff View - Text 1</Label>
                <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                <div className="font-mono text-sm">
                  {diffResult1.map((item, index) => (
                    <div 
                      key={`left-${index}`} 
                      className={`flex ${getLineColor(item.type)} border-b last:border-b-0 hover:bg-muted/50 transition-colors`}
                    >
                      <div className="w-10 shrink-0 text-center border-r bg-muted/50 text-muted-foreground text-xs py-1">
                        {item.lineNumber || ' '}
                      </div>
                      <pre className="p-2 flex-1 overflow-x-auto whitespace-pre-wrap break-words">
                        <code className={`${item.type === 'remove' ? 'text-red-600 dark:text-red-400' : item.type === 'equal' ? 'text-muted-foreground' : ''}`}>
                          {item.value ? `${getLinePrefix(item.type)} ${item.value}` : ' '}
                        </code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Diff View - Text 2</Label>
                <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                <div className="font-mono text-sm">
                  {diffResult2.map((item, index) => (
                    <div 
                      key={`right-${index}`} 
                      className={`flex ${getLineColor(item.type)} border-b last:border-b-0 hover:bg-muted/50 transition-colors`}
                    >
                      <div className="w-10 shrink-0 text-center border-r bg-muted/50 text-muted-foreground text-xs py-1">
                        {item.lineNumber || ' '}
                      </div>
                      <pre className="p-2 flex-1 overflow-x-auto whitespace-pre-wrap break-words">
                        <code className={`${item.type === 'add' ? 'text-green-600 dark:text-green-400' : item.type === 'equal' ? 'text-muted-foreground' : ''}`}>
                          {item.value ? `${getLinePrefix(item.type)} ${item.value}` : ' '}
                        </code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextDiffComponent;