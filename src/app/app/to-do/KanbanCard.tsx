"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, CheckCircle2, TrendingUp, GripVertical, Edit, Calendar, Flame, AlertCircle, Zap, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteButton from "@/components/ui/DeleteButton";
import { Task } from "@/app/app/to-do/types/Task";
import TaskEditDialog from "./TaskEditDialog";
import { differenceInDays, isPast, parseISO } from "date-fns";

interface KanbanCardProps {
  task: Task;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => void;
}

export default function KanbanCard({ task, onUpdateTask, onDeleteTask }: KanbanCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  // Priority config
  const priorityConfig = {
    high: { label: "High", icon: Flame, color: "text-red-500" },
    medium: { label: "Medium", icon: AlertCircle, color: "text-orange-500" },
    low: { label: "Low", icon: Zap, color: "text-blue-500" },
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== "completed";
  const dueInDays = task.dueDate ? differenceInDays(parseISO(task.dueDate), new Date()) : null;

  const handleSaveEdit = async (updates: Partial<Task>) => {
    await onUpdateTask(task.id, updates);
  };

  return (
    <>
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

        {/* Status Icon and Task Text */}
        <div className="flex items-start gap-2 mb-2 pr-6">
          <div
            className={`flex items-center justify-center p-1.5 rounded ${statusConfig.bgColor} flex-shrink-0`}
          >
            <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.textColor}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start gap-1">
              <p
                className={`text-sm font-medium flex-1 ${
                  task.status === "completed"
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
                title={task.text}
              >
                {task.text}
              </p>
              {task.priority && task.priority !== "medium" && (
                <span className={priorityConfig[task.priority].color}>
                  {React.createElement(priorityConfig[task.priority].icon, { className: "h-3 w-3 flex-shrink-0" })}
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{ borderColor: tag.color, color: tag.color }}
                    className="text-[10px] px-1 py-0 h-4 gap-0.5"
                  >
                    <Tag className="h-2 w-2" />
                    {tag.name}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{task.tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Subtasks Progress */}
            {task.subTasks && task.subTasks.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Date and Actions */}
        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex flex-col gap-1 truncate min-w-0 flex-1">
            <div className="flex items-center gap-1 truncate">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate text-[10px]">{task.createdAt}</span>
            </div>
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                <Calendar className="h-3 w-3 flex-shrink-0" />
                {isOverdue ? "Overdue" : dueInDays === 0 ? "Today" : dueInDays === 1 ? "Tomorrow" : `${dueInDays}d`}
              </div>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <DeleteButton onDelete={() => onDeleteTask(task.id)} />
          </div>
        </div>
      </div>

      <TaskEditDialog
        task={task}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdit}
      />
    </>
  );
}
