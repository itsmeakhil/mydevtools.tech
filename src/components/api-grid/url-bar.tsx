'use client';

import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Save, X } from 'lucide-react';
import { MethodSelect } from './method-select';
import { HttpMethod, RequestTab, Environment } from '@/lib/api-grid/types';
import { interpolateVariables } from '@/lib/api-grid/helpers';

interface UrlBarProps {
  activeTab: RequestTab;
  isLoading: boolean;
  environment?: Environment | null;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onUrlPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onCancel: () => void;
  onSave: () => void;
}

function UrlBarComponent({
  activeTab,
  isLoading,
  environment,
  onMethodChange,
  onUrlChange,
  onUrlPaste,
  onSend,
  onCancel,
  onSave,
}: UrlBarProps) {
  const isSendDisabled = useMemo(
    () => !isLoading && !activeTab.url.trim(),
    [isLoading, activeTab.url]
  );

  const handleUrlInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUrlChange(e.target.value);
    },
    [onUrlChange]
  );

  const previewUrl = useMemo(() => {
    if (!environment || !activeTab.url) return null;
    return interpolateVariables(activeTab.url, environment);
  }, [activeTab.url, environment]);

  const hasVariables = useMemo(() => {
    if (!environment || !activeTab.url) return false;
    const varPattern = /\$\{([^}]+)\}|\{\{([^}]+)\}\}/g;
    return varPattern.test(activeTab.url);
  }, [activeTab.url, environment]);

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-center bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
        <MethodSelect value={activeTab.method} onChange={onMethodChange} />
        <div className="flex-1">
          <Input
            placeholder="https://api.example.com/endpoint or paste cURL command"
            value={activeTab.url}
            onChange={handleUrlInputChange}
            onPaste={onUrlPaste}
            className="font-mono w-full h-11 text-sm border-2 focus-visible:ring-2"
          />
          {hasVariables && previewUrl && previewUrl !== activeTab.url && (
            <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
              Preview: {previewUrl}
            </div>
          )}
        </div>
        <Button
          onClick={isLoading ? onCancel : onSend}
          disabled={isSendDisabled}
          className="h-11 px-6 shadow-sm hover:shadow-md transition-all font-semibold"
          size="default"
          variant={isLoading ? 'destructive' : 'default'}
        >
          {isLoading ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onSave} className="h-11 px-4">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

export const UrlBar = React.memo(UrlBarComponent);

