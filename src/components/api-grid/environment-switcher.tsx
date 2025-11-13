'use client';

import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { Environment } from '@/lib/api-grid/types';

interface EnvironmentSwitcherProps {
  environments: Environment[];
  activeEnvironmentId: string | null;
  onEnvironmentChange: (environmentId: string | null) => void;
  onManageEnvironments: () => void;
}

function EnvironmentSwitcherComponent({
  environments,
  activeEnvironmentId,
  onEnvironmentChange,
  onManageEnvironments,
}: EnvironmentSwitcherProps) {
  const activeEnvironment = useMemo(
    () => environments.find(env => env.id === activeEnvironmentId) || null,
    [environments, activeEnvironmentId]
  );

  const handleEnvironmentChange = useCallback(
    (value: string) => {
      if (value === 'none') {
        onEnvironmentChange(null);
      } else {
        onEnvironmentChange(value);
      }
    },
    [onEnvironmentChange]
  );

  return (
    <div className="flex items-center gap-2">
      <Select value={activeEnvironmentId || 'none'} onValueChange={handleEnvironmentChange}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="No Environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Environment</SelectItem>
          {environments.map((env) => (
            <SelectItem key={env.id} value={env.id}>
              {env.name}
              {env.isDefault && ' (Default)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={onManageEnvironments}
        title="Manage Environments"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}

export const EnvironmentSwitcher = React.memo(EnvironmentSwitcherComponent);

