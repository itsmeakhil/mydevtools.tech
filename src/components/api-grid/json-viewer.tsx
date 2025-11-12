'use client';

import React, { useMemo } from 'react';

interface JSONViewerProps {
  data: string;
  className?: string;
}

function JSONViewerComponent({ data, className = '' }: JSONViewerProps) {
  const { formatted, isJSON, error } = useMemo(() => {
    if (!data || !data.trim()) {
      return { formatted: '', isJSON: false, error: null };
    }

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(data);
      const formatted = JSON.stringify(parsed, null, 2);
      return { formatted, isJSON: true, error: null };
    } catch (e) {
      // Not valid JSON, return as-is
      return { formatted: data, isJSON: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
    }
  }, [data]);

  // If we have an error but the data looks like JSON (starts with { or [), show error
  const trimmedData = data?.trim() || '';
  if (error && !isJSON && (trimmedData.startsWith('{') || trimmedData.startsWith('['))) {
    // Looks like JSON but has syntax errors
    return (
      <div className={`${className} text-red-500 dark:text-red-400 font-mono text-sm`}>
        <div className="mb-2 text-xs font-semibold">JSON Parse Error:</div>
        <pre className="whitespace-pre-wrap break-words leading-relaxed">{data}</pre>
      </div>
    );
  }

  if (isJSON && formatted) {
    // Format JSON with basic syntax highlighting
    return (
      <pre className={`${className} font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90`}>
        <code className="json-viewer">{formatted}</code>
      </pre>
    );
  }

  // Not JSON, return as plain text
  return (
    <pre className={`${className} font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90`}>
      {formatted || data}
    </pre>
  );
}

export const JSONViewer = React.memo(JSONViewerComponent);

