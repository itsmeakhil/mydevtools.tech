// components/TaskList.js
"use client";

import TaskItem from "./TaskItem";
import { FadeIn } from "@/components/ui/fade-in";
import { Inbox, Loader2 } from "lucide-react";

interface Task {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onUpdateStatus: (id: string, status: "not-started" | "ongoing" | "completed") => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({ tasks, isLoading, onUpdateStatus, onDeleteTask }: TaskListProps) {
  return (
    <ul>
      <FadeIn show={isLoading}>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading your tasks...</p>
            </div>
          </div>
        )}
      </FadeIn>
      
      <FadeIn show={!isLoading}>
        {!isLoading && tasks.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4 max-w-md">
              <div className="mx-auto p-4 bg-muted rounded-full w-fit">
                <Inbox className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-sm text-muted-foreground">
                  Get started by adding your first task above!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && tasks.length > 0 && tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdateStatus={onUpdateStatus}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </FadeIn>
    </ul>
  );
}