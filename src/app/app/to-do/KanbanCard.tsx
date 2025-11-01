"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, CheckCircle2, TrendingUp, GripVertical } from "lucide-react";
import DeleteButton from "@/components/ui/DeleteButton";
import { Task } from "@/app/app/to-do/types/Task";

interface KanbanCardProps {
  task: Task;
  onDeleteTask: (id: string) => void;
}

export default function KanbanCard({ task, onDeleteTask }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get status configuration
  const getStatusConfig = (status: Task["status"]) => {
    switch (status) {
      case "not-started":
        return {
          icon: Clock,
          color: "blue",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          textColor: "text-blue-700 dark:text-blue-300",
        };
      case "ongoing":
        return {
          icon: TrendingUp,
          color: "orange",
          bgColor: "bg-orange-50 dark:bg-orange-950",
          textColor: "text-orange-700 dark:text-orange-300",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          color: "green",
          bgColor: "bg-green-50 dark:bg-green-950",
          textColor: "text-green-700 dark:text-green-300",
        };
      default:
        return {
          icon: Clock,
          color: "gray",
          bgColor: "bg-gray-50 dark:bg-gray-950",
          textColor: "text-gray-700 dark:text-gray-300",
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative p-3 rounded-lg border transition-all duration-200 hover:shadow-lg bg-card cursor-grab active:cursor-grabbing border-border ${
        isDragging ? "shadow-xl scale-105 z-50" : ""
      }`}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted pointer-events-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Status Icon and Task Text - Single Line */}
      <div className="flex items-center gap-2 mb-2 pr-6">
        <div
          className={`flex items-center justify-center p-1.5 rounded ${statusConfig.bgColor} flex-shrink-0`}
        >
          <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.textColor}`} />
        </div>
        <p
          className={`text-sm font-medium truncate flex-1 ${
            task.status === "completed"
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
          title={task.text}
        >
          {task.text}
        </p>
      </div>

      {/* Created Date */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1 truncate min-w-0">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{task.createdAt}</span>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
          <DeleteButton onDelete={() => onDeleteTask(task.id)} />
        </div>
      </div>
    </div>
  );
}
