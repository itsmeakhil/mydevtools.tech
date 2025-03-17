'use client';
import useAuth from "@/utils/useAuth";
import { TaskProvider } from "@/app/app/to-do/context/TaskContext";
import { TaskContainer } from "@/app/app/to-do/TaskContainer";

export default function ToDoPage() {
  const { user, loading } = useAuth(true); // Enforce authentication

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Redirect handled by useAuth
  }

  return (
    <TaskProvider>
      <TaskContainer />
    </TaskProvider>
  );
}