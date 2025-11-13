'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tab';
import { Loader2, FileText, Link as LinkIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportCurl?: (curlString: string) => void;
  onImportHar?: (harData: any) => void;
  onImportOpenAPI?: (openApiData: any, source: 'url' | 'file') => void;
}

export function ImportModal({
  open,
  onOpenChange,
  onImportCurl,
  onImportHar,
  onImportOpenAPI,
}: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<'curl' | 'har' | 'openapi'>('curl');
  const [curlInput, setCurlInput] = useState('');
  const [harInput, setHarInput] = useState('');
  const [openApiUrl, setOpenApiUrl] = useState('');
  const [openApiFile, setOpenApiFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (activeTab === 'har') {
        setHarInput('');
        setOpenApiFile(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            setHarInput(content);
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to read file',
              variant: 'destructive',
            });
          }
        };
        reader.readAsText(file);
      } else if (activeTab === 'openapi') {
        setOpenApiFile(file);
        setOpenApiUrl('');
      }
    }
  }, [activeTab, toast]);

  const handleImportCurl = useCallback(async () => {
    if (!curlInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a cURL command',
        variant: 'destructive',
      });
      return;
    }

    if (onImportCurl) {
      onImportCurl(curlInput);
      setCurlInput('');
      onOpenChange(false);
    }
  }, [curlInput, onImportCurl, onOpenChange, toast]);

  const handleImportHar = useCallback(async () => {
    if (!harInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste HAR JSON or select a HAR file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const harData = JSON.parse(harInput);
      if (!harData.log || !harData.log.entries) {
        throw new Error('Invalid HAR format');
      }

      if (onImportHar) {
        onImportHar(harData);
        setHarInput('');
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid HAR format',
        variant: 'destructive',
      });
    }
  }, [harInput, onImportHar, onOpenChange, toast]);

  const handleImportOpenAPI = useCallback(async () => {
    setIsLoading(true);
    try {
      let openApiData: any;

      if (openApiFile) {
        // Read from file
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            openApiData = JSON.parse(content);
            
            if (onImportOpenAPI) {
              onImportOpenAPI(openApiData, 'file');
              setOpenApiFile(null);
              setOpenApiUrl('');
              onOpenChange(false);
            }
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to parse OpenAPI file. Make sure it\'s valid JSON or YAML.',
              variant: 'destructive',
            });
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsText(openApiFile);
        return;
      } else if (openApiUrl.trim()) {
        // Fetch from URL
        const response = await fetch(openApiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          openApiData = await response.json();
        } else if (contentType.includes('yaml') || contentType.includes('yml') || openApiUrl.endsWith('.yaml') || openApiUrl.endsWith('.yml')) {
          // For YAML, we'll need to parse it - for now, try to fetch as text and parse
          const text = await response.text();
          // Simple YAML to JSON conversion (basic support)
          // In production, you'd want to use a proper YAML parser
          toast({
            title: 'YAML Support',
            description: 'YAML parsing is limited. Please use JSON format or convert YAML to JSON first.',
            variant: 'default',
          });
          return;
        } else {
          // Try JSON anyway
          openApiData = await response.json();
        }
      } else {
        toast({
          title: 'Error',
          description: 'Please provide either a URL or select a file',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (onImportOpenAPI) {
        onImportOpenAPI(openApiData, openApiFile ? 'file' : 'url');
        setOpenApiFile(null);
        setOpenApiUrl('');
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import OpenAPI spec',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [openApiUrl, openApiFile, onImportOpenAPI, onOpenChange, toast]);

  const handleClose = useCallback(() => {
    setCurlInput('');
    setHarInput('');
    setOpenApiUrl('');
    setOpenApiFile(null);
    setActiveTab('curl');
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Request</DialogTitle>
          <DialogDescription>
            Import requests from cURL commands, HAR files, or OpenAPI specifications
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="har">HAR</TabsTrigger>
            <TabsTrigger value="openapi">OpenAPI</TabsTrigger>
          </TabsList>

          <TabsContent value="curl" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="curl-input">Paste cURL Command</Label>
              <Textarea
                id="curl-input"
                placeholder={`curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name":"John"}'`}
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                className="font-mono text-sm min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Paste your cURL command here. It will be parsed and populated into the current request tab.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImportCurl}>
                Import
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="har" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="har-input">Paste HAR JSON or Select File</Label>
              <Textarea
                id="har-input"
                placeholder="Paste HAR JSON here..."
                value={harInput}
                onChange={(e) => setHarInput(e.target.value)}
                className="font-mono text-sm min-h-[200px]"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".har,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="har-file-input"
                />
                <Label
                  htmlFor="har-file-input"
                  className="cursor-pointer"
                >
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Select HAR File
                    </span>
                  </Button>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Import requests from a HAR (HTTP Archive) file. The first request will be loaded into the current tab.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImportHar}>
                Import
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="openapi" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openapi-url">OpenAPI URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="openapi-url"
                    placeholder="https://api.example.com/openapi.json"
                    value={openApiUrl}
                    onChange={(e) => {
                      setOpenApiUrl(e.target.value);
                      setOpenApiFile(null);
                    }}
                    disabled={!!openApiFile}
                  />
                  <Button variant="outline" size="icon" disabled={!!openApiFile}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openapi-file">OpenAPI File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileChange}
                    className="hidden"
                    id="openapi-file-input"
                  />
                  <Label
                    htmlFor="openapi-file-input"
                    className="cursor-pointer flex-1"
                  >
                    <Button variant="outline" className="w-full" asChild disabled={!!openApiUrl}>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {openApiFile ? openApiFile.name : 'Select OpenAPI File'}
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Import an OpenAPI specification. A new collection will be created with all endpoints grouped by tags.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleImportOpenAPI} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Import
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

