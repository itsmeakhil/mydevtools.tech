"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { 
  Circle, Clock, TrendingUp, CheckCircle2, Edit, Calendar, 
  Flame, AlertCircle, Zap, Tag, MoreVertical, Copy, Check, Trash2
} from "lucide-react";
import TaskEditDialog from "./TaskEditDialog";
import { differenceInDays, isPast, parseISO, format, isValid, parse } from "date-fns";
import { Task } from "@/app/app/to-do/types/Task";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Helper to safely parse and format dates
const safeFormatDate = (dateString: string | undefined, formatStr: string): string => {
  if (!dateString || dateString === "Unknown") return dateString || "Unknown";
  
  // Try parsing as ISO first (for new data)
  try {
    const isoDate = parseISO(dateString);
    if (isValid(isoDate)) {
      return format(isoDate, formatStr);
    }
  } catch {
    // Not an ISO string, continue
  }
  
  // Try parsing the formatted date string from TaskContext: "dd MMM yyyy, hh:mm a"
  try {
    const parsedDate = parse(dateString, "dd MMM yyyy, hh:mm a", new Date());
    if (isValid(parsedDate)) {
      return format(parsedDate, formatStr);
    }
  } catch {
    // Not in that format, continue
  }
  
  // Try parsing just the date part "dd MMM yyyy"
  try {
    const parts = dateString.split(',');
    if (parts.length > 0) {
      const datePart = parts[0].trim(); // "dd MMM yyyy"
      const parsedDate = parse(datePart, "dd MMM yyyy", new Date());
      if (isValid(parsedDate)) {
        return format(parsedDate, formatStr);
      }
    }
  } catch {
    // Fall through
  }
  
  // Try parsing as Date object (fallback)
  try {
    const date = new Date(dateString);
    if (isValid(date)) {
      return format(date, formatStr);
    }
  } catch {
    // Not a valid date string
  }
  
  // If all parsing fails, return a shortened version of the string
  return dateString.length > 15 ? dateString.substring(0, 15) + "..." : dateString;
};

// Helper to safely parse date for calculations
const safeParseDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  
  // Try parsing as ISO first
  try {
    const isoDate = parseISO(dateString);
    if (isValid(isoDate)) {
      return isoDate;
    }
  } catch {
    // Not an ISO string
  }
  
  // Try parsing the formatted date string from TaskContext: "dd MMM yyyy, hh:mm a"
  try {
    const parsedDate = parse(dateString, "dd MMM yyyy, hh:mm a", new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  } catch {
    // Not in that format
  }
  
  // Try parsing just the date part "dd MMM yyyy"
  try {
    const parts = dateString.split(',');
    if (parts.length > 0) {
      const datePart = parts[0].trim();
      const parsedDate = parse(datePart, "dd MMM yyyy", new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
  } catch {
    // Fall through
  }
  
  // Try parsing as Date object (fallback)
  try {
    const date = new Date(dateString);
    if (isValid(date)) {
      return date;
    }
  } catch {
    // Not a valid date
  }
  
  return null;
};

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
  const [isHovered, setIsHovered] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Get status badge configuration
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "not-started":
        return {
          variant: "outline" as const,
          className: "border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/50",
          icon: Clock,
          label: "Not Started",
          color: "blue",
        };
      case "ongoing":
        return {
          variant: "outline" as const,
          className: "border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/50",
          icon: TrendingUp,
          label: "Ongoing",
          color: "orange",
        };
      case "completed":
        return {
          variant: "outline" as const,
          className: "border-green-500/50 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/50",
          icon: CheckCircle2,
          label: "Completed",
          color: "green",
        };
      default:
        return {
          variant: "outline" as const,
          className: "",
          icon: Circle,
          label: "Unknown",
          color: "gray",
        };
    }
  };

  const statusConfig = getStatusBadge(task.status);
  const StatusIcon = statusConfig.icon;

  // Priority config
  const priorityConfig = {
    high: { label: "High", icon: Flame, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/30" },
    medium: { label: "Medium", icon: AlertCircle, color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
    low: { label: "Low", icon: Zap, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  };

  // Check if task is overdue
  const dueDateObj = task.dueDate ? safeParseDate(task.dueDate) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && task.status !== "completed";
  const dueInDays = dueDateObj ? differenceInDays(dueDateObj, new Date()) : null;

  const handleSaveEdit = async (updates: Partial<Task>) => {
    await onUpdateTask(task.id, updates);
  };

  const handleStatusChange = (newStatus: Task["status"]) => {
    const wasCompleted = task.status === "completed";
    const willComplete = newStatus === "completed";
    
    onUpdateStatus(task.id, newStatus);
    
    // Show completion animation
    if (!wasCompleted && willComplete) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2000);
    }
  };

  const handleCopy = async () => {
    const taskText = `${task.text}${task.description ? `\n${task.description}` : ''}`;
    await navigator.clipboard.writeText(taskText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickComplete = () => {
    if (task.status !== "completed") {
      handleStatusChange("completed");
    } else {
      handleStatusChange("not-started");
    }
  };

  return (
    <>
      <li 
        className={cn(
          "group relative mb-3 p-4 rounded-xl border-2 transition-all duration-300",
          "hover:shadow-lg hover:scale-[1.01] bg-card",
          "hover:border-primary/30 focus-within:border-primary/50",
          task.status === "completed" && "opacity-75",
          justCompleted && "animate-pulse ring-2 ring-green-500/50"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="listitem"
        aria-label={`Task: ${task.text}`}
      >
        <div className="flex items-start gap-4">
          {/* Status Icon - Clickable for quick toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleQuickComplete}
                  className={cn(
                    "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                    "hover:scale-110 active:scale-95 cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    statusConfig.className,
                    "min-w-[44px] h-[44px]"
                  )}
                  aria-label={`Mark as ${task.status === "completed" ? "not completed" : "completed"}`}
                >
                  <StatusIcon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to toggle completion</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Task Content */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-start gap-2">
              <h3
                className={cn(
                  "block text-base font-semibold transition-all flex-1",
                  task.status === "completed"
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {task.text}
              </h3>
              {task.priority && task.priority !== "medium" && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    priorityConfig[task.priority].color,
                    priorityConfig[task.priority].bgColor,
                    "gap-1.5 px-2 py-0.5 border"
                  )}
                >
                  {React.createElement(priorityConfig[task.priority].icon, { className: "h-3.5 w-3.5" })}
                  <span className="text-xs font-medium">{priorityConfig[task.priority].label}</span>
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{ borderColor: tag.color, color: tag.color }}
                    className="text-xs gap-1 px-2 py-0.5 hover:bg-muted/50 transition-colors"
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
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {task.subTasks.filter(st => st.completed).length} / {task.subTasks.length} subtasks
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ 
                      width: `${(task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{safeFormatDate(task.createdAt, "MMM d, yyyy")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created: {task.createdAt}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {task.dueDate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-1.5",
                        isOverdue && "text-red-500 font-semibold"
                      )}>
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {isOverdue 
                            ? "Overdue" 
                            : dueInDays === 0 
                              ? "Due today" 
                              : dueInDays === 1 
                                ? "Due tomorrow" 
                                : dueInDays !== null && dueInDays > 0
                                  ? `Due in ${dueInDays} days`
                                  : `Due ${Math.abs(dueInDays!)} days ago`
                          }
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Due: {task.dueDate}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {task.timeEstimate && (
                <div className="flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>{task.timeEstimate}m</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status Dropdown */}
            <Select
              value={task.status}
              onValueChange={(newStatus) => handleStatusChange(newStatus as Task["status"])}
            >
              <SelectTrigger 
                className="w-[140px] border-2 h-9 text-sm focus:ring-2 focus:ring-primary"
                aria-label="Change task status"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent className="border-2">
                <SelectItem value="not-started">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Not Started</span>
                  </div>
                </SelectItem>
                <SelectItem value="ongoing">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span>Ongoing</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Context Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 p-0 transition-opacity",
                    isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                  )}
                  aria-label="Task options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Task
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleQuickComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Button - Visible on hover */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className={cn(
                "h-9 w-9 p-0 transition-opacity",
                isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-70"
              )}
              aria-label="Edit task"
            >
              <Edit className="h-4 w-4" />
            </Button>

            {/* Delete Button */}
            <div className={cn(
              "transition-opacity flex items-center justify-center",
              isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-70"
            )}>
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
