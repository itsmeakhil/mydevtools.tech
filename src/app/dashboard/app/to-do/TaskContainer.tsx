"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import TaskForm from "@/app/dashboard/app/to-do/TaskForm";
import TaskList from "@/app/dashboard/app/to-do/TaskList";
import PaginationDemo from "@/app/dashboard/app/to-do/PaginationS";
import { useTaskContext } from "@/app/dashboard/app/to-do/context/TaskContext";
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

  return (
    <div className="flex justify-center items-center h-screen ml-[var(--sidebar-width)]">
      <ScrollArea className="p-6">
        <div className="w-[700px] h-[600px] min-h-custom min-w-custom">
          <h1 className="text-2xl font-bold mb-4 text-center items-center">
            To-Do 
          </h1>
          <TaskForm onAddTask={addTask} />
          <TaskList
            tasks={[...tasks].sort((a: { status: 'ongoing' | 'not-started' | 'completed' }, b: { status: 'ongoing' | 'not-started' | 'completed' }) => {
              const statusOrder: { [key in 'ongoing' | 'not-started' | 'completed']: number } = {
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
          {/* <Button variant="secondary" onClick={onSignOut}>
            Sign Out
          </Button> */}
        </div>
      </ScrollArea>
    </div>
  );
};
