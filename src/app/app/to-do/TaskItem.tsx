"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DeleteButton from "../../../components/ui/DeleteButton";

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
  return (
    <li
      className={`flex items-center gap-4 mb-4 p-2 border rounded transition-colors 
        dark:bg-black dark:border-white dark:text-white 
        ${
          task.status === "ongoing"
            ? "bg-orange-200 dark:bg-transparent"
            : task.status === "not-started"
            ? "bg-gray-200 dark:bg-transparent"
            : task.status === "completed"
            ? "bg-green-200 dark:bg-transparent"
            : ""
        }`}
    >
      <span
        className={`flex-1 transition-colors 
          ${task.status === "completed" ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
      >
        {task.text}
      </span>
      <p className="text-xs text-gray-500 dark:text-gray-400">{task.createdAt}</p>

      <Select
        value={task.status}
        onValueChange={(newStatus) =>
          onUpdateStatus(task.id, newStatus as Task["status"])
        }
      >
        <SelectTrigger className="w-[150px] dark:border-white dark:text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="dark:bg-black dark:border-white">
          <SelectItem value="not-started">Not Started</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <div className="pr-2">
        <DeleteButton onDelete={() => onDeleteTask(task.id)} />
      </div>
    </li>
  );
}
