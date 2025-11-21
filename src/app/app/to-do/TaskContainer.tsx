"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TaskForm from "@/app/app/to-do/TaskForm";
import TaskList from "@/app/app/to-do/TaskList";
import KanbanBoard from "@/app/app/to-do/KanbanBoard";
import PaginationDemo from "@/app/app/to-do/PaginationS";
import { useTaskContext } from "@/app/app/to-do/context/TaskContext";
import { ListTodo, CheckCircle2, Circle, Clock, TrendingUp, LayoutGrid, List, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const TaskContainer = () => {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
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

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 ml-0 mr-0 px-0 w-full flex flex-col overflow-hidden">
      <div className="flex flex-col gap-3 px-3 md:px-4 lg:px-6 py-3 md:py-4 flex-1 overflow-hidden">
        {/* Enhanced Header */}
        <Card className="border shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl shadow-sm transition-all hover:bg-primary/20 hover:scale-105">
                  <ListTodo className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    My Tasks
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {allTaskStats.total} total • {completionRate}% complete
                  </p>
                </div>
              </div>

              {/* Enhanced Stats with Progress Bars */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{allTaskStats.total}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Total</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400">{allTaskStats.notStarted}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Not Started</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400">{allTaskStats.ongoing}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Ongoing</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">{allTaskStats.completed}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Completed</span>
                </div>
              </div>
            </div>

            {/* Enhanced Toolbar */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Enhanced Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tasks, descriptions, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-9 text-sm border focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  aria-label="Search tasks"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Enhanced View Toggle */}
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as "list" | "kanban");
                }}
                className="border rounded-lg bg-muted/30 p-0.5"
              >
                <ToggleGroupItem
                  value="kanban"
                  aria-label="Kanban view"
                  size="sm"
                  className="h-8 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm transition-all"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1.5 text-xs font-medium">Kanban</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  aria-label="List view"
                  size="sm"
                  className="h-8 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm transition-all"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1.5 text-xs font-medium">List</span>
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Enhanced Filter Pills */}
              {viewMode === "list" && (
                <div className="hidden lg:flex items-center gap-1 border rounded-lg bg-muted/30 p-0.5">
                  {[
                    { value: "all" as const, label: "All", icon: ListTodo, count: allTaskStats.total },
                    { value: "not-started" as const, label: "Not Started", icon: Circle, count: allTaskStats.notStarted },
                    { value: "ongoing" as const, label: "Ongoing", icon: TrendingUp, count: allTaskStats.ongoing },
                    { value: "completed" as const, label: "Completed", icon: CheckCircle2, count: allTaskStats.completed },
                  ].map(({ value, label, icon: Icon, count }) => (
                    <Button
                      key={value}
                      variant={filterStatus === value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilterStatus(value)}
                      className={`h-7 px-2.5 text-xs font-medium transition-all ${filterStatus === value
                        ? "shadow-sm bg-background"
                        : "hover:bg-muted/50"
                        }`}
                      aria-label={`Filter by ${label}`}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {label}
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] ${filterStatus === value
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                        }`}>
                        {count}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

            </div>

            {/* Mobile Filter - Enhanced */}
            {viewMode === "list" && (
              <div className="lg:hidden flex items-center gap-2 mt-2 overflow-x-auto pb-2">
                {[
                  { value: "all" as const, label: "All", icon: ListTodo, count: allTaskStats.total },
                  { value: "not-started" as const, label: "Not Started", icon: Circle, count: allTaskStats.notStarted },
                  { value: "ongoing" as const, label: "Ongoing", icon: TrendingUp, count: allTaskStats.ongoing },
                  { value: "completed" as const, label: "Completed", icon: CheckCircle2, count: allTaskStats.completed },
                ].map(({ value, label, icon: Icon, count }) => (
                  <Button
                    key={value}
                    variant={filterStatus === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(value)}
                    className="h-8 px-2.5 text-xs whitespace-nowrap flex-shrink-0"
                    aria-label={`Filter by ${label}`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] ${filterStatus === value
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                      }`}>
                      {count}
                    </span>
                  </Button>
                ))}
              </div>
            )}

            {/* Search Results Indicator */}
            {searchQuery && (
              <div className="flex items-center gap-2 mt-2 p-1.5 rounded-lg bg-muted/50 border">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{filteredTasks.length}</span> task{filteredTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Task Form */}
        <TaskForm onAddTask={addTask} inputRef={taskFormInputRef} />

        {/* Task View */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === "kanban" ? (
            <Card className="border shadow-lg flex-1 overflow-hidden flex flex-col">
              <CardContent className="p-3 md:p-4 flex-1 overflow-y-auto">
                <KanbanBoard
                  tasks={sortedTasks}
                  isLoading={isLoading}
                  onUpdateStatus={updateTaskStatus}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border shadow-lg flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-3 md:p-4 flex-1 overflow-y-auto">
                  <TaskList
                    tasks={sortedTasks}
                    isLoading={isLoading}
                    onUpdateStatus={updateTaskStatus}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                  />
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-3">
                  <Card className="border">
                    <CardContent className="p-2">
                      <PaginationDemo
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onNextPage={fetchNextPage}
                        onPreviousPage={fetchPreviousPage}
                        onPageChange={handlePageChange}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
