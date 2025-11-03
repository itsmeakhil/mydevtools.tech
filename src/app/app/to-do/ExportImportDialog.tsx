"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Task } from "@/app/app/to-do/types/Task";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  onImport: (tasks: Task[]) => Promise<void>;
}

export default function ExportImportDialog({
  open,
  onOpenChange,
  tasks,
  onImport,
}: ExportImportDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Tasks exported successfully!");
  };

  const exportToCSV = () => {
    if (tasks.length === 0) {
      toast.error("No tasks to export");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Due Date",
      "Created At",
      "Completed At",
      "Tags",
      "Time Estimate (min)",
      "Time Logged (min)",
    ];

    const rows = tasks.map((task) => [
      task.id,
      `"${task.text.replace(/"/g, '""')}"`,
      `"${(task.description || "").replace(/"/g, '""')}"`,
      task.status,
      task.priority || "",
      task.dueDate || "",
      task.createdAt,
      task.completedAt || "",
      task.tags?.map((t) => t.name).join(";") || "",
      task.timeEstimate || "",
      task.timeLogged || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Tasks exported to CSV successfully!");
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importedTasks = JSON.parse(text) as Task[];

      // Validate the imported data
      if (!Array.isArray(importedTasks)) {
        throw new Error("Invalid file format: expected an array of tasks");
      }

      // Basic validation of task structure
      for (const task of importedTasks) {
        if (!task.text || !task.status) {
          throw new Error("Invalid task structure: missing required fields");
        }
      }

      await onImport(importedTasks);
      toast.success(`Successfully imported ${importedTasks.length} tasks!`);
      onOpenChange(false);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import tasks. Please check the file format.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export / Import Tasks</DialogTitle>
          <DialogDescription>
            Backup your tasks or import from a previous export
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <FileJson className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Export as JSON</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export all task data including subtasks, tags, and metadata. Best for
                      backing up and restoring your tasks.
                    </p>
                    <Button onClick={exportToJSON} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export JSON ({tasks.length} tasks)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-green-500/10">
                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Export as CSV</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export tasks in CSV format for use in spreadsheet applications. Some data
                      may be simplified.
                    </p>
                    <Button onClick={exportToCSV} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export CSV ({tasks.length} tasks)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">
                    Import Warning
                  </h4>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    Importing tasks will add them to your existing tasks. This action cannot be
                    undone. Make sure to export your current tasks first as a backup.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-dashed text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Import from JSON</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a JSON file exported from this app
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? "Importing..." : "Select JSON File"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

