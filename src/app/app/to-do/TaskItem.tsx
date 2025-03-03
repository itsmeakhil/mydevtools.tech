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
        return "bg-gray-200 dark:bg-gray-200 dark:text-black";
      case "ongoing":
        return "bg-orange-200 dark:bg-orange-200 dark:text-black";
      case "completed":
        return "bg-green-200 dark:bg-green-200 dark:text-black";
      default:
        return "";
    }
  };

  return (
    <li
      className={`flex items-center gap-4 mb-4 p-2 border rounded-sm transition-colors border-gray-300 dark:border-gray-300 ${getStatusColor(
        task.status
      )}`}
    >
      <span
        className={`flex-1 font-normal ${
          task.status === "completed"
            ? "text-gray-500 line-through dark:text-gray-400" // Light gray text when completed
            : "text-gray-900 dark:text-black" // Default text color
        }`}
      >
        {task.text}
      </span>

      <p className="text-xs text-gray-600 dark:text-gray-600">
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
          className={`w-[150px] border-gray-400 dark:border-gray-400 dark:text-black ${getStatusColor(
            task.status
          )}`}
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        {/* Dropdown Content Always White with Black Text in Both Modes */}
        <SelectContent className="bg-white text-black border-gray-200 shadow-md rounded-lg">
          <SelectItem
            value="not-started"
            className="!text-black hover:bg-gray-100 focus:bg-gray-100"
          >
            Not Started
          </SelectItem>
          <SelectItem
            value="ongoing"
            className="!text-black hover:bg-gray-100 focus:bg-gray-100"
          >
            Ongoing
          </SelectItem>
          <SelectItem
            value="completed"
            className="!text-black hover:bg-gray-100 focus:bg-gray-100"
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
