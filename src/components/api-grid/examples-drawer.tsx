'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Lock, Play, Copy, CheckCircle2 } from 'lucide-react';
import { RequestTab, HttpMethod } from '@/lib/api-grid/types';
import { useToast } from '@/hooks/use-toast';
import { requiresAuth } from '@/lib/tool-config';
import { getMethodColor } from '@/lib/api-grid/helpers';
import { cn } from '@/lib/utils';

export interface ApiExample {
  id: string;
  name: string;
  description: string;
  method: HttpMethod;
  url: string;
  headers?: Array<{ key: string; value: string }>;
  params?: Array<{ key: string; value: string }>;
  body?: string;
  bodyType?: 'json' | 'text';
  requiresAuth: boolean;
  category: string;
}

const API_EXAMPLES: ApiExample[] = [
  {
    id: 'shorten',
    name: 'Shorten URL',
    description: 'Create a shortened URL from a long URL. Optionally provide a custom alias.',
    method: 'POST',
    url: '/api/shorten',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    body: JSON.stringify({
      long_url: 'https://example.com/very/long/url/path',
      alias: 'my-custom-alias',
    }, null, 2),
    bodyType: 'json',
    requiresAuth: requiresAuth('/app/url-shortener'),
    category: 'URL Shortener',
  },
  {
    id: 'shorten-no-alias',
    name: 'Shorten URL (No Alias)',
    description: 'Create a shortened URL without a custom alias.',
    method: 'POST',
    url: '/api/shorten',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    body: JSON.stringify({
      long_url: 'https://example.com/very/long/url/path',
    }, null, 2),
    bodyType: 'json',
    requiresAuth: requiresAuth('/app/url-shortener'),
    category: 'URL Shortener',
  },
  {
    id: 'stats',
    name: 'Get Analytics Stats',
    description: 'Retrieve analytics statistics for shortened URLs.',
    method: 'GET',
    url: '/api/stats',
    headers: [
      { key: 'Accept', value: 'application/json' },
    ],
    requiresAuth: false,
    category: 'Analytics',
  },
];

interface ExamplesDrawerProps {
  onLoadExample: (example: ApiExample) => void;
  user?: { uid: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ExamplesDrawerComponent({
  onLoadExample,
  user,
  open,
  onOpenChange,
}: ExamplesDrawerProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleLoadExample = useCallback((example: ApiExample) => {
    if (example.requiresAuth && !user?.uid) {
      toast({
        title: 'Authentication Required',
        description: 'This example requires authentication. Please log in first.',
        variant: 'destructive',
      });
      return;
    }

    onLoadExample(example);
    onOpenChange(false);
    toast({
      title: 'Example Loaded',
      description: `Loaded example: ${example.name}`,
    });
  }, [onLoadExample, user, toast, onOpenChange]);

  const handleCopyExample = useCallback(async (example: ApiExample) => {
    try {
      const exampleText = `${example.method} ${example.url}\n\n${example.description}\n\n${example.body || ''}`;
      await navigator.clipboard.writeText(exampleText);
      setCopiedId(example.id);
      toast({
        title: 'Copied',
        description: 'Example details copied to clipboard',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy example',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Group examples by category
  const examplesByCategory = React.useMemo(() => {
    const grouped: Record<string, ApiExample[]> = {};
    API_EXAMPLES.forEach(example => {
      if (!grouped[example.category]) {
        grouped[example.category] = [];
      }
      grouped[example.category].push(example);
    });
    return grouped;
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            API Examples
          </SheetTitle>
          <SheetDescription>
            Prebuilt examples for testing API endpoints. Click "Load" to use an example in your request builder.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
          <div className="space-y-6 pr-4">
            {Object.entries(examplesByCategory).map(([category, examples]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-3">
                  {examples.map((example) => {
                    const methodColor = getMethodColor(example.method);
                    const needsAuth = example.requiresAuth && !user?.uid;

                    return (
                      <div
                        key={example.id}
                        className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn(methodColor, 'font-mono text-xs')}>
                                {example.method}
                              </Badge>
                              <span className="font-mono text-sm text-foreground">
                                {example.url}
                              </span>
                              {example.requiresAuth && (
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Auth Required
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold mb-1">{example.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {example.description}
                            </p>
                          </div>
                        </div>

                        {example.body && (
                          <div className="mb-3">
                            <div className="text-xs font-semibold text-muted-foreground mb-1">
                              Request Body:
                            </div>
                            <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto">
                              <code>{example.body}</code>
                            </pre>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleLoadExample(example)}
                            disabled={needsAuth}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Load Example
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyExample(example)}
                          >
                            {copiedId === example.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        {needsAuth && (
                          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Please log in to use this example</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export const ExamplesDrawer = React.memo(ExamplesDrawerComponent);

