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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ml-0 mr-0 px-0 w-full">
      <div className="space-y-4 px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Compact Header */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ListTodo className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-primary">
                    My Tasks
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {allTaskStats.total} total • {completionRate}% complete
                  </p>
                </div>
              </div>
              
              {/* Compact Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{allTaskStats.total}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400">{allTaskStats.notStarted}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">{allTaskStats.ongoing}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">{allTaskStats.completed}</span>
                </div>
              </div>
            </div>

            {/* Compact Toolbar */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search - Inline */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 h-9 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* View Toggle - Compact */}
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as "list" | "kanban");
                }}
                className="border rounded-md"
              >
                <ToggleGroupItem value="kanban" aria-label="Kanban view" size="sm" className="h-9 px-3">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1.5">Kanban</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" size="sm" className="h-9 px-3">
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1.5">List</span>
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Filter Buttons - Compact */}
              <div className="hidden lg:flex items-center gap-1 border rounded-md p-0.5">
                {[
                  { value: "all" as const, label: "All", icon: ListTodo },
                  { value: "not-started" as const, label: "Not Started", icon: Circle },
                  { value: "ongoing" as const, label: "Ongoing", icon: TrendingUp },
                  { value: "completed" as const, label: "Completed", icon: CheckCircle2 },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={filterStatus === value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterStatus(value)}
                    className="h-8 px-2.5 text-xs"
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {label}
                  </Button>
                ))}
              </div>

            </div>

            {/* Mobile Filter - Dropdown style */}
            {viewMode === "list" && (
              <div className="lg:hidden flex items-center gap-2 mt-2">
                {[
                  { value: "all" as const, label: "All", icon: ListTodo },
                  { value: "not-started" as const, label: "Not Started", icon: Circle },
                  { value: "ongoing" as const, label: "Ongoing", icon: TrendingUp },
                  { value: "completed" as const, label: "Completed", icon: CheckCircle2 },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={filterStatus === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(value)}
                    className="h-8 px-3 text-xs"
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {label}
                  </Button>
                ))}
              </div>
            )}

            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                Found {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Task Form */}
        <TaskForm onAddTask={addTask} inputRef={taskFormInputRef} />

        {/* Task View */}
        {viewMode === "kanban" ? (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-4 md:p-6">
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
            <Card className="border-2 shadow-lg">
              <CardContent className="p-4 md:p-6">
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
              <div className="flex justify-center">
                <Card className="border">
                  <CardContent className="p-3">
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
  );
};
