'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileJson, 
  FileText, 
  Key, 
  Shield, 
  User, 
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeyValuePair, AuthType } from '@/lib/api-grid/types';

interface HeaderPreset {
  name: string;
  icon: React.ReactNode;
  headers: Array<{ key: string; value: string }>;
}

interface AuthPreset {
  name: string;
  icon: React.ReactNode;
  type: AuthType;
  description: string;
}

interface PresetsPanelProps {
  mode: 'headers' | 'auth';
  onApplyHeaders?: (headers: Array<{ key: string; value: string }>) => void;
  onApplyAuth?: (authType: AuthType, addTo: 'header' | 'query') => void;
  className?: string;
}

const headerPresets: HeaderPreset[] = [
  {
    name: 'JSON',
    icon: <FileJson className="h-4 w-4" />,
    headers: [{ key: 'Content-Type', value: 'application/json' }],
  },
  {
    name: 'Form Data',
    icon: <FileText className="h-4 w-4" />,
    headers: [{ key: 'Content-Type', value: 'multipart/form-data' }],
  },
  {
    name: 'URL Encoded',
    icon: <FileText className="h-4 w-4" />,
    headers: [{ key: 'Content-Type', value: 'application/x-www-form-urlencoded' }],
  },
  {
    name: 'XML',
    icon: <FileText className="h-4 w-4" />,
    headers: [{ key: 'Content-Type', value: 'application/xml' }],
  },
  {
    name: 'Plain Text',
    icon: <FileText className="h-4 w-4" />,
    headers: [{ key: 'Content-Type', value: 'text/plain' }],
  },
  {
    name: 'HTML',
    icon: <FileText className="h-4 w-4" />,
    headers: [{ key: 'Content-Type', value: 'text/html' }],
  },
];

const authPresets: AuthPreset[] = [
  {
    name: 'Bearer Token',
    icon: <Shield className="h-4 w-4" />,
    type: 'bearer',
    description: 'OAuth 2.0 / JWT token',
  },
  {
    name: 'Basic Auth',
    icon: <User className="h-4 w-4" />,
    type: 'basic',
    description: 'Username and password',
  },
  {
    name: 'API Key',
    icon: <Key className="h-4 w-4" />,
    type: 'apiKey',
    description: 'Custom API key',
  },
];

export function PresetsPanel({ 
  mode, 
  onApplyHeaders, 
  onApplyAuth,
  className = '' 
}: PresetsPanelProps) {
  const [showAuthOptions, setShowAuthOptions] = React.useState<string | null>(null);

  const handleHeaderPreset = useCallback((preset: HeaderPreset) => {
    if (onApplyHeaders) {
      onApplyHeaders(preset.headers);
    }
  }, [onApplyHeaders]);

  const handleAuthPreset = useCallback((preset: AuthPreset, addTo: 'header' | 'query') => {
    if (onApplyAuth) {
      onApplyAuth(preset.type, addTo);
      setShowAuthOptions(null);
    }
  }, [onApplyAuth]);

  if (mode === 'headers') {
    return (
      <div className={`flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border ${className}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
          <Zap className="h-4 w-4" />
          Quick Add:
        </div>
        {headerPresets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => handleHeaderPreset(preset)}
          >
            {preset.icon}
            <span className="ml-1.5">{preset.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  if (mode === 'auth') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Zap className="h-4 w-4" />
          Quick Setup:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {authPresets.map((preset) => (
            <div key={preset.type} className="relative">
              <DropdownMenu 
                open={showAuthOptions === preset.type}
                onOpenChange={(open) => setShowAuthOptions(open ? preset.type : null)}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {preset.icon}
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{preset.name}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </div>
                    {showAuthOptions === preset.type ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Apply to</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAuthPreset(preset, 'header')}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">Header</span>
                      <span className="text-xs text-muted-foreground">
                        Add as HTTP header
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAuthPreset(preset, 'query')}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">Query Parameter</span>
                      <span className="text-xs text-muted-foreground">
                        Add as URL parameter
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

