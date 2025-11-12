'use client';

import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tab';
import { Copy, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ApiResponse } from '@/lib/api-grid/types';
import { getStatusColor } from '@/lib/api-grid/helpers';
import { useToast } from '@/hooks/use-toast';

interface ResponsePanelProps {
  response: ApiResponse;
}

function ResponsePanelComponent({ response }: ResponsePanelProps) {
  const { toast } = useToast();

  const statusColor = useMemo(() => getStatusColor(response.status), [response.status]);
  
  const statusIcon = useMemo(() => {
    if (response.status >= 200 && response.status < 300) {
      return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" />;
    } else if (response.status >= 400) {
      return <AlertCircle className="w-3.5 h-3.5 mr-1.5 inline" />;
    }
    return null;
  }, [response.status]);

  const headersText = useMemo(
    () => Object.entries(response.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n'),
    [response.headers]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(response.body);
    toast({
      title: 'Copied',
      description: 'Response copied to clipboard',
    });
  }, [response.body, toast]);

  return (
    <div className="space-y-4 border-t pt-6 mt-8">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <Label className="text-lg font-semibold">Response</Label>
          <Badge className={`${statusColor} px-3 py-1 font-semibold`}>
            {statusIcon}
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
          onClick={handleCopy}
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
              {headersText}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const ResponsePanel = React.memo(ResponsePanelComponent);

