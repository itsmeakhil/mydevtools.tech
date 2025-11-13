'use client';

import React, { useCallback, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HttpMethod } from '@/lib/api-grid/types';
import { getMethodColor } from '@/lib/api-grid/helpers';

interface MethodSelectProps {
  value: HttpMethod;
  onChange: (value: HttpMethod) => void;
}

function MethodSelectComponent({ value, onChange }: MethodSelectProps) {
  const methodColor = useMemo(() => getMethodColor(value), [value]);
  
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue as HttpMethod);
    },
    [onChange]
  );
  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={`w-32 font-mono font-semibold h-11 ${methodColor}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="GET" className="font-mono font-semibold">GET</SelectItem>
        <SelectItem value="POST" className="font-mono font-semibold">POST</SelectItem>
        <SelectItem value="PUT" className="font-mono font-semibold">PUT</SelectItem>
        <SelectItem value="DELETE" className="font-mono font-semibold">DELETE</SelectItem>
        <SelectItem value="PATCH" className="font-mono font-semibold">PATCH</SelectItem>
        <SelectItem value="HEAD" className="font-mono font-semibold">HEAD</SelectItem>
        <SelectItem value="OPTIONS" className="font-mono font-semibold">OPTIONS</SelectItem>
      </SelectContent>
    </Select>
  );
}

export const MethodSelect = React.memo(MethodSelectComponent);

