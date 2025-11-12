'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tab';
import { Copy, CheckCircle2 } from 'lucide-react';
import { RequestTab } from '@/lib/api-grid/types';
import { generateSnippets, CodeSnippet } from '@/lib/api-grid/snippets';
import { useToast } from '@/hooks/use-toast';

interface CodeSnippetsPanelProps {
  activeTab: RequestTab;
  baseUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CodeSnippetsPanelComponent({
  activeTab,
  baseUrl,
  open,
  onOpenChange,
}: CodeSnippetsPanelProps) {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const snippets = useMemo(() => {
    return generateSnippets(activeTab, baseUrl);
  }, [activeTab, baseUrl]);

  const handleCopy = useCallback(async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      toast({
        title: 'Copied',
        description: 'Code snippet copied to clipboard',
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy code snippet',
        variant: 'destructive',
      });
    }
  }, [toast]);

  if (!open) return null;

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Code Snippets</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </div>

      <Tabs defaultValue={snippets[0]?.language} className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-lg h-11 overflow-x-auto">
          {snippets.map((snippet) => (
            <TabsTrigger
              key={snippet.language}
              value={snippet.language}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 text-xs whitespace-nowrap"
            >
              {snippet.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {snippets.map((snippet, index) => (
          <TabsContent key={snippet.language} value={snippet.language} className="mt-4">
            <div className="relative border rounded-xl bg-muted/20 backdrop-blur-sm">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleCopy(snippet.code, index)}
                >
                  {copiedIndex === index ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                <code>{snippet.code}</code>
              </pre>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export const CodeSnippetsPanel = React.memo(CodeSnippetsPanelComponent);

