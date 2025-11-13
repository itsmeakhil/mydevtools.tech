// components/TaskList.js
"use client";

import TaskItem from "./TaskItem";
import { FadeIn } from "@/components/ui/fade-in";
import { Inbox, Loader2, CheckCircle2 } from "lucide-react";
import { Task } from "@/app/app/to-do/types/Task";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onUpdateStatus: (id: string, status: "not-started" | "ongoing" | "completed") => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({ tasks, isLoading, onUpdateStatus, onUpdateTask, onDeleteTask }: TaskListProps) {
  return (
    <ul className="space-y-3" role="list" aria-label="Task list">
      <FadeIn show={isLoading}>
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">Loading your tasks...</p>
            </div>
          </div>
        )}
      </FadeIn>
      
      <FadeIn show={!isLoading}>
        {!isLoading && tasks.length === 0 && (
          <div className="flex items-center justify-center py-16 animate-in fade-in">
            <div className="text-center space-y-4 max-w-md px-4">
              <div className="mx-auto p-6 bg-gradient-to-br from-muted/50 to-muted rounded-2xl w-fit shadow-sm">
                <Inbox className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">No tasks found</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tasks.length === 0 
                    ? "Get started by adding your first task above! Press Enter to quickly add tasks."
                    : "Try adjusting your filters or search query."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && tasks.length > 0 && (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  "animate-in fade-in slide-in-from-top-2",
                  "transition-all duration-300"
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <TaskItem
                  task={task}
                  onUpdateStatus={onUpdateStatus}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                />
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </ul>
  );
}