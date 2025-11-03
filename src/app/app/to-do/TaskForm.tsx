"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";

interface TaskFormProps {
  onAddTask: (task: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function TaskForm({ onAddTask, inputRef }: TaskFormProps) {
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
    <Card className={`transition-all duration-200 ${isFocused ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border'}`}>
      <div className="p-3 md:p-4">
        <div className="flex gap-2 items-center">
          {/* Icon - Smaller */}
          <div className="flex items-center justify-center p-1.5 bg-primary/10 rounded-md min-w-[32px] h-[32px]">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          
          {/* Input Field */}
          <div className="flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="h-9 border text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>

          {/* Add Task Button */}
          <Button
            onClick={handleAddTask}
            size="sm"
            className="gap-1.5 h-9 px-4"
            disabled={newTask.trim() === ""}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 ml-[44px]">
          Press Enter to add
        </p>
      </div>
    </Card>
  );
}
