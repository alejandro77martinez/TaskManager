export type ProjectPriority = 'Alta' | 'Media' | 'Baja';

export type ProjectHealth = 'En foco' | 'En riesgo' | 'Descubrimiento';

export type ProjectMethodology = 'Kanban' | 'Scrum' | 'Hibrido';

export type ProjectTaskStatus =
  | 'Pendiente'
  | 'En curso'
  | 'En revision'
  | 'Completada';

export interface ProjectCard {
  id: number;
  name: string;
  client: string;
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

export interface ProjectTask {
  id: number;
  title: string;
  projectName: string;
  assignee: string;
  dueDate: string;
  status: ProjectTaskStatus;
  priority: ProjectPriority;
  effortPoints: number;
  blocked: boolean;
}

export interface PortfolioSummary {
  activeProjects: number;
  avgProgress: number;
  nextDeadline: string | null;
  totalCollaborators: number;
  blockedTasks: number;
}

export interface NewProjectDraft {
  name: string;
  client: string;
  role: string;
  summary: string;
  priority: ProjectPriority;
  methodology: ProjectMethodology;
  dueDate: string;
  teamMembers: string;
  tags: string;
}
