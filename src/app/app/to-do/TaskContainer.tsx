"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import TaskForm from "@/app/app/to-do/TaskForm";
import TaskList from "@/app/app/to-do/TaskList";
import PaginationDemo from "@/app/app/to-do/PaginationS";
import { useTaskContext } from "@/app/app/to-do/context/TaskContext";

export const TaskContainer = () => {
  const {
    tasks,
    isLoading,
    currentPage,
    totalPages,
    fetchNextPage,
    fetchPreviousPage,
    handlePageChange,
    addTask,
    updateTaskStatus,
    deleteTask,
  } = useTaskContext();

  const sortedTasks = [...tasks].sort(
    (a: { status: "ongoing" | "not-started" | "completed" }, 
     b: { status: "ongoing" | "not-started" | "completed" }) => {
      const statusOrder: { [key in "ongoing" | "not-started" | "completed"]: number } = {
        ongoing: 1,
        "not-started": 2,
        completed: 3,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    }
  );

  return (
    <div className="flex justify-center h-auto font-sans">
      <div className="border border-gray-300 dark:border-gray-600 
                      rounded-md p-4 flex flex-col gap-4 
                      bg-white dark:bg-[#121212] mt-2 mb-3">
        <ScrollArea className="p-2">
          <div className="w-[900px] min-h-[600px] flex flex-col justify-between">
            <div className="space-y-4">
              <TaskForm onAddTask={addTask} />
              
              {/* Task List Container with Dark Mode Support */}
              <div className="min-h-[400px] dark:bg-[#1E1E1E] dark:border dark:border-gray-700 p-4 rounded-lg">
                <TaskList
                  tasks={sortedTasks}
                  isLoading={isLoading}
                  onUpdateStatus={updateTaskStatus}
                  onDeleteTask={deleteTask}
                />
              </div>
            </div>

            {/* Pagination Section */}
            <div className="mt-1">
              <PaginationDemo
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={fetchNextPage}
                onPreviousPage={fetchPreviousPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
