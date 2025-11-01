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
  onDeleteTask: (id: string) => void;
}

const columnConfig = {
  "not-started": {
    bgColor: "bg-background",
    borderColor: "border-border",
    headerColor: "text-foreground",
  },
  ongoing: {
    bgColor: "bg-background",
    borderColor: "border-border",
    headerColor: "text-foreground",
  },
  completed: {
    bgColor: "bg-background",
    borderColor: "border-border",
    headerColor: "text-foreground",
  },
};

export default function KanbanColumn({
  id,
  title,
  icon: Icon,
  tasks,
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
      className={`flex flex-col h-full rounded-lg border-2 p-4 transition-all ${
        config.borderColor
      } ${config.bgColor} ${isOver ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <Icon className={`h-5 w-5 ${config.headerColor}`} />
        <h3 className={`font-semibold text-lg ${config.headerColor}`}>
          {title}
        </h3>
        <span
          className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${config.headerColor} bg-background/50`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
          {tasks.length === 0 ? (
            <div 
              className={`flex items-center justify-center h-32 text-muted-foreground text-sm rounded-lg border-2 border-dashed transition-all ${
                isOver ? "border-primary bg-primary/10" : "border-transparent"
              }`}
            >
              {isOver ? "Drop task here" : "No tasks"}
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
