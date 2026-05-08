export type TaskStatus =
  | 'Creada'
  | 'En curso'
  | 'En revision'
  | 'Completada';

export type TaskPriority =
  | 'Baja'
  | 'Media'
  | 'Alta';

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  type: string;
  status: TaskStatus;
  projectId: string;
  assigneeId: string;
  subTasks: string[];
  dueDate: string;
  createdDate: string;
  startDate: string;
  priority: TaskPriority;
  effortPoints: number;
  blocked: boolean;
}

export interface TaskForProject {
  projectId: string;
  tasks: TaskCard[];
}