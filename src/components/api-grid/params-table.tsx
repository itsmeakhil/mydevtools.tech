'use client';

import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { KeyValuePair } from '@/lib/api-grid/types';

interface ParamsTableProps {
  params: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof KeyValuePair, value: any) => void;
  onRemove: (id: string) => void;
}

function ParamsTableComponent({ params, onAdd, onUpdate, onRemove }: ParamsTableProps) {
  const allDisabled = useMemo(
    () => params.every(p => !p.enabled || p.key.trim() === ''),
    [params]
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
                  onCheckedChange={(checked) => handleUpdate(param.id, 'enabled', checked)}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="key"
                  value={param.key}
                  onChange={(e) => handleUpdate(param.id, 'key', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="value"
                  value={param.value}
                  onChange={(e) => handleUpdate(param.id, 'value', e.target.value)}
                  className="font-mono border-0 h-8"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(param.id)}
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

export const ParamsTable = React.memo(ParamsTableComponent);

