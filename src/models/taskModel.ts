import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
export interface TaskModel {
  id: string;
  uid: string;
  description: string;
  dueDate?: Date,
  startTime?: Date,
  remind: string;
  repeat: string;
  category: string;
  isCompleted: boolean;
  isImportant: boolean;
  createdAt: number;
  updatedAt: number;
}
