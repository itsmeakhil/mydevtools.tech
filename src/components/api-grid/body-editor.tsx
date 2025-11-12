'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tab';
import { AlertCircle } from 'lucide-react';
import { BodyType, HttpMethod, RequestTab } from './types';

interface BodyEditorProps {
  activeTab: RequestTab;
  onUpdate: (updates: Partial<RequestTab>) => void;
}

export function BodyEditor({ activeTab, onUpdate }: BodyEditorProps) {
  if (!['POST', 'PUT', 'PATCH'].includes(activeTab.method)) {
    return (
      <div className="text-center text-muted-foreground py-16 bg-card p-8 rounded-lg border">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">This request method doesn't support a body</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-card p-5 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Body Type</Label>
        <Tabs value={activeTab.bodyType} onValueChange={(value) => onUpdate({ bodyType: value as BodyType })}>
          <TabsList className="bg-muted/30 p-1 rounded-lg h-9">
            <TabsTrigger value="json" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">
              JSON
            </TabsTrigger>
            <TabsTrigger value="text" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">
              Text
            </TabsTrigger>
            <TabsTrigger value="form-data" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">
              Form Data
            </TabsTrigger>
            <TabsTrigger value="x-www-form-urlencoded" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">
              URL Encoded
            </TabsTrigger>
            <TabsTrigger value="raw" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs px-3">
              Raw
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Textarea
        placeholder={
          activeTab.bodyType === 'json'
            ? '{\n  "key": "value"\n}'
            : activeTab.bodyType === 'form-data' || activeTab.bodyType === 'x-www-form-urlencoded'
            ? 'key=value'
            : 'Enter body content...'
        }
        value={activeTab.body}
        onChange={(e) => onUpdate({ body: e.target.value })}
        className="font-mono min-h-[300px] text-sm bg-background/50 border-2 focus-visible:ring-2 rounded-lg"
      />
    </div>
  );
}

