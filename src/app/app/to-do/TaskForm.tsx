"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";

interface TaskFormProps {
  onAddTask: (task: string) => void;
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [newTask, setNewTask] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
    <Card className={`transition-all duration-300 ${isFocused ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-2'}`}>
      <div className="p-6">
        <div className="flex gap-3 items-start">
          {/* Icon */}
          <div className="flex items-center justify-center p-2 bg-primary/10 rounded-lg border border-primary/20 shadow-sm min-w-[40px] h-[40px]">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          
          {/* Input Field */}
          <div className="flex-1">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="text-lg h-12 border-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <p className="text-xs text-muted-foreground mt-1.5 ml-1">
              Press Enter to add
            </p>
          </div>

          {/* Add Task Button */}
          <Button
            onClick={handleAddTask}
            size="lg"
            className="gap-2 h-12 px-6 shadow-md hover:shadow-lg transition-all duration-200"
            disabled={newTask.trim() === ""}
          >
            <Plus className="h-5 w-5" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
