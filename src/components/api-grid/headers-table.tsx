'use client';

import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { KeyValuePair } from '@/lib/api-grid/types';

interface HeadersTableProps {
  headers: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof KeyValuePair, value: any) => void;
  onRemove: (id: string) => void;
}

function HeadersTableComponent({ headers, onAdd, onUpdate, onRemove }: HeadersTableProps) {
  const allDisabled = useMemo(
    () => headers.every(h => !h.enabled || h.key.trim() === ''),
    [headers]
  );

  const handleUpdate = useCallback(
    (id: string, field: keyof KeyValuePair, value: any) => {
      onUpdate(id, field, value);
    },
    [onUpdate]
  );

  const handleRemove = useCallback(
    (id: string) => {
      onRemove(id);
    },
    [onRemove]
  );
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allDisabled} />
            </TableHead>
            <TableHead>Header Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {headers.map((header) => (
            <TableRow key={header.id}>
              <TableCell>
                <Checkbox
                  checked={header.enabled}
                  onCheckedChange={(checked) => handleUpdate(header.id, 'enabled', checked)}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => handleUpdate(header.id, 'key', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) => handleUpdate(header.id, 'value', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(header.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-2 border-t">
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
}

export const HeadersTable = React.memo(HeadersTableComponent);

