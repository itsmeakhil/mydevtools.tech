// components/TaskList.js
"use client";

import TaskItem from "./TaskItem";

interface Task {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[];
  onUpdateStatus: (id: string, status: "not-started" | "ongoing" | "completed") => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({ tasks, onUpdateStatus, onDeleteTask }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdateStatus={onUpdateStatus}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ul>
  );
}