export interface TaskModel {
  id: string;
  uid: string;
  description: string;
  dueDate?: Date;
  startDate?: string;
  startTime?: Date;
  remind: string;
  repeat: 'no' | 'day' | 'week' | 'month' | 'weekday';
  category: string;
  isCompleted: boolean;
  isImportant: boolean;
  createdAt: number;
  updatedAt: number;
  subtasks: Subtask[];
}
export interface Subtask {
  description: string;
  isCompleted: boolean;
}
