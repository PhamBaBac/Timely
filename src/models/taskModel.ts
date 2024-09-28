import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
export interface TaskModel {
  id: string;
  uid: string;
  description: string;
  dueDate?: Date;
  startDate?: string;
  startTime?: Date;
  remind: string;
  repeat: "no" | "day" | "week" | "month";
  category: string;
  isCompleted: boolean;
  isImportant: boolean;
  createdAt: number;
  updatedAt: number;
  subtasks: string[];
}