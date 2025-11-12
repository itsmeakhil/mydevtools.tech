'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HttpMethod } from './types';
import { getMethodColor } from './helpers';

interface MethodSelectProps {
  value: HttpMethod;
  onChange: (value: HttpMethod) => void;
}

export function MethodSelect({ value, onChange }: MethodSelectProps) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as HttpMethod)}>
      <SelectTrigger className={`w-32 font-mono font-semibold h-11 ${getMethodColor(value)}`}>
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

