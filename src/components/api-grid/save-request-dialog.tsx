'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Folder } from 'lucide-react';
import { Collection } from './types';
import React from 'react';

interface SaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  collectionId: string;
  onCollectionIdChange: (id: string) => void;
  collectionName: string;
  onCollectionNameChange: (name: string) => void;
  requestName: string;
  onRequestNameChange: (name: string) => void;
  showNewCollectionInput: boolean;
  onShowNewCollectionInputChange: (show: boolean) => void;
  errors: { collection?: string; request?: string };
  onSubmit: () => void;
  onCancel: () => void;
}

// Helper function to render collection options recursively for select dropdown
const renderCollectionOptions = (cols: Collection[], depth: number = 0): React.ReactElement[] => {
  const options: React.ReactElement[] = [];
  
  cols.forEach((col) => {
    const indent = '  '.repeat(depth);
    
    options.push(
      <SelectItem key={col.id} value={col.id}>
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono text-xs">{indent}</span>
          <Folder className="h-3 w-3 text-muted-foreground shrink-0" />
          <span>{col.name}</span>
          <span className="text-muted-foreground text-xs">
            ({col.requests.length} {col.requests.length === 1 ? 'request' : 'requests'})
          </span>
        </span>
      </SelectItem>
    );
    
    // Recursively render nested collections
    if (col.collections && col.collections.length > 0) {
      options.push(...renderCollectionOptions(col.collections, depth + 1));
    }
  });
  
  return options;
};

export function SaveRequestDialog({
  open,
  onOpenChange,
  collections,
  collectionId,
  onCollectionIdChange,
  collectionName,
  onCollectionNameChange,
  requestName,
  onRequestNameChange,
  showNewCollectionInput,
  onShowNewCollectionInputChange,
  errors,
  onSubmit,
  onCancel,
}: SaveRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Request</DialogTitle>
          <DialogDescription>
            Save this request to a collection. The collection will be created if it doesn't exist.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-collection-select">Collection</Label>
            {!showNewCollectionInput ? (
              <>
                <div className="flex gap-2">
                  <Select value={collectionId} onValueChange={onCollectionIdChange}>
                    <SelectTrigger id="save-collection-select" className="flex-1">
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {renderCollectionOptions(collections)}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onShowNewCollectionInputChange(true);
                      onCollectionIdChange('');
                      onCollectionNameChange('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {collections.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No collections yet. Click the + button to create one.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    id="save-collection-name"
                    placeholder="New collection name"
                    value={collectionName}
                    onChange={(e) => {
                      onCollectionNameChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onShowNewCollectionInputChange(false);
                      onCollectionNameChange('');
                      if (collections.length > 0) {
                        onCollectionIdChange(collections[0].id);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            {errors.collection && (
              <p className="text-sm text-destructive">{errors.collection}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="save-request-name">Request Name</Label>
            <Input
              id="save-request-name"
              placeholder="Untitled Request"
              value={requestName}
              onChange={(e) => {
                onRequestNameChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  onSubmit();
                }
              }}
            />
            {errors.request && (
              <p className="text-sm text-destructive">{errors.request}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The request name must be unique within the selected collection.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

