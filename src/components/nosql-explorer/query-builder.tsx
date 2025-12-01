"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconSearch, IconHistory, IconX, IconPlus, IconTrash, IconMaximize, IconCode, IconAdjustments, IconCheck } from "@tabler/icons-react";
import CodeEditor from "@/components/ui/code-editor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QueryBuilderProps {
    query: string;
    onSearch: (query: string) => void;
    fields: string[];
    connectionName: string;
    dbName: string;
    collectionName: string;
}

type FilterOperator = "$eq" | "$gt" | "$lt" | "$gte" | "$lte" | "$ne" | "$in" | "$regex";

interface FilterRule {
    id: string;
    field: string;
    operator: FilterOperator;
    value: string;
}

export function QueryBuilder({
    query,
    onSearch,
    fields,
    connectionName,
    dbName,
    collectionName,
}: QueryBuilderProps) {
    const [mode, setMode] = useState<"text" | "builder">("text");
    const [textQuery, setTextQuery] = useState(query);
    const [rules, setRules] = useState<FilterRule[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [queryHistory, setQueryHistory] = useState<string[]>([]);

    // Sync internal state with props
    useEffect(() => {
        setTextQuery(query);
    }, [query]);

    // Load history
    useEffect(() => {
        const key = `nosql_query_history_${connectionName}_${dbName}_${collectionName}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                setQueryHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse query history", e);
            }
        }
    }, [connectionName, dbName, collectionName]);

    const saveQueryToHistory = (q: string) => {
        if (!q || q === "{}") return;
        const key = `nosql_query_history_${connectionName}_${dbName}_${collectionName}`;
        const newHistory = [q, ...queryHistory.filter(h => h !== q)].slice(0, 10);
        setQueryHistory(newHistory);
        localStorage.setItem(key, JSON.stringify(newHistory));
    };

    const deleteFromHistory = (e: React.MouseEvent, q: string) => {
        e.stopPropagation();
        const key = `nosql_query_history_${connectionName}_${dbName}_${collectionName}`;
        const newHistory = queryHistory.filter(h => h !== q);
        setQueryHistory(newHistory);
        localStorage.setItem(key, JSON.stringify(newHistory));
    };

    const handleTextSearch = () => {
        try {
            JSON.parse(textQuery); // Validate JSON
            saveQueryToHistory(textQuery);
            onSearch(textQuery);
            setIsExpanded(false);
        } catch (e) {
            toast.error("Invalid JSON query");
        }
    };

    const handleBuilderSearch = () => {
        const builtQuery: any = {};
        rules.forEach(rule => {
            if (!rule.field) return;

            let value: any = rule.value;
            // Try to parse number or boolean
            if (!isNaN(Number(value)) && value.trim() !== "") {
                value = Number(value);
            } else if (value === "true") {
                value = true;
            } else if (value === "false") {
                value = false;
            }

            if (rule.operator === "$eq") {
                builtQuery[rule.field] = value;
            } else if (rule.operator === "$regex") {
                builtQuery[rule.field] = { $regex: rule.value, $options: "i" };
            } else {
                builtQuery[rule.field] = { [rule.operator]: value };
            }
        });

        const jsonQuery = JSON.stringify(builtQuery, null, 2);
        setTextQuery(jsonQuery); // Sync text mode
        saveQueryToHistory(jsonQuery);
        onSearch(jsonQuery);
        setIsExpanded(false);
    };

    const addRule = () => {
        setRules([...rules, { id: Math.random().toString(36).substr(2, 9), field: "", operator: "$eq", value: "" }]);
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const updateRule = (id: string, updates: Partial<FilterRule>) => {
        setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    // Attempt to parse text query into builder rules when switching to builder mode
    const switchToBuilder = () => {
        try {
            const parsed = JSON.parse(textQuery);
            const newRules: FilterRule[] = [];

            Object.entries(parsed).forEach(([key, value]: [string, any]) => {
                if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    // Handle operators like {$gt: 10}
                    Object.entries(value).forEach(([op, val]: [string, any]) => {
                        if (["$gt", "$lt", "$gte", "$lte", "$ne", "$in", "$regex"].includes(op)) {
                            newRules.push({
                                id: Math.random().toString(36).substr(2, 9),
                                field: key,
                                operator: op as FilterOperator,
                                value: String(val)
                            });
                        }
                    });
                } else {
                    // Simple equality
                    newRules.push({
                        id: Math.random().toString(36).substr(2, 9),
                        field: key,
                        operator: "$eq",
                        value: String(value)
                    });
                }
            });

            if (newRules.length > 0) {
                setRules(newRules);
            } else if (rules.length === 0) {
                addRule();
            }
            setMode("builder");
        } catch (e) {
            toast.error("Cannot parse current query into builder rules. Resetting builder.");
            setRules([]);
            addRule();
            setMode("builder");
        }
    };

    return (
        <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 flex items-center gap-2">
                {mode === "text" ? (
                    <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                            <IconCode className="h-4 w-4" />
                        </div>
                        <Input
                            value={textQuery}
                            onChange={(e) => setTextQuery(e.target.value)}
                            placeholder='{ "field": "value" }'
                            className="pl-9 font-mono text-xs"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleTextSearch();
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex-1 border rounded-md px-3 py-1.5 text-sm text-muted-foreground bg-background flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setIsExpanded(true)}>
                        <span>{rules.length} active filter{rules.length !== 1 ? 's' : ''}</span>
                        <IconAdjustments className="h-4 w-4" />
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(true)}
                    title="Expand Query Editor"
                >
                    <IconMaximize className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => mode === "text" ? switchToBuilder() : setMode("text")}
                    title={mode === "text" ? "Switch to Builder" : "Switch to Text"}
                >
                    {mode === "text" ? <IconAdjustments className="h-4 w-4" /> : <IconCode className="h-4 w-4" />}
                </Button>
            </div>

            <Button onClick={mode === "text" ? handleTextSearch : handleBuilderSearch} size="sm">
                <IconSearch className="h-4 w-4 mr-2" />
                Filter
            </Button>

            <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9" title="Query History">
                        <IconHistory className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[400px] p-0">
                    <div className="p-2 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                        Query History
                    </div>
                    <ScrollArea className="h-[300px]">
                        {queryHistory.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                                No saved queries yet
                            </div>
                        ) : (
                            <div className="p-1">
                                {queryHistory.map((q, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-2 hover:bg-muted rounded-sm cursor-pointer group text-xs font-mono"
                                        onClick={() => {
                                            setTextQuery(q);
                                            setMode("text");
                                            setHistoryOpen(false);
                                            onSearch(q);
                                        }}
                                    >
                                        <div className="truncate flex-1 mr-2" title={q}>
                                            {q}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                            onClick={(e) => deleteFromHistory(e, q)}
                                        >
                                            <IconX className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Advanced Query Builder
                            <div className="flex items-center border rounded-md ml-4">
                                <Button
                                    variant={mode === "text" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setMode("text")}
                                >
                                    JSON
                                </Button>
                                <Button
                                    variant={mode === "builder" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={switchToBuilder}
                                >
                                    Builder
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden p-1">
                        {mode === "text" ? (
                            <CodeEditor
                                value={textQuery}
                                language="json"
                                onChange={(val) => setTextQuery(val || "")}
                                minimap={false}
                            />
                        ) : (
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-4 p-1">
                                    {rules.map((rule, index) => (
                                        <div key={rule.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card shadow-sm">
                                            <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-full text-xs font-medium text-muted-foreground">
                                                {index === 0 ? "IF" : "AND"}
                                            </div>

                                            <div className="flex-1 grid grid-cols-12 gap-2">
                                                <div className="col-span-4">
                                                    <Select value={rule.field} onValueChange={(val) => updateRule(rule.id, { field: val })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select field" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fields.map(f => (
                                                                <SelectItem key={f} value={f}>{f}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="col-span-3">
                                                    <Select value={rule.operator} onValueChange={(val) => updateRule(rule.id, { operator: val as FilterOperator })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Operator" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="$eq">Equals (=)</SelectItem>
                                                            <SelectItem value="$ne">Not Equals (!=)</SelectItem>
                                                            <SelectItem value="$gt">Greater Than (&gt;)</SelectItem>
                                                            <SelectItem value="$gte">Greater/Equal (&gt;=)</SelectItem>
                                                            <SelectItem value="$lt">Less Than (&lt;)</SelectItem>
                                                            <SelectItem value="$lte">Less/Equal (&lt;=)</SelectItem>
                                                            <SelectItem value="$regex">Contains (Regex)</SelectItem>
                                                            <SelectItem value="$in">In List</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="col-span-5">
                                                    <Input
                                                        value={rule.value}
                                                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                                        placeholder="Value"
                                                    />
                                                </div>
                                            </div>

                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeRule(rule.id)}>
                                                <IconTrash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button variant="outline" className="w-full border-dashed" onClick={addRule}>
                                        <IconPlus className="h-4 w-4 mr-2" />
                                        Add Filter Rule
                                    </Button>
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExpanded(false)}>Cancel</Button>
                        <Button onClick={mode === "text" ? handleTextSearch : handleBuilderSearch}>
                            <IconCheck className="h-4 w-4 mr-2" />
                            Apply Filter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
