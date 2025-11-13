'use client';

import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { RequestTab, HttpMethod } from '@/lib/api-grid/types';
import { getMethodColor } from '@/lib/api-grid/helpers';

interface RequestTabsProps {
  tabs: RequestTab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onAddTab: () => void;
}

function RequestTabsComponent({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onAddTab,
}: RequestTabsProps) {
  const handleTabClick = useCallback(
    (tabId: string) => {
      onTabClick(tabId);
    },
    [onTabClick]
  );

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      onTabClose(tabId);
    },
    [onTabClose]
  );
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
      <div className="flex items-center overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2.5 px-4 py-3 border-r cursor-pointer min-w-[200px] flex-shrink-0 transition-all ${
              activeTabId === tab.id
                ? 'bg-background border-b-2 border-b-primary shadow-sm'
                : 'hover:bg-muted/30'
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            <Badge
              variant="outline"
              className={`font-mono text-xs font-semibold px-2 py-0.5 border ${getMethodColor(tab.method)}`}
            >
              {tab.method}
            </Badge>
            <span className="text-sm truncate flex-1 font-medium">{tab.name}</span>
            {tab.isModified && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive shrink-0"
                onClick={(e) => handleTabClose(e, tab.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={onAddTab} className="ml-2 flex-shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export const RequestTabs = React.memo(RequestTabsComponent);

