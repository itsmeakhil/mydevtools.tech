'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { KeyValuePair } from './types';

interface HeadersTableProps {
  headers: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof KeyValuePair, value: any) => void;
  onRemove: (id: string) => void;
}

export function HeadersTable({ headers, onAdd, onUpdate, onRemove }: HeadersTableProps) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={headers.every(h => !h.enabled || h.key.trim() === '')} />
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
                  onCheckedChange={(checked) => onUpdate(header.id, 'enabled', checked)}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => onUpdate(header.id, 'key', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) => onUpdate(header.id, 'value', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(header.id)}
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

