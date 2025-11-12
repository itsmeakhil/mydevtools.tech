'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { KeyValuePair } from './types';

interface ParamsTableProps {
  params: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof KeyValuePair, value: any) => void;
  onRemove: (id: string) => void;
}

export function ParamsTable({ params, onAdd, onUpdate, onRemove }: ParamsTableProps) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={params.every(p => !p.enabled || p.key.trim() === '')} />
            </TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {params.map((param) => (
            <TableRow key={param.id}>
              <TableCell>
                <Checkbox
                  checked={param.enabled}
                  onCheckedChange={(checked) => onUpdate(param.id, 'enabled', checked)}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="key"
                  value={param.key}
                  onChange={(e) => onUpdate(param.id, 'key', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="value"
                  value={param.value}
                  onChange={(e) => onUpdate(param.id, 'value', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(param.id)}
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

