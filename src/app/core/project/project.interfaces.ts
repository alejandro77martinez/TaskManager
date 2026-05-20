import { UserRoleRequest } from "../users/user.interfaces";

export type ProjectPriority = 'Alta' | 'Media' | 'Baja';

export type ProjectHealth = 'En foco' | 'En riesgo' | 'Descubrimiento';

export type ProjectMethodology = 'Kanban' | 'Scrum' | 'Hibrido';

export type ProjectTaskStatus =
  | 'Pendiente'
  | 'En curso'
  | 'En revision'
  | 'Completada';

export interface ProjectCard {
  id: string;
  name: string;
  client: string;
  creator: string;
  role: string;
  summary: string;
  priority: ProjectPriority;
  health: ProjectHealth;
  progress: number;
  dueDate: string;
  methodology: ProjectMethodology;
  sprint: string;
  completedTasks: number;
  totalTasks: number;
  teamMembers: string[];
  tags: string[];
}

export interface ProjectRequest {
  id?: string;
  name: string;
  client: string;
  summary: string;
  priority: ProjectPriority;
  health: ProjectHealth;
  progress: number;
  methodology: ProjectMethodology;
  createdDate: string;
  startDate: string;
  dueDate: string;
  userCreated: UserRoleRequest;
  teamMembers: UserRoleRequest[];
  tags: string[];
}

export interface NewProjectDraft {
  name: string;
  client: string;
  role: string;
  summary: string;
  priority: ProjectPriority;
  methodology: ProjectMethodology;
  dueDate: string;
  tags: string;
}
