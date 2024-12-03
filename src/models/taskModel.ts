export interface TaskModel {
  id: string;
  uid: string;
  title: string;
  description: string;
  dueDate?: Date;
  startDate?: string;
  startTime?: Date;
  endDate?: Date;
  remind: string;
  repeat: 'no' | 'day' | 'week' | 'month' | 'weekday';
  repeatDays: number[];
  repeatCount: number;
  category: string;
  notified: boolean;
  isCompleted: boolean;
  isImportant: boolean;
  priority: 'low' | 'medium' | 'high';
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
