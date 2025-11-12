'use client';

import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Save, X } from 'lucide-react';
import { MethodSelect } from './method-select';
import { HttpMethod, RequestTab } from '@/lib/api-grid/types';

interface UrlBarProps {
  activeTab: RequestTab;
  isLoading: boolean;
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
  return (
    <div className="flex gap-3 items-center bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <MethodSelect value={activeTab.method} onChange={onMethodChange} />
      <Input
        placeholder="https://api.example.com/endpoint or paste cURL command"
        value={activeTab.url}
        onChange={handleUrlInputChange}
        onPaste={onUrlPaste}
        className="font-mono flex-1 h-11 text-sm border-2 focus-visible:ring-2"
      />
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
  );
}

export const UrlBar = React.memo(UrlBarComponent);

