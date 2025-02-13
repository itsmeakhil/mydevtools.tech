import { FieldValue, Timestamp } from "firebase/firestore";

export interface Task {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
  statusOrder: number;
  createdAt: string;
  created_by: string;
}

export interface NewTask {
  text: string;
  status: "not-started" | "ongoing" | "completed";
  statusOrder: number;
  createdAt: FieldValue | Timestamp;
  created_by: string;
}
