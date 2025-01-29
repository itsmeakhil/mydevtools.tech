import { FieldValue, Timestamp } from "firebase/firestore";

export type Task = {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
  createdAt: string;
  created_by: string;
};

export interface NewTask {
  text: string;
  status: string;
  createdAt: FieldValue | Timestamp;
  created_by: string;
}
