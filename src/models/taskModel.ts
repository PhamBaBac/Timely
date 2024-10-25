export interface TaskModel {
  id: string;
  uid: string;
  title: string;
  description: string;
  dueDate?: Date;
  startDate?: string;
  startTime?: Date;
  remind: string;
  repeat: 'no' | 'day' | 'week' | 'month';
  category: string;
  isCompleted: boolean;
  isImportant: boolean;
  createdAt: number;
  updatedAt: number;
}
export interface SubTask {
  createdAt: number;
  description: string;
  id: string;
  isCompleted: boolean;
  taskId: string;
  title: string;
  updatedAt: number;
}