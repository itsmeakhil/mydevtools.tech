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
  // Define background color based on task status
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "not-started":
        return "bg-gray-200 dark:bg-gray-700 dark:text-gray-300";
      case "ongoing":
        return "bg-orange-200 dark:bg-amber-700 dark:text-gray-300";
      case "completed":
        return "bg-green-200 dark:bg-green-700 dark:text-gray-300";
      default:
        return "";
    }
  };

  return (
    <li
      className={`flex items-center gap-4 mb-4 p-2 border rounded-md transition-colors 
                  border-gray-300 dark:border-gray-600 ${getStatusColor(task.status)}`}
    >
      <span
        className={`flex-1 font-normal ${
          task.status === "completed"
            ? "text-gray-500 line-through dark:text-gray-300"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {task.text}
      </span>

      <p className="text-xs text-gray-600 dark:text-gray-400">
        {task.createdAt}
      </p>

      {/* Status Dropdown */}
      <Select
        value={task.status}
        onValueChange={(newStatus) =>
          onUpdateStatus(task.id, newStatus as Task["status"])
        }
      >
        <SelectTrigger
          className={`w-[150px] border-gray-300 dark:border-gray-500 dark:text-white ${getStatusColor(
            task.status
          )}`}
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        {/* Dropdown Content with Improved Dark Mode Styling */}
        <SelectContent className="bg-white dark:bg-gray-900 text-black dark:text-gray-300 border-gray-300 dark:border-gray-600 shadow-md rounded-lg">
          <SelectItem
            value="not-started"
            className="!text-black dark:!text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Not Started
          </SelectItem>
          <SelectItem
            value="ongoing"
            className="!text-black dark:!text-gray-300 hover:bg-gray-100 dark:hover:bg-amber-700"
          >
            Ongoing
          </SelectItem>
          <SelectItem
            value="completed"
            className="!text-black dark:!text-gray-300 hover:bg-gray-100 dark:hover:bg-green-700"
          >
            Completed
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="pr-2">
        <DeleteButton onDelete={() => onDeleteTask(task.id)} />
      </div>
    </li>
  );
}