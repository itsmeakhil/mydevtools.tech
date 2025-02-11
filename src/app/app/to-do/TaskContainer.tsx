"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import TaskForm from "@/app/app/to-do/TaskForm";
import TaskList from "@/app/app/to-do/TaskList";
import PaginationDemo from "@/app/app/to-do/PaginationS";
import { useTaskContext } from "@/app/app/to-do/context/TaskContext";
// import { Button } from "@/components/ui/button";

// interface TaskContainerProps {
//   onSignOut: () => void;
// }

export const TaskContainer = () => {
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

  const sortedTasks = [...tasks].sort((a: { status: 'ongoing' | 'not-started' | 'completed' }, b: { status: 'ongoing' | 'not-started' | 'completed' }) => {
    const statusOrder: { [key in 'ongoing' | 'not-started' | 'completed']: number } = {
      ongoing: 1,
      "not-started": 2,
      completed: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="flex justify-center h-auto font-sans">
      <div className="border border-gray-300 rounded-md p-4 flex flex-col gap-4 bg-white mt-2 mb-2">
      <ScrollArea className="p-3">
        <div className="w-[700px] min-h-[600px] flex flex-col justify-between">
          <div className="space-y-4">
            {/* <h1 className="text-2xl font-bold text-center">To-Do</h1> */}
            <TaskForm onAddTask={addTask} />
            <TaskList
              tasks={sortedTasks}
              onUpdateStatus={updateTaskStatus}
              onDeleteTask={deleteTask}
            />
          </div>
          
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
