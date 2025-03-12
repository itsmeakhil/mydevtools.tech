'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface DiffResult {
  type: 'add' | 'remove' | 'equal';
  value: string;
  lineNumber: number;
}

const TextDiffComponent = () => {
  const [text1, setText1] = useState<string>('international\nin\non\nimages');
  const [text2, setText2] = useState<string>('international\nin\none\nimage\n');
  const [diffResult1, setDiffResult1] = useState<DiffResult[]>([]);
  const [diffResult2, setDiffResult2] = useState<DiffResult[]>([]);

  // Use memoized callback to keep reference stable
  const computeDiff = useCallback(() => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    
    const result1: DiffResult[] = [];
    const result2: DiffResult[] = [];
    
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = i < lines1.length ? lines1[i] : '';
      const line2 = i < lines2.length ? lines2[i] : '';
      
      if (line1 === line2) {
        result1.push({ type: 'equal', value: line1, lineNumber: i + 1 });
        result2.push({ type: 'equal', value: line2, lineNumber: i + 1 });
      } else {
        result1.push({ type: 'remove', value: line1, lineNumber: i + 1 });
        result2.push({ type: 'add', value: line2, lineNumber: i + 1 });
      }
    }
    
    setDiffResult1(result1);
    setDiffResult2(result2);
  }, [text1, text2]);
  
  // Automatically compute diff when text1 or text2 changes
  useEffect(() => {
    computeDiff();
  }, [computeDiff]);

  // Update handler for text1
  const handleText1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText1(e.target.value);
  };

  // Update handler for text2
  const handleText2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText2(e.target.value);
  };

  const getLineColor = (type: string) => {
    if (type === 'add') return 'bg-yellow-500/20';
    if (type === 'remove') return 'bg-red-500/20';
    return '';
  };

  const getLinePrefix = (type: string) => {
    if (type === 'add') return '+';
    if (type === 'remove') return '-';
    return ' ';
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Text diff</CardTitle>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Compare two texts and see the differences between them.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Textarea 
              value={text1} 
              onChange={handleText1Change}
              placeholder="Enter first text"
              className="min-h-32"
            />
            <Textarea 
              value={text2} 
              onChange={handleText2Change}
              placeholder="Enter second text"
              className="min-h-32"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="border rounded-md overflow-hidden">
              <div className="font-mono text-sm overflow-x-auto">
                {diffResult1.map((item, index) => (
                  <div 
                    key={`left-${index}`} 
                    className={`flex ${getLineColor(item.type)} border-b last:border-b-0 hover:bg-muted/50`}
                  >
                    <div className="w-8 text-center border-r bg-muted/50 text-muted-foreground">
                      {item.lineNumber}
                    </div>
                    <pre className="p-1 flex-1 overflow-x-auto">
                      <code className={item.type === 'remove' ? 'text-red-500' : ''}>
                        {getLinePrefix(item.type)}{item.value}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="font-mono text-sm overflow-x-auto">
                {diffResult2.map((item, index) => (
                  <div 
                    key={`right-${index}`} 
                    className={`flex ${getLineColor(item.type)} border-b last:border-b-0 hover:bg-muted/50`}
                  >
                    <div className="w-8 text-center border-r bg-muted/50 text-muted-foreground">
                      {item.lineNumber}
                    </div>
                    <pre className="p-1 flex-1 overflow-x-auto">
                      <code className={item.type === 'add' ? 'text-yellow-500' : ''}>
                        {getLinePrefix(item.type)}{item.value}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextDiffComponent;