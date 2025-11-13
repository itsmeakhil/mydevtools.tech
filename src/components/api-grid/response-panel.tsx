'use client';

import React, { useCallback, useMemo, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tab';
import { Copy, CheckCircle2, AlertCircle, Clock, Loader2, Download, FileText, Image as ImageIcon, Code2, Eye } from 'lucide-react';
import { ApiResponse } from '@/lib/api-grid/types';
import { getStatusColor } from '@/lib/api-grid/helpers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Dynamically import JSONViewer
const JSONViewer = React.lazy(() => 
  import('./json-viewer').then(module => ({ default: module.JSONViewer }))
);

interface ResponsePanelProps {
  response: ApiResponse;
}

type ViewMode = 'pretty' | 'raw' | 'preview';

function ResponsePanelComponent({ response }: ResponsePanelProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('pretty');

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

  const contentType = useMemo(() => {
    return response.headers['content-type'] || response.headers['Content-Type'] || '';
  }, [response.headers]);

  const isJSONResponse = useMemo(() => {
    if (!response.body || !response.body.trim()) return false;
    if (contentType.includes('application/json')) return true;
    // Try to parse as JSON
    try {
      JSON.parse(response.body);
      return true;
    } catch {
      return false;
    }
  }, [response.body, contentType]);

  const isImageResponse = useMemo(() => {
    if (!response.body) return false;
    return contentType.startsWith('image/');
  }, [response.body, contentType]);

  const isHTMLResponse = useMemo(() => {
    if (!response.body) return false;
    return contentType.includes('text/html') || contentType.includes('application/xhtml+xml');
  }, [response.body, contentType]);

  const isSafeForPreview = useMemo(() => {
    // Only allow preview for images and HTML (when safe)
    return isImageResponse || (isHTMLResponse && response.status < 400);
  }, [isImageResponse, isHTMLResponse, response.status]);

  // Format content length
  const formatContentLength = useCallback((bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(response.body);
    toast({
      title: 'Copied',
      description: 'Response copied to clipboard',
    });
  }, [response.body, toast]);

  const handleSaveToFile = useCallback(() => {
    try {
      // Determine file extension and MIME type
      let extension = '.txt';
      let mimeType = 'text/plain';
      let blob: Blob;

      if (isJSONResponse) {
        extension = '.json';
        mimeType = 'application/json';
        blob = new Blob([response.body], { type: mimeType });
      } else if (isImageResponse) {
        const imageType = contentType.split('/')[1];
        extension = imageType ? `.${imageType.split(';')[0]}` : '.png';
        mimeType = contentType;
        
        // If body is a data URL, extract the base64 data and create blob
        if (response.body.startsWith('data:')) {
          const base64Data = response.body.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
        } else {
          blob = new Blob([response.body], { type: mimeType });
        }
      } else if (isHTMLResponse) {
        extension = '.html';
        mimeType = 'text/html';
        blob = new Blob([response.body], { type: mimeType });
      } else if (contentType.includes('text/css')) {
        extension = '.css';
        mimeType = 'text/css';
        blob = new Blob([response.body], { type: mimeType });
      } else if (contentType.includes('text/javascript') || contentType.includes('application/javascript')) {
        extension = '.js';
        mimeType = 'application/javascript';
        blob = new Blob([response.body], { type: mimeType });
      } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
        extension = '.xml';
        mimeType = 'application/xml';
        blob = new Blob([response.body], { type: mimeType });
      } else {
        blob = new Blob([response.body], { type: mimeType });
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `response${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Saved',
        description: `Response saved to file`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save response to file',
        variant: 'destructive',
      });
    }
  }, [response.body, contentType, isJSONResponse, isImageResponse, isHTMLResponse, toast]);

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span>Loading viewer...</span>
    </div>
  );

  // Determine default view mode
  const defaultViewMode = useMemo(() => {
    if (isImageResponse) return 'preview';
    if (isHTMLResponse && isSafeForPreview) return 'preview';
    if (isJSONResponse) return 'pretty';
    return 'raw';
  }, [isJSONResponse, isImageResponse, isHTMLResponse, isSafeForPreview]);

  // Auto-set view mode on response change
  React.useEffect(() => {
    setViewMode(defaultViewMode);
  }, [defaultViewMode]);

  // Render preview content
  const renderPreview = useCallback(() => {
    if (isImageResponse) {
      // Check if body is already a data URL (from blob conversion)
      const dataUrl = response.body.startsWith('data:') 
        ? response.body 
        : `data:${contentType};base64,${btoa(unescape(encodeURIComponent(response.body)))}`;
      
      return (
        <div className="flex items-center justify-center p-8">
          <img
            src={dataUrl}
            alt="Response preview"
            className="max-w-full max-h-[600px] object-contain rounded-lg border shadow-sm"
            onError={(e) => {
              // If image fails to load, show error
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="text-muted-foreground text-sm p-4">Unable to preview image</div>';
              }
            }}
          />
        </div>
      );
    }

    if (isHTMLResponse && isSafeForPreview) {
      // Render HTML in iframe for safety
      const htmlContent = response.body;
      const iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      return (
        <div className="w-full h-full border rounded-lg overflow-hidden">
          <iframe
            src={iframeSrc}
            className="w-full h-[600px] border-0"
            title="HTML Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      );
    }

    return (
      <div className="text-muted-foreground text-sm p-4">
        Preview not available for this content type
      </div>
    );
  }, [isImageResponse, isHTMLResponse, isSafeForPreview, response.body, contentType]);

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
          {response.contentLength !== undefined && (
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="font-medium">{formatContentLength(response.contentLength)}</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-sm hover:shadow-md transition-shadow"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-sm hover:shadow-md transition-shadow"
            onClick={handleSaveToFile}
          >
            <Download className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="body" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-lg h-11">
          <TabsTrigger value="body" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            Body
          </TabsTrigger>
          <TabsTrigger value="headers" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            Headers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="body" className="mt-4">
          {/* View Mode Selector - Only show if applicable */}
          {(isJSONResponse || isSafeForPreview) && (
            <div className="mb-4 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
                {isJSONResponse && (
                  <Button
                    variant={viewMode === 'pretty' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setViewMode('pretty')}
                  >
                    <Code2 className="w-3 h-3 mr-1.5" />
                    Pretty
                  </Button>
                )}
                <Button
                  variant={viewMode === 'raw' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setViewMode('raw')}
                >
                  <FileText className="w-3 h-3 mr-1.5" />
                  Raw
                </Button>
                {isSafeForPreview && (
                  <Button
                    variant={viewMode === 'preview' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="w-3 h-3 mr-1.5" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="border rounded-xl p-4 bg-muted/20 backdrop-blur-sm min-h-[300px] max-h-[600px] overflow-auto shadow-inner">
            {response.status === 0 ? (
              <div className="text-red-500 dark:text-red-400 font-mono text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{response.body}</span>
              </div>
            ) : viewMode === 'preview' && isSafeForPreview ? (
              renderPreview()
            ) : viewMode === 'pretty' && isJSONResponse ? (
              <Suspense fallback={<LoadingFallback />}>
                <JSONViewer data={response.body} searchable={true} />
              </Suspense>
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
