"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "@/app/app/to-do/types/Task";
import KanbanCard from "./KanbanCard";
import { LucideIcon } from "lucide-react";

interface KanbanColumnProps {
  id: "not-started" | "ongoing" | "completed";
  title: string;
  icon: LucideIcon;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => void;
}

const columnConfig = {
  "not-started": {
    bgColor: "bg-blue-50/30 dark:bg-blue-950/20",
    borderColor: "border-blue-200/50 dark:border-blue-800/50",
    headerColor: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  ongoing: {
    bgColor: "bg-orange-50/30 dark:bg-orange-950/20",
    borderColor: "border-orange-200/50 dark:border-orange-800/50",
    headerColor: "text-orange-700 dark:text-orange-300",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
  },
  completed: {
    bgColor: "bg-green-50/30 dark:bg-green-950/20",
    borderColor: "border-green-200/50 dark:border-green-800/50",
    headerColor: "text-green-700 dark:text-green-300",
    iconBg: "bg-green-100 dark:bg-green-900/50",
  },
};

export default function KanbanColumn({
  id,
  title,
  icon: Icon,
  tasks,
  onUpdateTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const config = columnConfig[id];
  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full rounded-xl border-2 p-4 md:p-5 transition-all duration-300 ${
        config.borderColor
      } ${config.bgColor} ${
        isOver 
          ? "ring-4 ring-primary/50 ring-offset-2 scale-[1.02] shadow-lg" 
          : "hover:shadow-md"
      }`}
      role="region"
      aria-label={`${title} column with ${tasks.length} tasks`}
    >
      {/* Enhanced Column Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
        <div className={`flex items-center justify-center p-2 rounded-lg ${config.iconBg} transition-all`}>
          <Icon className={`h-5 w-5 ${config.headerColor}`} />
        </div>
        <h3 className={`font-bold text-lg ${config.headerColor} flex-1`}>
          {title}
        </h3>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${config.headerColor} bg-background/80 border border-border shadow-sm`}
          aria-label={`${tasks.length} tasks in ${title}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks - Enhanced */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {tasks.length === 0 ? (
            <div 
              className={`flex flex-col items-center justify-center h-32 text-muted-foreground text-sm rounded-lg border-2 border-dashed transition-all duration-300 ${
                isOver 
                  ? "border-primary bg-primary/10 scale-105" 
                  : "border-border/50 hover:border-border"
              }`}
              role="status"
              aria-label="Empty column"
            >
              <Icon className={`h-6 w-6 mb-2 ${isOver ? config.headerColor : "opacity-50"}`} />
              <span className={isOver ? "font-medium text-primary" : ""}>
                {isOver ? "Drop task here" : "No tasks"}
              </span>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-in fade-in slide-in-from-top-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <KanbanCard
                  task={task}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                />
              </div>
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
