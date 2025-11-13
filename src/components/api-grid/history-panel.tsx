'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  History,
  Play,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { RequestHistory } from '@/lib/api-grid/types';
import { getStatusColor, getMethodColor } from '@/lib/api-grid/helpers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  history: RequestHistory[];
  isLoading: boolean;
  onRerun: (historyEntry: RequestHistory) => void;
  onClearAll: () => void;
  onClearRange: (startDate: number, endDate: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function HistoryPanelComponent({
  history,
  isLoading,
  onRerun,
  onClearAll,
  onClearRange,
  open,
  onOpenChange,
}: HistoryPanelProps) {
  const { toast } = useToast();
  const [showClearRangeDialog, setShowClearRangeDialog] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Format full date
  const formatFullDate = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }, []);

  // Filter history by search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;

    const query = searchQuery.toLowerCase();
    return history.filter(entry => {
      return (
        entry.method.toLowerCase().includes(query) ||
        entry.url.toLowerCase().includes(query) ||
        entry.statusText.toLowerCase().includes(query) ||
        entry.status.toString().includes(query)
      );
    });
  }, [history, searchQuery]);

  // Handle clear range
  const handleClearRange = useCallback(() => {
    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (start > end) {
      toast({
        title: 'Error',
        description: 'Start date must be before end date',
        variant: 'destructive',
      });
      return;
    }

    onClearRange(start, end);
    setShowClearRangeDialog(false);
    setStartDate('');
    setEndDate('');
  }, [startDate, endDate, onClearRange, toast]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onClearAll();
    setShowClearAllDialog(false);
  }, [onClearAll]);

  // Get status icon
  const getStatusIcon = useCallback((status: number) => {
    if (status >= 200 && status < 300) {
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    } else if (status >= 400) {
      return <AlertCircle className="w-3.5 h-3.5" />;
    }
    return null;
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Request History
            </DialogTitle>
            <DialogDescription>
              View and re-run your previous requests
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Search and Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                {searchQuery ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                ) : (
                  <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearRangeDialog(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Clear Range
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearAllDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* History List */}
            <ScrollArea className="flex-1 border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <History className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No history found' : 'No request history yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredHistory.map((entry) => {
                    const statusColor = getStatusColor(entry.status);
                    const methodColor = getMethodColor(entry.method);
                    const statusIcon = getStatusIcon(entry.status);

                    return (
                      <div
                        key={entry.id}
                        className="p-4 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn(methodColor, 'font-mono text-xs')}>
                                {entry.method}
                              </Badge>
                              <span className="text-sm font-mono text-muted-foreground truncate flex-1">
                                {entry.url}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={cn(statusColor, 'px-2 py-0.5 text-xs')}>
                                {statusIcon}
                                <span className="ml-1">{entry.status}</span>
                                <span className="ml-1">{entry.statusText}</span>
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{entry.duration}ms</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{formatTimestamp(entry.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onRerun(entry);
                                onOpenChange(false);
                              }}
                              className="h-8"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Re-run
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Footer Info */}
            <div className="text-xs text-muted-foreground text-center">
              Showing {filteredHistory.length} of {history.length} requests
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Range Dialog */}
      <Dialog open={showClearRangeDialog} onOpenChange={setShowClearRangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear History by Date Range</DialogTitle>
            <DialogDescription>
              Select a date range to clear history entries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowClearRangeDialog(false);
                setStartDate('');
                setEndDate('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleClearRange}>Clear Range</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All History?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all request history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const HistoryPanel = React.memo(HistoryPanelComponent);

