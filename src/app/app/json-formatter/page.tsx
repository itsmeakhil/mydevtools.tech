"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tab';
import {
  Code,
  TreePine,
  Table2,
  Sparkles,
  Minimize2,
  CheckCircle2,
  Copy,
  Download,
  Upload,
  ArrowLeftRight,
  Search,
  Shield,
  Wrench
} from 'lucide-react';
import { EditorMode, EditorState } from '@/components/json-editor/types';
import TextEditor from '@/components/json-editor/TextEditor';
import RepairDialog from '@/components/json-editor/RepairDialog';
import TreeView from '@/components/json-editor/TreeView';
import TableView from '@/components/json-editor/TableView';
import CompareDialog from '@/components/json-editor/CompareDialog';
import TransformDialog from '@/components/json-editor/TransformDialog';
import SchemaValidator from '@/components/json-editor/SchemaValidator';
import {
  importJSONFromFile,
  exportJSONToFile,
  exportJSONAsCSV
} from '@/lib/json-utils/import-export';

export default function JsonEditorPage() {
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
    if (isDragging) {
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
  }, [isDragging]);

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

  const handleImport = async () => {
    try {
      const content = await importJSONFromFile();
      handleContentChange('left', content);
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  const handleExport = () => {
    const content = leftPanel.content || rightPanel.content;
    if (!content) return;
    exportJSONToFile(content, 'data.json');
  };

  const handleExportCSV = () => {
    const content = leftPanel.content || rightPanel.content;
    if (!content) return;
    const result = exportJSONAsCSV(content, 'data.csv');
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3 md:p-4 lg:p-6 flex flex-col overflow-hidden">
      <div className="max-w-[1800px] mx-auto w-full flex flex-col gap-3 flex-1 overflow-hidden">
        {/* Header */}
        <Card className="border shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">JSON Editor</h1>
                  <p className="text-xs text-muted-foreground">
                    Edit, format, validate, and compare JSON with multiple view modes
                  </p>
                </div>
              </div>

              {/* Global Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleImport}
                >
                  <Upload className="h-3 w-3" />
                  Import
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleExport}
                  disabled={!leftPanel.content && !rightPanel.content}
                >
                  <Download className="h-3 w-3" />
                  Export JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setQueryPanel('left');
                    setTransformDialogOpen(true);
                  }}
                  disabled={!leftPanel.content && !rightPanel.content}
                >
                  <Search className="h-3 w-3" />
                  Query
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setValidatePanel('left');
                    setSchemaValidatorOpen(true);
                  }}
                  disabled={!leftPanel.content && !rightPanel.content}
                >
                  <Shield className="h-3 w-3" />
                  Validate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Editor Area */}
        <div className="editor-container grid gap-3 flex-1 overflow-hidden relative" style={{
          gridTemplateColumns: `${leftWidth}% 8px ${100 - leftWidth}%`,
        }}>
          {/* Left Panel */}
          <EditorPanel
            label="Left Panel"
            state={leftPanel}
            onModeChange={(mode) => handleModeChange('left', mode)}
            onContentChange={(content) => handleContentChange('left', content)}
            onFormat={() => formatJSON('left')}
            onMinify={() => minifyJSON('left')}
            onRepair={(content) => handleContentChange('left', content)}
          />

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

          {/* Right Panel */}
          <EditorPanel
            label="Right Panel"
            state={rightPanel}
            onModeChange={(mode) => handleModeChange('right', mode)}
            onContentChange={(content) => handleContentChange('right', content)}
            onFormat={() => formatJSON('right')}
            onMinify={() => minifyJSON('right')}
            onRepair={(content) => handleContentChange('right', content)}
          />
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
  label: string;
  state: EditorState;
  onModeChange: (mode: EditorMode) => void;
  onContentChange: (content: string) => void;
  onFormat: () => void;
  onMinify: () => void;
  onRepair: (repairedContent: string) => void;
}

function EditorPanel({
  label,
  state,
  onModeChange,
  onContentChange,
  onFormat,
  onMinify,
  onRepair,
}: EditorPanelProps) {
  const [copied, setCopied] = useState(false);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  return (
    <Card className="border shadow-lg flex flex-col h-full overflow-hidden">
      <CardContent className="p-3 flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2">
          {/* Mode Tabs */}
          <Tabs value={state.mode} onValueChange={(v) => onModeChange(v as EditorMode)}>
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="text" className="h-7 px-2.5 text-xs gap-1">
                <Code className="h-3 w-3" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="tree" className="h-7 px-2.5 text-xs gap-1">
                <TreePine className="h-3 w-3" />
                <span className="hidden sm:inline">Tree</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="h-7 px-2.5 text-xs gap-1">
                <Table2 className="h-3 w-3" />
                <span className="hidden sm:inline">Table</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onFormat}
              className="h-7 px-2 text-xs gap-1"
              disabled={!state.isValid}
            >
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Format</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMinify}
              className="h-7 px-2 text-xs gap-1"
              disabled={!state.isValid}
            >
              <Minimize2 className="h-3 w-3" />
              <span className="hidden sm:inline">Minify</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 px-2 text-xs gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRepairDialogOpen(true)}
              className="h-7 px-2 text-xs gap-1"
              disabled={!state.error}
              title="Auto-repair JSON errors"
            >
              <Wrench className="h-3 w-3" />
              <span className="hidden sm:inline">Repair</span>
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{label}</span>
          {state.isValid && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Valid</span>
            </div>
          )}
          {state.error && (
            <span className="text-destructive">{state.error}</span>
          )}
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
