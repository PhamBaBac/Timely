import {TaskModel} from '../models/taskModel';

export interface TaskDetailProps {
  task: TaskModel;
  screenTitle?: string;
  headerIcon?: string;
}

export interface TaskDetailScreenProps {
  route: {
    params: TaskDetailProps;
  };
}
