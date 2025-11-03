"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TaskForm from "@/app/app/to-do/TaskForm";
import TaskList from "@/app/app/to-do/TaskList";
import KanbanBoard from "@/app/app/to-do/KanbanBoard";
import PaginationDemo from "@/app/app/to-do/PaginationS";
import { useTaskContext } from "@/app/app/to-do/context/TaskContext";
import { ListTodo, CheckCircle2, Circle, Clock, TrendingUp, LayoutGrid, List, Search, X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import KeyboardShortcutsDialog from "./KeyboardShortcutsDialog";
import ExportImportDialog from "./ExportImportDialog";
import { Download } from "lucide-react";

export const TaskContainer = () => {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showExportImportDialog, setShowExportImportDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const taskFormInputRef = useRef<HTMLInputElement>(null);
  const {
    tasks,
    isLoading,
    currentPage,
    totalPages,
    filterStatus,
    setFilterStatus,
    allTaskStats,
    fetchNextPage,
    fetchPreviousPage,
    handlePageChange,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    importTasks,
  } = useTaskContext();

  // Filter tasks based on search query
  const searchFilteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    
    const query = searchQuery.toLowerCase();
    return tasks.filter(task => {
      // Search in task text
      if (task.text.toLowerCase().includes(query)) return true;
      
      // Search in description
      if (task.description?.toLowerCase().includes(query)) return true;
      
      // Search in tags
      if (task.tags?.some(tag => tag.name.toLowerCase().includes(query))) return true;
      
      // Search in subtasks
      if (task.subTasks?.some(st => st.text.toLowerCase().includes(query))) return true;
      
      return false;
    });
  }, [tasks, searchQuery]);

  // Filter tasks based on filterStatus for list view
  // For kanban view, always show all tasks (filtering is handled by columns)
  const filteredTasks = viewMode === "kanban" || filterStatus === "all"
    ? searchFilteredTasks
    : searchFilteredTasks.filter(task => task.status === filterStatus);

  const sortedTasks = [...filteredTasks].sort(
    (a: { status: "ongoing" | "not-started" | "completed" }, 
     b: { status: "ongoing" | "not-started" | "completed" }) => {
      const statusOrder: { [key in "ongoing" | "not-started" | "completed"]: number } = {
        ongoing: 1,
        "not-started": 2,
        completed: 3,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    }
  );

  // Calculate statistics using all tasks stats
  const completionRate = allTaskStats.total > 0 ? Math.round((allTaskStats.completed / allTaskStats.total) * 100) : 0;

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      description: "Create new task",
      callback: () => {
        taskFormInputRef.current?.focus();
      },
    },
    {
      key: "/",
      description: "Focus search",
      callback: () => {
        searchInputRef.current?.focus();
      },
    },
    {
      key: "Escape",
      description: "Clear search",
      callback: () => {
        setSearchQuery("");
        searchInputRef.current?.blur();
      },
    },
    {
      key: "k",
      description: "Toggle view",
      callback: () => {
        setViewMode(prev => prev === "kanban" ? "list" : "kanban");
      },
    },
    {
      key: "?",
      shiftKey: true,
      description: "Show shortcuts",
      callback: () => {
        setShowShortcutsDialog(true);
      },
    },
    {
      key: "a",
      description: "Show all tasks",
      callback: () => {
        setFilterStatus("all");
      },
    },
    {
      key: "1",
      description: "Filter: Not Started",
      callback: () => {
        setFilterStatus("not-started");
      },
    },
    {
      key: "2",
      description: "Filter: Ongoing",
      callback: () => {
        setFilterStatus("ongoing");
      },
    },
    {
      key: "3",
      description: "Filter: Completed",
      callback: () => {
        setFilterStatus("completed");
      },
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ml-0 mr-0 px-0 w-full">
      <div className="space-y-6 px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Header Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <ListTodo className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-primary">
                  My Tasks
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Stay organized and productive
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-3 rounded-lg bg-muted/50 border transition-all hover:shadow-md text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <p className="text-2xl font-bold">{allTaskStats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-all hover:shadow-md text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-blue-700 dark:text-blue-400">Not Started</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{allTaskStats.notStarted}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 transition-all hover:shadow-md text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs text-orange-700 dark:text-orange-400">Ongoing</span>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{allTaskStats.ongoing}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 transition-all hover:shadow-md text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-green-700 dark:text-green-400">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{allTaskStats.completed}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Task Form */}
        <TaskForm onAddTask={addTask} inputRef={taskFormInputRef} />

        {/* Search Bar */}
        <Card className="border-2 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search tasks, tags, descriptions... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                Found {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* View Mode Toggle and Filter Buttons */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcutsDialog(true)}
              className="gap-2"
            >
              <Keyboard className="h-4 w-4" />
              <span className="hidden sm:inline">Shortcuts</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportImportDialog(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export/Import</span>
            </Button>
            {[
              { value: "all" as const, label: "All", icon: ListTodo },
              { value: "not-started" as const, label: "Not Started", icon: Circle },
              { value: "ongoing" as const, label: "Ongoing", icon: TrendingUp },
              { value: "completed" as const, label: "Completed", icon: CheckCircle2 },
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={filterStatus === value ? "default" : "outline"}
                onClick={() => setFilterStatus(value)}
                className="gap-2 transition-all"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
          
          {/* View Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => {
              if (value) setViewMode(value as "list" | "kanban");
            }}
            className="border rounded-md"
          >
            <ToggleGroupItem value="kanban" aria-label="Kanban view" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Task View */}
        {viewMode === "kanban" ? (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="min-h-[600px]">
                <KanbanBoard
                  tasks={sortedTasks}
                  isLoading={isLoading}
                  onUpdateStatus={updateTaskStatus}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="min-h-[400px]">
                  <TaskList
                    tasks={sortedTasks}
                    isLoading={isLoading}
                    onUpdateStatus={updateTaskStatus}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <PaginationDemo
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onNextPage={fetchNextPage}
                    onPreviousPage={fetchPreviousPage}
                    onPageChange={handlePageChange}
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          open={showShortcutsDialog}
          onOpenChange={setShowShortcutsDialog}
        />

        {/* Export/Import Dialog */}
        <ExportImportDialog
          open={showExportImportDialog}
          onOpenChange={setShowExportImportDialog}
          tasks={tasks}
          onImport={importTasks}
        />
      </div>
    </div>
  );
};
