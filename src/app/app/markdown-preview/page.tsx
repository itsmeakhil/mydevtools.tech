'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, FileText, Eye, Check, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const defaultMarkdown = `# Markdown Preview Tool

Write your markdown here and see the preview in real-time!

## Features

- **Bold text** and *italic text*
- Lists and more
- Code blocks
- Tables
- And much more!

### Example Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Example Table

| Feature | Status |
|---------|--------|
| Preview | ✅ |
| Editor | ✅ |
| Export | ✅ |

### Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item

1. Numbered item
2. Another numbered item

> This is a blockquote
> It can span multiple lines

### Links and Images

[Visit GitHub](https://github.com)

---

Happy writing! 🎉
`;

export default function MarkdownPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ml-0 mr-0 px-0 w-full">
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Main Editor */}
        <MarkdownPreview />
      </div>
    </div>
  );
}

function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMarkdown('');
  };

  const handleReset = () => {
    setMarkdown(defaultMarkdown);
  };

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;
  const lineCount = markdown.split('\n').length;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              Markdown Editor & Preview
            </CardTitle>
            <CardDescription className="mt-2">
              Write markdown and see live preview with GitHub Flavored Markdown support
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={viewMode === 'split' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              Split
            </Button>
            <Button
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('editor')}
            >
              Editor
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              Preview
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleCopy} variant="outline" size="lg" className="flex-1">
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copy Markdown
              </>
            )}
          </Button>
          <Button onClick={handleDownload} variant="outline" size="lg" className="flex-1">
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            Reset
          </Button>
          <Button onClick={handleClear} variant="outline" size="lg">
            Clear
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Words</p>
            <p className="text-2xl font-bold">{wordCount}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Characters</p>
            <p className="text-2xl font-bold">{charCount}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Lines</p>
            <p className="text-2xl font-bold">{lineCount}</p>
          </div>
        </div>

        {/* Editor/Preview Grid */}
        <div className={`grid gap-6 ${viewMode === 'split' ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {/* Editor */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>Markdown Editor</span>
                  <Badge variant="secondary">{charCount} chars</Badge>
                </label>
              </div>
              <Textarea
                placeholder="Write your markdown here..."
                className="font-mono min-h-[500px] resize-none"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />
            </div>
          )}

          {/* Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>Preview</span>
                  <Badge variant="secondary">Live</Badge>
                </label>
              </div>
              <div className="border rounded-lg p-6 min-h-[500px] bg-muted/30 overflow-auto">
                {markdown.trim() ? (
                  <div className="markdown-preview">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
                        h5: ({node, ...props}) => <h5 className="text-base font-bold mt-2 mb-1" {...props} />,
                        h6: ({node, ...props}) => <h6 className="text-sm font-bold mt-2 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="ml-4" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />,
                        code: ({ node, inline, ...props }: any) => 
                          inline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                          ) : (
                            <code className="block bg-muted p-4 rounded my-4 overflow-x-auto text-sm font-mono" {...props} />
                          ),
                        pre: ({node, ...props}) => <pre className="bg-muted p-4 rounded my-4 overflow-x-auto" {...props} />,
                        a: ({node, ...props}) => <a className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer" {...props} />,
                        table: ({node, ...props}) => <table className="border-collapse border border-border my-4 w-full" {...props} />,
                        thead: ({node, ...props}) => <thead className="bg-muted" {...props} />,
                        tbody: ({node, ...props}) => <tbody {...props} />,
                        tr: ({node, ...props}) => <tr className="border-b border-border" {...props} />,
                        th: ({node, ...props}) => <th className="border border-border px-4 py-2 text-left font-bold" {...props} />,
                        td: ({node, ...props}) => <td className="border border-border px-4 py-2" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-6 border-border" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Preview will appear here...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-2">Markdown Features</h3>
          <ul className="text-sm text-muted-foreground space-y-1 grid grid-cols-1 md:grid-cols-2 gap-1">
            <li>• Headers (# H1, ## H2, etc.)</li>
            <li>• **Bold** and *italic* text</li>
            <li>• Code blocks with syntax highlighting</li>
            <li>• Inline `code`</li>
            <li>• Tables (GitHub Flavored)</li>
            <li>• Task lists (GitHub Flavored)</li>
            <li>• Strikethrough text</li>
            <li>• Blockquotes</li>
            <li>• Links and images</li>
            <li>• Lists (ordered and unordered)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

