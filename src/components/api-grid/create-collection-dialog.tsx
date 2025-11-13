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

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionName: string;
  onCollectionNameChange: (name: string) => void;
  collectionNameError: string;
  parentCollectionId?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  collectionName,
  onCollectionNameChange,
  collectionNameError,
  parentCollectionId,
  onSubmit,
  onCancel,
}: CreateCollectionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          onCancel();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentCollectionId ? 'Create New Folder' : 'Create New Collection'}
          </DialogTitle>
          <DialogDescription>
            {parentCollectionId
              ? `Enter a name for the new folder. The name must be unique within this collection.`
              : 'Enter a name for your new collection. The name must be unique.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">
              {parentCollectionId ? 'Folder Name' : 'Collection Name'}
            </Label>
            <Input
              id="collection-name"
              placeholder={parentCollectionId ? 'My Folder' : 'My Collection'}
              value={collectionName}
              onChange={(e) => {
                onCollectionNameChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSubmit();
                }
              }}
            />
            {collectionNameError && (
              <p className="text-sm text-destructive">{collectionNameError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {parentCollectionId ? 'Create Folder' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

