// components/TaskItem.js
"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DeleteButton from "./ui/DeleteButton";

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
      className={`flex items-center gap-4 mb-4 p-2 border rounded ${
        task.status === "ongoing"
          ? "bg-orange-200"
          : task.status === "not-started"
          ? "bg-gray-200"
          : task.status === "completed"
          ? "bg-green-200"
          : ""
      }`}
    >
      <span
        className={`flex-1 ${
          task.status === "completed"
            ? "line-through text-gray-500"
            : "text-gray-900"
        }`}
      >
        {task.text}
      </span>
      <p className="text-xs text-gray-500">{task.createdAt}</p>
      {/* </div> */}

      {/* <li
      className={`flex items-center gap-4 mb-4 p-2 border rounded ${
        task.status === "ongoing" ? "bg-orange-200" : ""
      }`}
    >
      <span
        className={`flex-1 ${
          task.status === "completed"
            ? "line-through text-gray-500"
            : "text-gray-900"
        }`}
      > */}
      <Select
        value={task.status}
        onValueChange={(newStatus) =>
          onUpdateStatus(task.id, newStatus as Task["status"])
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not-started">Not Started</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      {/* <Button
        variant="ghost"
        size="icon"
        onClick={() => onDeleteTask(task.id)}
        aria-label="Delete task"
      > */}
      <div className="pr-2">
        <DeleteButton onDelete={() => onDeleteTask(task.id)} />
      </div>
      {/* </Button> */}
    </li>
  );
}
