// components/TaskList.js
"use client";

import TaskItem from "./TaskItem";
import TaskSkeleton from "./components/TaskSkeleton";
import { FadeIn } from "@/components/ui/fade-in";

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
          <div>
            {[...Array(5)].map((_, index) => (
              <TaskSkeleton key={index} />
            ))}
          </div>
        )}
      </FadeIn>
      
      <FadeIn show={!isLoading}>
        {!isLoading && tasks.map((task) => (
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