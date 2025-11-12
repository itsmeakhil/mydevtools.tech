'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Environment } from '@/lib/api-grid/types';

interface EnvironmentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environments: Environment[];
  onSaveEnvironment: (environment: Environment) => void;
  onDeleteEnvironment: (environmentId: string) => void;
  onSetDefault: (environmentId: string) => void;
}

function EnvironmentManagerComponent({
  open,
  onOpenChange,
  environments,
  onSaveEnvironment,
  onDeleteEnvironment,
  onSetDefault,
}: EnvironmentManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingVariables, setEditingVariables] = useState<Array<{ key: string; value: string }>>([]);
  const [nameError, setNameError] = useState('');

  const handleAddEnvironment = useCallback(() => {
    setEditingId(null);
    setEditingName('New Environment');
    setEditingVariables([{ key: '', value: '' }]);
    setNameError('');
  }, []);

  const handleEditEnvironment = useCallback(
    (env: Environment) => {
      setEditingId(env.id);
      setEditingName(env.name);
      const variables = Object.entries(env.variables || {}).map(([key, value]) => ({ key, value }));
      setEditingVariables(variables.length > 0 ? variables : [{ key: '', value: '' }]);
      setNameError('');
    },
    []
  );

  const handleSaveEnvironment = useCallback(() => {
    if (!editingName.trim()) {
      setNameError('Environment name cannot be empty');
      return;
    }

    // Check for duplicate names (excluding current editing environment)
    const nameExists = environments.some(
      env => env.name.toLowerCase() === editingName.trim().toLowerCase() && env.id !== editingId
    );
    if (nameExists) {
      setNameError('An environment with this name already exists');
      return;
    }

    // Build variables object from array
    const variables: Record<string, string> = {};
    editingVariables.forEach(({ key, value }) => {
      if (key.trim()) {
        variables[key.trim()] = value;
      }
    });

    const environment: Environment = {
      id: editingId || Date.now().toString(),
      name: editingName.trim(),
      variables,
      timestamp: editingId ? environments.find(e => e.id === editingId)?.timestamp || Date.now() : Date.now(),
    };

    onSaveEnvironment(environment);
    setEditingId(null);
    setEditingName('');
    setEditingVariables([{ key: '', value: '' }]);
    setNameError('');
  }, [editingId, editingName, editingVariables, environments, onSaveEnvironment]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName('');
    setEditingVariables([{ key: '', value: '' }]);
    setNameError('');
  }, []);

  const handleAddVariable = useCallback(() => {
    setEditingVariables([...editingVariables, { key: '', value: '' }]);
  }, [editingVariables]);

  const handleUpdateVariable = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      const updated = [...editingVariables];
      updated[index] = { ...updated[index], [field]: value };
      setEditingVariables(updated);
    },
    [editingVariables]
  );

  const handleRemoveVariable = useCallback(
    (index: number) => {
      const updated = editingVariables.filter((_, i) => i !== index);
      setEditingVariables(updated.length > 0 ? updated : [{ key: '', value: '' }]);
    },
    [editingVariables]
  );

  const handleDeleteEnvironment = useCallback(
    (environmentId: string) => {
      if (window.confirm('Are you sure you want to delete this environment?')) {
        onDeleteEnvironment(environmentId);
      }
    },
    [onDeleteEnvironment]
  );

  const nonEditingEnvironments = useMemo(
    () => environments.filter(env => env.id !== editingId),
    [environments, editingId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Environments</DialogTitle>
          <DialogDescription>
            Create and manage environments with variables that can be used in your requests.
            Use <code className="text-xs bg-muted px-1 py-0.5 rounded">${'{VAR}'}</code> or{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{VAR}}'}</code> syntax in URLs, headers, and body.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Environments List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Environments</Label>
              <Button variant="outline" size="sm" onClick={handleAddEnvironment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Environment
              </Button>
            </div>

            {nonEditingEnvironments.length === 0 && !editingId && (
              <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                No environments yet. Click "Add Environment" to create one.
              </div>
            )}

            <div className="space-y-2">
              {nonEditingEnvironments.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{env.name}</span>
                    {env.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(env.variables || {}).length} variable(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!env.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetDefault(env.id)}
                        className="text-xs"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditEnvironment(env)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteEnvironment(env.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit/Add Form */}
          {editingId !== null && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <Label htmlFor="env-name">Environment Name</Label>
                <Input
                  id="env-name"
                  value={editingName}
                  onChange={(e) => {
                    setEditingName(e.target.value);
                    setNameError('');
                  }}
                  className={nameError ? 'border-destructive' : ''}
                  placeholder="e.g., Development, Production"
                />
                {nameError && <p className="text-sm text-destructive mt-1">{nameError}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Variables</Label>
                  <Button variant="outline" size="sm" onClick={handleAddVariable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {editingVariables.map((variable, index) => (
                    <div key={index} className="space-y-2 border rounded-lg p-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Variable name"
                          value={variable.key}
                          onChange={(e) => handleUpdateVariable(index, 'key', e.target.value)}
                          className="font-mono flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 flex-shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveVariable(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Variable value"
                        value={variable.value}
                        onChange={(e) => handleUpdateVariable(index, 'value', e.target.value)}
                        className="font-mono min-h-[80px] resize-y"
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveEnvironment}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Add New Environment Form */}
          {editingId === null && editingName && (
            <div className="border-t pt-4 space-y-4 mt-4">
              <div>
                <Label htmlFor="new-env-name">Environment Name</Label>
                <Input
                  id="new-env-name"
                  value={editingName}
                  onChange={(e) => {
                    setEditingName(e.target.value);
                    setNameError('');
                  }}
                  className={nameError ? 'border-destructive' : ''}
                  placeholder="e.g., Development, Production"
                />
                {nameError && <p className="text-sm text-destructive mt-1">{nameError}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Variables</Label>
                  <Button variant="outline" size="sm" onClick={handleAddVariable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {editingVariables.map((variable, index) => (
                    <div key={index} className="space-y-2 border rounded-lg p-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Variable name"
                          value={variable.key}
                          onChange={(e) => handleUpdateVariable(index, 'key', e.target.value)}
                          className="font-mono flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 flex-shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveVariable(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Variable value"
                        value={variable.value}
                        onChange={(e) => handleUpdateVariable(index, 'value', e.target.value)}
                        className="font-mono min-h-[80px] resize-y"
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveEnvironment}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const EnvironmentManager = React.memo(EnvironmentManagerComponent);

