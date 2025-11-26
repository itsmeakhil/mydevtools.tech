import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Trash2,
    Download,
    ArrowUpDown,
    AlertCircle,
    Maximize2,
    Pencil,
    Check,
    X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { JSONValue } from './types';
import TextEditor from './TextEditor';

interface TableViewProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
}

type SortDirection = 'asc' | 'desc' | null;

export default function TableView({ value, onChange, error }: TableViewProps) {
    const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Complex cell editing state
    const [complexEditorOpen, setComplexEditorOpen] = useState(false);
    const [complexEditData, setComplexEditData] = useState<{ row: number; col: string; value: string; error: string | null } | null>(null);

    let parsed: JSONValue = null;
    let parseError: string | null = null;

    try {
        if (value.trim()) {
            parsed = JSON.parse(value);
        }
    } catch (err) {
        parseError = err instanceof Error ? err.message : 'Invalid JSON';
    }

    // Check if data is suitable for table view (array of objects)
    const isTableData = Array.isArray(parsed) && parsed.length > 0 &&
        parsed.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

    // Get columns from the first object
    const columns = useMemo(() => {
        if (!isTableData) return [];
        const allKeys = new Set<string>();
        (parsed as Array<Record<string, JSONValue>>).forEach(item => {
            Object.keys(item).forEach(key => allKeys.add(key));
        });
        return Array.from(allKeys);
    }, [parsed, isTableData]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!isTableData || !sortColumn || !sortDirection) {
            return parsed as Array<Record<string, JSONValue>>;
        }

        const data = [...(parsed as Array<Record<string, JSONValue>>)];
        data.sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return data;
    }, [parsed, isTableData, sortColumn, sortDirection]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(
                sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
            );
            if (sortDirection === 'desc') {
                setSortColumn(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleCellEdit = (rowIndex: number, column: string, newValue: string) => {
        try {
            const data = [...sortedData];
            let parsedValue: JSONValue;

            // Try to parse as JSON value
            if (newValue === 'null') {
                parsedValue = null;
            } else if (newValue === 'true' || newValue === 'false') {
                parsedValue = newValue === 'true';
            } else if (!isNaN(Number(newValue)) && newValue.trim() !== '') {
                parsedValue = Number(newValue);
            } else {
                parsedValue = newValue;
            }

            data[rowIndex][column] = parsedValue;
            onChange(JSON.stringify(data, null, 2));
            setEditingCell(null);
        } catch (err) {
            console.error('Failed to edit cell:', err);
        }
    };

    const handleComplexEditSave = () => {
        if (!complexEditData || complexEditData.error) return;

        try {
            const parsedValue = JSON.parse(complexEditData.value);
            const data = [...sortedData];
            data[complexEditData.row][complexEditData.col] = parsedValue;
            onChange(JSON.stringify(data, null, 2));
            setComplexEditorOpen(false);
            setComplexEditData(null);
        } catch (err) {
            console.error('Failed to save complex edit:', err);
        }
    };

    const openComplexEditor = (rowIndex: number, column: string, value: JSONValue) => {
        setComplexEditData({
            row: rowIndex,
            col: column,
            value: JSON.stringify(value, null, 2),
            error: null
        });
        setComplexEditorOpen(true);
    };

    const handleAddRow = () => {
        try {
            const data = [...sortedData];
            const newRow: Record<string, JSONValue> = {};
            columns.forEach(col => {
                newRow[col] = '';
            });
            data.push(newRow);
            onChange(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error('Failed to add row:', err);
        }
    };

    const handleDeleteRow = (rowIndex: number) => {
        try {
            const data = [...sortedData];
            data.splice(rowIndex, 1);
            onChange(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error('Failed to delete row:', err);
        }
    };

    const handleExportCSV = () => {
        if (!isTableData) return;

        const csv = [
            columns.join(','),
            ...sortedData.map(row =>
                columns.map(col => {
                    const val = row[col];
                    const str = val === null ? '' : String(val);
                    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
                }).join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatCellValue = (val: JSONValue): string => {
        if (val === null) return 'null';
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'object') {
            if (Array.isArray(val)) return `Array[${val.length}]`;
            // Show preview of object content if small
            const keys = Object.keys(val);
            if (keys.length <= 2) {
                return `{ ${keys.map(k => `${k}:...`).join(', ')} }`;
            }
            return `Object{${keys.length}}`;
        }
        return String(val);
    };

    const getCellColor = (val: JSONValue): string => {
        if (val === null) return 'text-gray-500';
        if (typeof val === 'boolean') return 'text-purple-600 dark:text-purple-400';
        if (typeof val === 'number') return 'text-blue-600 dark:text-blue-400';
        if (typeof val === 'string') return 'text-green-600 dark:text-green-400';
        return 'text-foreground';
    };

    if (parseError || error) {
        return (
            <div className="p-4 h-full flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Cannot display table view: {parseError || error}
                        <div className="mt-2 text-xs">
                            Please fix JSON errors in Text mode or use the Repair feature.
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!parsed) {
        return (
            <div className="p-4 h-full flex items-center justify-center text-sm text-muted-foreground">
                Paste or type JSON array to view as table...
            </div>
        );
    }

    if (!isTableData) {
        return (
            <div className="p-4 h-full flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Table view requires an array of objects.
                        <div className="mt-2 text-xs">
                            Example:
                            <pre className="mt-1 p-2 bg-muted rounded text-xs">
                                {`[
  {"name": "John", "age": 30},
  {"name": "Jane", "age": 25}
]`}
                            </pre>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
                <div className="flex-1 text-xs text-muted-foreground">
                    {sortedData.length} row{sortedData.length !== 1 ? 's' : ''} × {columns.length} column{columns.length !== 1 ? 's' : ''}
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddRow}
                    className="h-7 px-2 text-xs gap-1"
                >
                    <Plus className="h-3 w-3" />
                    <span className="hidden sm:inline">Add Row</span>
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExportCSV}
                    className="h-7 px-2 text-xs gap-1"
                >
                    <Download className="h-3 w-3" />
                    <span className="hidden sm:inline">Export CSV</span>
                </Button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-center">#</TableHead>
                            {columns.map(column => (
                                <TableHead key={column} className="min-w-[120px]">
                                    <button
                                        onClick={() => handleSort(column)}
                                        className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                    >
                                        {column}
                                        {sortColumn === column && (
                                            <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                </TableHead>
                            ))}
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="group">
                                <TableCell className="text-center text-xs text-muted-foreground">
                                    {rowIndex + 1}
                                </TableCell>
                                {columns.map(column => {
                                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === column;
                                    const cellValue = row[column];
                                    const isComplex = typeof cellValue === 'object' && cellValue !== null;

                                    return (
                                        <TableCell
                                            key={column}
                                            className="p-1"
                                            onDoubleClick={() => {
                                                if (isComplex) {
                                                    openComplexEditor(rowIndex, column, cellValue);
                                                } else {
                                                    setEditingCell({ row: rowIndex, col: column });
                                                    setEditValue(formatCellValue(cellValue));
                                                }
                                            }}
                                        >
                                            {isEditing ? (
                                                <Input
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => handleCellEdit(rowIndex, column, editValue)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleCellEdit(rowIndex, column, editValue);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setEditingCell(null);
                                                        }
                                                    }}
                                                    className="h-7 px-2 text-xs"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="relative group/cell">
                                                    <div className={`px-2 py-1 text-xs font-mono ${getCellColor(cellValue)} cursor-pointer hover:bg-muted/50 rounded truncate max-w-[200px]`}>
                                                        {formatCellValue(cellValue)}
                                                    </div>
                                                    {isComplex && (
                                                        <div className="absolute top-0 right-0 hidden group-hover/cell:block z-10">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm"
                                                                onClick={() => openComplexEditor(rowIndex, column, cellValue)}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="p-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                        onClick={() => handleDeleteRow(rowIndex)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Info */}
            <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
                Double-click any cell to edit. Click column headers to sort.
            </div>

            {/* Complex Editor Dialog */}
            <Dialog open={complexEditorOpen} onOpenChange={setComplexEditorOpen}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Cell Content</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
                        {complexEditData && (
                            <TextEditor
                                value={complexEditData.value}
                                onChange={(val) => {
                                    let error = null;
                                    try {
                                        JSON.parse(val);
                                    } catch (e) {
                                        error = (e as Error).message;
                                    }
                                    setComplexEditData({ ...complexEditData, value: val, error });
                                }}
                                error={complexEditData.error}
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setComplexEditorOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleComplexEditSave}
                            disabled={!!complexEditData?.error}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
