"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tab';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Code,
  TreePine,
  Table2,
  Sparkles,
  Minimize2,
  CheckCircle2,
  Copy,
  ArrowLeftRight,
  Wrench,
  Trash2,
  Maximize2,
  Zap,
  ZapOff
} from 'lucide-react';
import { EditorMode, EditorState } from '@/components/json-editor/types';
import TextEditor from '@/components/json-editor/TextEditor';
import RepairDialog from '@/components/json-editor/RepairDialog';
import TreeView from '@/components/json-editor/TreeView';
import TableView from '@/components/json-editor/TableView';
import CompareDialog from '@/components/json-editor/CompareDialog';
import TransformDialog from '@/components/json-editor/TransformDialog';
import SchemaValidator from '@/components/json-editor/SchemaValidator';
import { useMediaQuery } from '@/hooks/use-media-query';

export default function JsonEditorPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [leftPanel, setLeftPanel] = useState<EditorState>({
    content: '',
    mode: 'text',
    isValid: false,
    error: null,
    parsed: null,
  });

  const [rightPanel, setRightPanel] = useState<EditorState>({
    content: '',
    mode: 'text',
    isValid: false,
    error: null,
    parsed: null,
  });

  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [transformDialogOpen, setTransformDialogOpen] = useState(false);
  const [queryPanel, setQueryPanel] = useState<'left' | 'right'>('left');
  const [schemaValidatorOpen, setSchemaValidatorOpen] = useState(false);
  const [validatePanel, setValidatePanel] = useState<'left' | 'right'>('left');

  // Panel resizing
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.querySelector('.editor-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;

    // Constrain between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging && isDesktop) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isDesktop]);

  const handleModeChange = (panel: 'left' | 'right', mode: EditorMode) => {
    if (panel === 'left') {
      setLeftPanel({ ...leftPanel, mode });
    } else {
      setRightPanel({ ...rightPanel, mode });
    }
  };

  const handleContentChange = (panel: 'left' | 'right', content: string) => {
    let parsed: any = null;
    let isValid = false;
    let error: string | null = null;

    try {
      if (content.trim()) {
        parsed = JSON.parse(content);
        isValid = true;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid JSON';
      isValid = false;
    }

    if (panel === 'left') {
      setLeftPanel({ ...leftPanel, content, parsed, isValid, error });
    } else {
      setRightPanel({ ...rightPanel, content, parsed, isValid, error });
    }
  };

  const formatJSON = (panel: 'left' | 'right') => {
    const state = panel === 'left' ? leftPanel : rightPanel;
    if (!state.parsed) return;

    const formatted = JSON.stringify(state.parsed, null, 2);
    handleContentChange(panel, formatted);
  };

  const minifyJSON = (panel: 'left' | 'right') => {
    const state = panel === 'left' ? leftPanel : rightPanel;
    if (!state.parsed) return;

    const minified = JSON.stringify(state.parsed);
    handleContentChange(panel, minified);
  };

  const copyToOtherPanel = () => {
    setRightPanel({ ...rightPanel, content: leftPanel.content });
    handleContentChange('right', leftPanel.content);
  };

  const [maximizedPanel, setMaximizedPanel] = useState<'left' | 'right' | null>(null);

  const handleClear = (panel: 'left' | 'right') => {
    handleContentChange(panel, '');
  };

  const handleLoadSample = (panel: 'left' | 'right') => {
    const sample = {
      "string": "Hello World",
      "number": 123,
      "boolean": true,
      "null": null,
      "array": [1, 2, 3],
      "object": {
        "key": "value"
      }
    };
    handleContentChange(panel, JSON.stringify(sample, null, 2));
  };

  const toggleMaximize = (panel: 'left' | 'right') => {
    setMaximizedPanel(maximizedPanel === panel ? null : panel);
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-background via-background to-muted/20 p-3 md:p-4 lg:p-6 flex flex-col overflow-hidden">
      <div className="max-w-[1800px] mx-auto w-full flex flex-col gap-3 flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div
          className={`editor-container ${isDesktop && !maximizedPanel ? 'grid' : 'flex flex-col gap-3'} flex-1 overflow-hidden relative min-h-0`}
          style={isDesktop && !maximizedPanel ? {
            gridTemplateColumns: `calc(${leftWidth}% - 4px) 8px calc(${100 - leftWidth}% - 4px)`,
          } : undefined}
        >
          {/* Left Panel */}
          <div className={`${maximizedPanel === 'right' ? 'hidden' : 'flex'} flex-col h-full overflow-hidden`}>
            <EditorPanel
              state={leftPanel}
              onModeChange={(mode) => handleModeChange('left', mode)}
              onContentChange={(content) => handleContentChange('left', content)}
              onFormat={() => formatJSON('left')}
              onMinify={() => minifyJSON('left')}
              onRepair={(content) => handleContentChange('left', content)}
              onClear={() => handleClear('left')}
              onLoadSample={() => handleLoadSample('left')}
              onMaximize={() => toggleMaximize('left')}
              isMaximized={maximizedPanel === 'left'}
              fullHeight={isDesktop}
            />
          </div>

          {isDesktop && !maximizedPanel && (
            <>
              {/* Draggable Divider */}
              <div
                className={`relative flex items-center justify-center group cursor-col-resize ${isDragging ? 'bg-primary/20' : 'hover:bg-primary/10'
                  } transition-colors`}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-border group-hover:bg-primary/30 transition-colors" />
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                </div>
              </div>

              {/* Center Actions - Positioned Absolutely */}
              <div className="hidden lg:flex flex-col items-center justify-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full bg-background shadow-lg"
                    title="Copy left to right"
                    onClick={copyToOtherPanel}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full bg-background shadow-lg"
                    title="Compare JSON"
                    onClick={() => setCompareDialogOpen(true)}
                    disabled={!leftPanel.content && !rightPanel.content}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Right Panel */}
          <div className={`${maximizedPanel === 'left' ? 'hidden' : 'flex'} flex-col h-full overflow-hidden`}>
            <EditorPanel
              state={rightPanel}
              onModeChange={(mode) => handleModeChange('right', mode)}
              onContentChange={(content) => handleContentChange('right', content)}
              onFormat={() => formatJSON('right')}
              onMinify={() => minifyJSON('right')}
              onRepair={(content) => handleContentChange('right', content)}
              onClear={() => handleClear('right')}
              onLoadSample={() => handleLoadSample('right')}
              onMaximize={() => toggleMaximize('right')}
              isMaximized={maximizedPanel === 'right'}
              fullHeight={isDesktop}
            />
          </div>
        </div>
      </div>

      <CompareDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        leftContent={leftPanel.content}
        rightContent={rightPanel.content}
      />

      <TransformDialog
        open={transformDialogOpen}
        onOpenChange={setTransformDialogOpen}
        content={queryPanel === 'left' ? leftPanel.content : rightPanel.content}
        onApply={(result) => {
          handleContentChange(queryPanel, result);
          setTransformDialogOpen(false);
        }}
      />

      <SchemaValidator
        open={schemaValidatorOpen}
        onOpenChange={setSchemaValidatorOpen}
        content={validatePanel === 'left' ? leftPanel.content : rightPanel.content}
      />
    </div>
  );
}

interface EditorPanelProps {
  state: EditorState;
  onModeChange: (mode: EditorMode) => void;
  onContentChange: (content: string) => void;
  onFormat: () => void;
  onMinify: () => void;
  onRepair: (repairedContent: string) => void;
  onClear: () => void;
  onLoadSample: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
  fullHeight?: boolean;
}

function EditorPanel({
  state,
  onModeChange,
  onContentChange,
  onFormat,
  onMinify,
  onRepair,
  onClear,
  onLoadSample,
  onMaximize,
  isMaximized,
  fullHeight = false,
}: EditorPanelProps) {
  const [copied, setCopied] = useState(false);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [autoRepair, setAutoRepair] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const handleAutoRepair = async () => {
    try {
      const { repairJSON } = await import('@/lib/json-utils/repair');
      const result = repairJSON(state.content);
      if (result.wasRepaired) {
        onRepair(result.repaired);
      }
    } catch (err) {
      console.error('Auto-repair failed:', err);
      // Fall back to opening the dialog
      setRepairDialogOpen(true);
    }
  };

  return (
    <Card className={`border shadow-lg flex flex-col ${fullHeight ? 'h-full' : ''} overflow-hidden`}>
      <CardContent className="p-3 flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Mode Tabs */}
          <Tabs value={state.mode} onValueChange={(v) => onModeChange(v as EditorMode)}>
            <TabsList className="h-10 p-1 bg-muted/60">
              <TabsTrigger value="text" className="h-8 px-3.5 text-sm gap-1.5 data-[state=active]:shadow-md transition-all">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="tree" className="h-8 px-3.5 text-sm gap-1.5 data-[state=active]:shadow-md transition-all">
                <TreePine className="h-4 w-4" />
                <span className="hidden sm:inline">Tree</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="h-8 px-3.5 text-sm gap-1.5 data-[state=active]:shadow-md transition-all">
                <Table2 className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Actions */}
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onLoadSample}
                    className="h-8 px-3 text-sm"
                    aria-label="Load Sample"
                  >
                    Sample
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Load Sample JSON</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onFormat}
                    className="h-8 w-9 p-0"
                    disabled={!state.isValid}
                    aria-label="Format JSON"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Format (Ctrl+Shift+F)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onMinify}
                    className="h-8 w-9 p-0"
                    disabled={!state.isValid}
                    aria-label="Minify JSON"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Minify</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 w-9 p-0"
                    aria-label="Copy JSON"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={state.error ? 'default' : 'ghost'}
                    onClick={() => {
                      if (state.error && autoRepair) {
                        handleAutoRepair();
                      } else {
                        setRepairDialogOpen(true);
                      }
                    }}
                    className={`h-8 w-9 p-0 ${state.error ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                    disabled={!state.error && !state.content}
                    aria-label="Repair JSON"
                  >
                    <Wrench className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{state.error ? 'Click to Auto-Repair' : 'Repair'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClear}
                    className="h-8 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Clear"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={autoRepair ? 'default' : 'ghost'}
                    onClick={() => setAutoRepair(!autoRepair)}
                    className={`h-8 w-9 p-0 ${autoRepair ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                    aria-label={autoRepair ? "Disable Auto-Repair" : "Enable Auto-Repair"}
                  >
                    {autoRepair ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{autoRepair ? 'Auto-Repair: ON' : 'Auto-Repair: OFF'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onMaximize}
                    className="h-8 w-9 p-0"
                    aria-label={isMaximized ? "Restore" : "Maximize"}
                  >
                    {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isMaximized ? "Restore" : "Maximize"}</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs px-2 gap-2 mb-2">
          <div className="text-muted-foreground">
            {state.content && (
              <span>{state.content.length} chars • {state.content.split('\n').length} lines</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {state.isValid && (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="font-medium">Valid JSON</span>
              </div>
            )}
            {state.error && (
              <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-2.5 py-1 rounded-full max-w-[200px] truncate" title={state.error}>
                <span className="font-medium">Error: {state.error.split(' ').slice(0, 4).join(' ')}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="border rounded-lg overflow-hidden bg-muted/30 flex-1 flex flex-col">
          {state.mode === 'text' && (
            <TextEditor
              value={state.content}
              onChange={onContentChange}
              error={state.error}
            />
          )}
          {state.mode === 'tree' && (
            <TreeView
              value={state.content}
              onChange={onContentChange}
              error={state.error}
            />
          )}
          {state.mode === 'table' && (
            <TableView
              value={state.content}
              onChange={onContentChange}
              error={state.error}
            />
          )}
        </div>
      </CardContent>

      <RepairDialog
        open={repairDialogOpen}
        onOpenChange={setRepairDialogOpen}
        content={state.content}
        onRepaired={(repaired) => {
          onRepair(repaired);
          setRepairDialogOpen(false);
        }}
      />
    </Card>
  );
}
