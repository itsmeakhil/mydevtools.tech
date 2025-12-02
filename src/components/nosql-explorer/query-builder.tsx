"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconSearch, IconHistory, IconX, IconPlus, IconTrash, IconCheck, IconFilter } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [textQuery, setTextQuery] = useState(query);
    const [rules, setRules] = useState<FilterRule[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [queryHistory, setQueryHistory] = useState<string[]>([]);
    const [builderOpen, setBuilderOpen] = useState(false);

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
        setBuilderOpen(false);
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
    const openBuilder = () => {
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
            setBuilderOpen(true);
        } catch (e) {
            // If parse fails, just open builder with existing or empty rules
            if (rules.length === 0) {
                addRule();
            }
            setBuilderOpen(true);
        }
    };

    return (
        <div className="flex items-center w-full">
            <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <IconSearch className="h-4 w-4" />
                </div>
                <Input
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    placeholder='Query (e.g. { "status": "active" })'
                    className="pl-9 pr-[120px] font-mono text-xs h-9 bg-background"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleTextSearch();
                    }}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Popover open={builderOpen} onOpenChange={setBuilderOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-7 w-7 text-muted-foreground hover:text-foreground", rules.length > 0 && "text-primary")}
                                onClick={openBuilder}
                                title="Visual Query Builder"
                            >
                                <IconFilter className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[600px] p-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h4 className="font-medium text-sm">Filter Rules</h4>
                                    <Button variant="ghost" size="sm" onClick={addRule} className="h-7 text-xs">
                                        <IconPlus className="h-3 w-3 mr-1" />
                                        Add Rule
                                    </Button>
                                </div>
                                <ScrollArea className="max-h-[300px]">
                                    <div className="space-y-2">
                                        {rules.length === 0 && (
                                            <div className="text-center text-xs text-muted-foreground py-4">
                                                No filters applied. Add a rule to filter documents.
                                            </div>
                                        )}
                                        {rules.map((rule, index) => (
                                            <div key={rule.id} className="flex items-center gap-2 p-2 border rounded-md bg-card/50">
                                                <div className="w-12 text-[10px] font-mono text-muted-foreground uppercase text-center">
                                                    {index === 0 ? "WHERE" : "AND"}
                                                </div>

                                                <Select value={rule.field} onValueChange={(val) => updateRule(rule.id, { field: val })}>
                                                    <SelectTrigger className="h-8 text-xs w-[140px]">
                                                        <SelectValue placeholder="Field" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fields.map(f => (
                                                            <SelectItem key={f} value={f}>{f}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select value={rule.operator} onValueChange={(val) => updateRule(rule.id, { operator: val as FilterOperator })}>
                                                    <SelectTrigger className="h-8 text-xs w-[110px]">
                                                        <SelectValue placeholder="Op" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="$eq">=</SelectItem>
                                                        <SelectItem value="$ne">!=</SelectItem>
                                                        <SelectItem value="$gt">&gt;</SelectItem>
                                                        <SelectItem value="$gte">&gt;=</SelectItem>
                                                        <SelectItem value="$lt">&lt;</SelectItem>
                                                        <SelectItem value="$lte">&lt;=</SelectItem>
                                                        <SelectItem value="$regex">Regex</SelectItem>
                                                        <SelectItem value="$in">In</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Input
                                                    value={rule.value}
                                                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                                    placeholder="Value"
                                                    className="h-8 text-xs flex-1"
                                                />

                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRule(rule.id)}>
                                                    <IconTrash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="flex justify-end pt-2 border-t">
                                    <Button size="sm" onClick={handleBuilderSearch}>
                                        <IconCheck className="h-3 w-3 mr-1" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Query History">
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
                </div>
            </div>
        </div>
    );
}
