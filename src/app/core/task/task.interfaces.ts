export type TaskStatus =
  | 'Creada'
  | 'En curso'
  | 'En revision'
  | 'Completada';

export type TaskPriority =
  | 'Baja'
  | 'Media'
  | 'Alta';

export type taskType = 
  | 'Error' 
  | 'Funcionalidad' 
  | 'Mejora' 
  | 'Documentación';

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  type: taskType;
  status: TaskStatus;
  projectId: string;
  assigneeId: string;
  parentTaskId: string;
  dueDate: string;
  createdDate: string;
  startDate: string;
  priority: TaskPriority;
  effortPoints: number;
  blocked: boolean;
  isSubtask: boolean;
}

export interface TaskRequest {
  title: string;
  description: string;
  type: taskType;
  status: TaskStatus;
  projectId: string;
  assigneeId: string;
  parentTaskId: string;
  dueDate: string;
  createdDate: string;
  startDate: string;
  priority: TaskPriority;
  effortPoints: number;
  blocked: boolean;
  isSubtask: boolean;
}

export interface TaskForProject {
  projectId: string;
  tasks: TaskCard[];
}