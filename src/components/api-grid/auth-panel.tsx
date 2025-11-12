'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthType, RequestTab } from './types';

interface AuthPanelProps {
  activeTab: RequestTab;
  onUpdate: (updates: Partial<RequestTab>) => void;
}

export function AuthPanel({ activeTab, onUpdate }: AuthPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Type</Label>
        <Select
          value={activeTab.authType}
          onValueChange={(value) => onUpdate({ authType: value as AuthType })}
        >
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
            onChange={(e) =>
              onUpdate({
                authData: { ...activeTab.authData, token: e.target.value },
              })
            }
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
              onChange={(e) =>
                onUpdate({
                  authData: { ...activeTab.authData, username: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={activeTab.authData.password || ''}
              onChange={(e) =>
                onUpdate({
                  authData: { ...activeTab.authData, password: e.target.value },
                })
              }
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
              onChange={(e) =>
                onUpdate({
                  authData: { ...activeTab.authData, key: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Value</Label>
            <Input
              placeholder="API Key value"
              value={activeTab.authData.value || ''}
              onChange={(e) =>
                onUpdate({
                  authData: { ...activeTab.authData, value: e.target.value },
                })
              }
              className="font-mono"
            />
          </div>
          <div>
            <Label>Add to</Label>
            <Select
              value={activeTab.authData.addTo || 'header'}
              onValueChange={(value: 'header' | 'query') =>
                onUpdate({
                  authData: { ...activeTab.authData, addTo: value },
                })
              }
            >
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

