"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskFormProps {
  onAddTask: (task: string) => void;
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    onAddTask(newTask);
    setNewTask("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      {/* Input Field */}
      <Input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Add a new task"
        className="m-1 px-3 py-2 border rounded-md text-black bg-white border-gray-300
                   focus:ring focus:ring-gray-300 
                   dark:text-white dark:bg-black dark:border-gray-500 
                   dark:focus:ring-gray-600"
        onKeyDown={handleKeyDown}
      />

      {/* Add Task Button */}
      <Button
        onClick={handleAddTask}
        className="mt-1 px-4 py-2 rounded-md bg-black text-white 
                   hover:bg-gray-900 
                   dark:bg-white dark:text-black dark:hover:bg-gray-200 
                   border border-gray-300 dark:border-gray-500"
      >
        Add Task
      </Button>
    </div>
  );
}
