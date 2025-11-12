'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tab';
import { Copy, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ApiResponse } from './types';
import { getStatusColor } from './helpers';
import { useToast } from '@/hooks/use-toast';

interface ResponsePanelProps {
  response: ApiResponse;
}

export function ResponsePanel({ response }: ResponsePanelProps) {
  const { toast } = useToast();

  return (
    <div className="space-y-4 border-t pt-6 mt-8">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <Label className="text-lg font-semibold">Response</Label>
          <Badge className={`${getStatusColor(response.status)} px-3 py-1 font-semibold`}>
            {response.status >= 200 && response.status < 300 ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" />
            ) : response.status >= 400 ? (
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 inline" />
            ) : null}
            {response.status} {response.statusText}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{response.time}ms</span>
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shadow-sm hover:shadow-md transition-shadow"
          onClick={() => {
            navigator.clipboard.writeText(response.body);
            toast({
              title: 'Copied',
              description: 'Response copied to clipboard',
            });
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>

      <Tabs defaultValue="body">
        <TabsList className="bg-muted/30 p-1 rounded-lg h-11">
          <TabsTrigger value="body" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            Body
          </TabsTrigger>
          <TabsTrigger value="headers" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            Headers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="body" className="mt-4">
          <div className="border rounded-xl p-4 bg-muted/20 backdrop-blur-sm min-h-[300px] max-h-[600px] overflow-auto shadow-inner">
            {response.status === 0 ? (
              <div className="text-red-500 dark:text-red-400 font-mono text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{response.body}</span>
              </div>
            ) : (
              <pre className="font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
                {response.body}
              </pre>
            )}
          </div>
        </TabsContent>
        <TabsContent value="headers" className="mt-4">
          <div className="border rounded-xl p-4 bg-muted/20 backdrop-blur-sm min-h-[300px] max-h-[600px] overflow-auto shadow-inner">
            <pre className="font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
              {Object.entries(response.headers)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

