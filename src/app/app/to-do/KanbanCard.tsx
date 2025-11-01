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
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-700 dark:text-blue-300",
        };
      case "ongoing":
        return {
          icon: TrendingUp,
          color: "orange",
          bgColor: "bg-orange-50 dark:bg-orange-950",
          borderColor: "border-orange-200 dark:border-orange-800",
          textColor: "text-orange-700 dark:text-orange-300",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          color: "green",
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-700 dark:text-green-300",
        };
      default:
        return {
          icon: Clock,
          color: "gray",
          bgColor: "bg-gray-50 dark:bg-gray-950",
          borderColor: "border-gray-200 dark:border-gray-800",
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
      className={`group relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg bg-card cursor-grab active:cursor-grabbing ${
        statusConfig.borderColor
      } ${isDragging ? "shadow-xl scale-105 z-50" : ""}`}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted pointer-events-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Status Icon */}
      <div
        className={`flex items-center justify-center p-2 rounded-lg mb-3 ${statusConfig.bgColor} w-fit`}
      >
        <StatusIcon className={`h-4 w-4 ${statusConfig.textColor}`} />
      </div>

      {/* Task Text */}
      <p
        className={`text-sm font-medium mb-2 pr-6 ${
          task.status === "completed"
            ? "text-muted-foreground line-through"
            : "text-foreground"
        }`}
      >
        {task.text}
      </p>

      {/* Created Date */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{task.createdAt}</span>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteButton onDelete={() => onDeleteTask(task.id)} />
        </div>
      </div>
    </div>
  );
}
