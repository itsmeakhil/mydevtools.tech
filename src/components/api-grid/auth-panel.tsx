'use client';

import React, { useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthType, RequestTab } from '@/lib/api-grid/types';

interface AuthPanelProps {
  activeTab: RequestTab;
  onUpdate: (updates: Partial<RequestTab>) => void;
}

function AuthPanelComponent({ activeTab, onUpdate }: AuthPanelProps) {
  const handleAuthTypeChange = useCallback(
    (value: string) => {
      onUpdate({ authType: value as AuthType });
    },
    [onUpdate]
  );

  const handleTokenChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        authData: { ...activeTab.authData, token: e.target.value },
      });
    },
    [onUpdate, activeTab.authData]
  );

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        authData: { ...activeTab.authData, username: e.target.value },
      });
    },
    [onUpdate, activeTab.authData]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        authData: { ...activeTab.authData, password: e.target.value },
      });
    },
    [onUpdate, activeTab.authData]
  );

  const handleKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        authData: { ...activeTab.authData, key: e.target.value },
      });
    },
    [onUpdate, activeTab.authData]
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        authData: { ...activeTab.authData, value: e.target.value },
      });
    },
    [onUpdate, activeTab.authData]
  );

  const handleAddToChange = useCallback(
    (value: 'header' | 'query') => {
      onUpdate({
        authData: { ...activeTab.authData, addTo: value },
      });
    },
    [onUpdate, activeTab.authData]
  );

  return (
    <div className="space-y-4">
      <div>
        <Label>Type</Label>
        <Select value={activeTab.authType} onValueChange={handleAuthTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="apiKey">API Key</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeTab.authType === 'bearer' && (
        <div>
          <Label>Token</Label>
          <Input
            placeholder="Enter bearer token"
            value={activeTab.authData.token || ''}
            onChange={handleTokenChange}
            className="font-mono"
          />
        </div>
      )}

      {activeTab.authType === 'basic' && (
        <div className="space-y-2">
          <div>
            <Label>Username</Label>
            <Input
              placeholder="Username"
              value={activeTab.authData.username || ''}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={activeTab.authData.password || ''}
              onChange={handlePasswordChange}
            />
          </div>
        </div>
      )}

      {activeTab.authType === 'apiKey' && (
        <div className="space-y-2">
          <div>
            <Label>Key</Label>
            <Input
              placeholder="API Key name"
              value={activeTab.authData.key || ''}
              onChange={handleKeyChange}
            />
          </div>
          <div>
            <Label>Value</Label>
            <Input
              placeholder="API Key value"
              value={activeTab.authData.value || ''}
              onChange={handleValueChange}
              className="font-mono"
            />
          </div>
          <div>
            <Label>Add to</Label>
            <Select value={activeTab.authData.addTo || 'header'} onValueChange={handleAddToChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="query">Query Params</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

export const AuthPanel = React.memo(AuthPanelComponent);

