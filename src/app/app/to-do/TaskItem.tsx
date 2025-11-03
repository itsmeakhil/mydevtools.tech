"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteButton from "../../../components/ui/DeleteButton";
import { Circle, Clock, TrendingUp, CheckCircle2, Edit, Calendar, Flame, AlertCircle, Zap, Tag } from "lucide-react";
import TaskEditDialog from "./TaskEditDialog";
import { differenceInDays, isPast, parseISO } from "date-fns";
import { Task } from "@/app/app/to-do/types/Task";

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string, newStatus: Task["status"]) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => void;
}

export default function TaskItem({
  task,
  onUpdateStatus,
  onUpdateTask,
  onDeleteTask,
}: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Get status badge configuration
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "not-started":
        return {
          variant: "outline" as const,
          className: "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
          icon: Clock,
          label: "Not Started",
        };
      case "ongoing":
        return {
          variant: "outline" as const,
          className: "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950",
          icon: TrendingUp,
          label: "Ongoing",
        };
      case "completed":
        return {
          variant: "outline" as const,
          className: "border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950",
          icon: CheckCircle2,
          label: "Completed",
        };
      default:
        return {
          variant: "outline" as const,
          className: "",
          icon: Circle,
          label: "Unknown",
        };
    }
  };

  const statusConfig = getStatusBadge(task.status);
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
      <li className="group relative mb-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.01] bg-card hover:border-primary/20">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className={`flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-background to-muted transition-transform group-hover:scale-110 ${statusConfig.className} min-w-[40px] h-[40px]`}>
            <StatusIcon className="h-5 w-5" />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start gap-2">
              <span
                className={`block text-base font-medium transition-all flex-1 ${
                  task.status === "completed"
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {task.text}
              </span>
              {task.priority && task.priority !== "medium" && (
                <Badge variant="outline" className={`${priorityConfig[task.priority].color} gap-1`}>
                  {React.createElement(priorityConfig[task.priority].icon, { className: "h-3 w-3" })}
                  {priorityConfig[task.priority].label}
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{ borderColor: tag.color, color: tag.color }}
                    className="text-xs gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Subtasks Progress */}
            {task.subTasks && task.subTasks.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                {task.subTasks.filter(st => st.completed).length} / {task.subTasks.length} subtasks
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.createdAt}
              </div>
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                  <Calendar className="h-3 w-3" />
                  {isOverdue ? "Overdue" : dueInDays === 0 ? "Due today" : dueInDays === 1 ? "Due tomorrow" : `Due in ${dueInDays} days`}
                </div>
              )}
              {task.timeEstimate && (
                <div className="flex items-center gap-1">
                  ⏱️ {task.timeEstimate}m
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <Select
              value={task.status}
              onValueChange={(newStatus) =>
                onUpdateStatus(task.id, newStatus as Task["status"])
              }
            >
              <SelectTrigger className="w-[140px] border-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent className="border-2">
                <SelectItem value="not-started">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Not Started
                  </div>
                </SelectItem>
                <SelectItem value="ongoing">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Ongoing
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="transition-opacity group-hover:opacity-100 opacity-70"
            >
              <Edit className="h-4 w-4" />
            </Button>

            {/* Delete Button */}
            <div className="transition-opacity group-hover:opacity-100 opacity-70 flex items-center justify-center min-w-[24px]">
              <DeleteButton onDelete={() => onDeleteTask(task.id)} />
            </div>
          </div>
        </div>
      </li>

      <TaskEditDialog
        task={task}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdit}
      />
    </>
  );
}