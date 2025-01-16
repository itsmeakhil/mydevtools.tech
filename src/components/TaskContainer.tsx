"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/ui/TaskList";
import PaginationDemo from "@/components/PaginationS";
import { useTaskContext } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";

interface TaskContainerProps {
  onSignOut: () => void;
}

export const TaskContainer: React.FC<TaskContainerProps> = ({ onSignOut }) => {
  const {
    tasks,
    currentPage,
    totalPages,
    fetchNextPage,
    fetchPreviousPage,
    handlePageChange,
    addTask,
    updateTaskStatus,
    deleteTask,
  } = useTaskContext();

  return (
    <div className="flex justify-center items-center h-screen">
      <ScrollArea className="p-6">
        <div className="w-[700] h-[600] min-h-custom min-w-custom">
          <h1 className="text-2xl font-bold mb-4 text-center items-center">
            To-Do
          </h1>
          <TaskForm onAddTask={addTask} />
          <TaskList
            tasks={[...tasks].sort((a, b) => {
              const statusOrder = {
                ongoing: 1,
                "not-started": 2,
                completed: 3,
              };
              return statusOrder[a.status] - statusOrder[b.status];
            })}
            onUpdateStatus={updateTaskStatus}
            onDeleteTask={deleteTask}
          />
        </div>
        <div className="flex justify-center items-center">
          <PaginationDemo
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={fetchNextPage}
            onPreviousPage={fetchPreviousPage}
            onPageChange={handlePageChange}
          />
          <Button variant="secondary" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
