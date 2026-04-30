export type TaskStatus =
  | 'Creada'
  | 'Pendiente'
  | 'En curso'
  | 'En revision'
  | 'Completada';

export type TaskPriority =
  | 'Baja'
  | 'Media'
  | 'Alta'
  | 'Urgente';

export interface TaskCard {
  id: number;
  title: string;
  projectName: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  effortPoints: number;
  blocked: boolean;
}