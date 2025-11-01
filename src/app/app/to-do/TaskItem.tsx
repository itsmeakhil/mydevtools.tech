"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DeleteButton from "../../../components/ui/DeleteButton";
import { Circle, Clock, TrendingUp, CheckCircle2 } from "lucide-react";

interface Task {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
  createdAt: string;
}

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string, newStatus: Task["status"]) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskItem({
  task,
  onUpdateStatus,
  onDeleteTask,
}: TaskItemProps) {
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

  return (
    <li className="group relative mb-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.01] bg-card hover:border-primary/20">
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className={`flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-background to-muted transition-transform group-hover:scale-110 ${statusConfig.className} min-w-[40px] h-[40px]`}>
          <StatusIcon className="h-5 w-5" />
        </div>

        {/* Task Text */}
        <div className="flex-1 min-w-0">
          <span
            className={`block text-base font-medium transition-all ${
              task.status === "completed"
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {task.text}
          </span>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.createdAt}
          </p>
        </div>

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

        {/* Delete Button */}
        <div className="transition-opacity group-hover:opacity-100 opacity-70 flex items-center justify-center min-w-[24px]">
          <DeleteButton onDelete={() => onDeleteTask(task.id)} />
        </div>
      </div>
    </li>
  );
}