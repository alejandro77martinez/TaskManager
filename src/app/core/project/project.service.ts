import { computed, Injectable, signal } from '@angular/core';
import {
  NewProjectDraft,
  PortfolioSummary,
  ProjectCard,
  ProjectMethodology,
  ProjectTask,
} from './project.interfaces';

const INITIAL_PROJECTS: ProjectCard[] = [
  {
    id: 101,
    name: 'Portal de proveedores LATAM',
    client: 'Operaciones',
    role: 'Product Owner',
    summary:
      'Centraliza onboarding, aprobaciones y seguimiento de incidencias para partners regionales.',
    priority: 'Alta',
    health: 'En foco',
    progress: 74,
    dueDate: '2026-04-18',
    methodology: 'Kanban',
    sprint: 'Sprint 18',
    completedTasks: 31,
    totalTasks: 42,
    teamMembers: ['Ana Ruiz', 'Diego Vera', 'Laura Soto', 'Ivan Perez'],
    tags: ['B2B', 'Integraciones', 'Dashboard'],
  },
  {
    id: 102,
    name: 'App de inspeccion de campo',
    client: 'Calidad',
    role: 'UX Lead',
    summary:
      'Experiencia movil para capturar hallazgos, evidencia fotografica y checklist offline en planta.',
    priority: 'Alta',
    health: 'En foco',
    progress: 58,
    dueDate: '2026-04-25',
    methodology: 'Hibrido',
    sprint: 'Sprint 09',
    completedTasks: 18,
    totalTasks: 31,
    teamMembers: ['Camila Mena', 'Juan Tapia', 'Marta Leon'],
    tags: ['Mobile', 'Offline', 'QA'],
  },
  {
    id: 103,
    name: 'Migracion de reportes financieros',
    client: 'Finanzas',
    role: 'Analista funcional',
    summary:
      'Renueva reportes manuales hacia tableros con trazabilidad, conciliacion y alertas por excepcion.',
    priority: 'Media',
    health: 'En riesgo',
    progress: 41,
    dueDate: '2026-04-12',
    methodology: 'Kanban',
    sprint: 'Sprint 12',
    completedTasks: 14,
    totalTasks: 34,
    teamMembers: ['Nora Gil', 'Sergio Paz', 'Elena Cruz', 'Tomas Diaz'],
    tags: ['Data', 'BI', 'Cumplimiento'],
  },
  {
    id: 104,
    name: 'Centro de ayuda omnicanal',
    client: 'Customer Care',
    role: 'Delivery Manager',
    summary:
      'Unifica formularios, base de conocimiento y automatizaciones para reducir tiempo de respuesta.',
    priority: 'Media',
    health: 'Descubrimiento',
    progress: 27,
    dueDate: '2026-05-03',
    methodology: 'Scrum',
    sprint: 'Sprint 03',
    completedTasks: 7,
    totalTasks: 26,
    teamMembers: ['Paula Rios', 'Miguel Solis', 'Lina Bravo'],
    tags: ['Soporte', 'Bot', 'Autoservicio'],
  },
];

const INITIAL_TASKS: ProjectTask[] = [
  {
    id: 201,
    title: 'Ajustar permisos por tipo de proveedor',
    projectName: 'Portal de proveedores LATAM',
    assignee: 'Ana Ruiz',
    dueDate: '2026-04-04',
    status: 'En curso',
    priority: 'Alta',
    effortPoints: 5,
    blocked: false,
  },
  {
    id: 202,
    title: 'Disenar tablero de incidencias de campo',
    projectName: 'App de inspeccion de campo',
    assignee: 'Camila Mena',
    dueDate: '2026-04-06',
    status: 'En curso',
    priority: 'Media',
    effortPoints: 3,
    blocked: false,
  },
  {
    id: 203,
    title: 'Validar conciliacion de egresos historicos',
    projectName: 'Migracion de reportes financieros',
    assignee: 'Sergio Paz',
    dueDate: '2026-04-07',
    status: 'En revision',
    priority: 'Alta',
    effortPoints: 8,
    blocked: true,
  },
  {
    id: 204,
    title: 'Configurar automatizacion de respuestas frecuentes',
    projectName: 'Centro de ayuda omnicanal',
    assignee: 'Paula Rios',
    dueDate: '2026-04-10',
    status: 'En curso',
    priority: 'Media',
    effortPoints: 5,
    blocked: false,
  },
  {
    id: 205,
    title: 'Refinar backlog de inspecciones offline',
    projectName: 'App de inspeccion de campo',
    assignee: 'Juan Tapia',
    dueDate: '2026-04-08',
    status: 'Pendiente',
    priority: 'Alta',
    effortPoints: 5,
    blocked: false,
  },
  {
    id: 206,
    title: 'Crear guideline de permisos por rol',
    projectName: 'Portal de proveedores LATAM',
    assignee: 'Laura Soto',
    dueDate: '2026-04-09',
    status: 'Pendiente',
    priority: 'Media',
    effortPoints: 3,
    blocked: false,
  },
  {
    id: 207,
    title: 'Preparar demo ejecutiva de avance Q2',
    projectName: 'Centro de ayuda omnicanal',
    assignee: 'Miguel Solis',
    dueDate: '2026-04-11',
    status: 'Pendiente',
    priority: 'Baja',
    effortPoints: 2,
    blocked: false,
  },
  {
    id: 208,
    title: 'Cerrar pruebas UAT de facturas recurrentes',
    projectName: 'Migracion de reportes financieros',
    assignee: 'Nora Gil',
    dueDate: '2026-04-01',
    status: 'Completada',
    priority: 'Alta',
    effortPoints: 8,
    blocked: false,
  },
  {
    id: 209,
    title: 'Unificar estados de ticket en help center',
    projectName: 'Centro de ayuda omnicanal',
    assignee: 'Lina Bravo',
    dueDate: '2026-03-30',
    status: 'Completada',
    priority: 'Media',
    effortPoints: 5,
    blocked: false,
  },
];

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly projectsSignal = signal<ProjectCard[]>(INITIAL_PROJECTS);
  private readonly tasksSignal = signal<ProjectTask[]>(INITIAL_TASKS);

  readonly projects = this.projectsSignal.asReadonly();

  readonly inProgressTasks = computed(() =>
    this.tasksSignal().filter((task) => task.status === 'En curso'),
  );

  readonly pendingTasks = computed(() =>
    this.tasksSignal().filter((task) => task.status === 'Pendiente'),
  );

  readonly portfolioSummary = computed<PortfolioSummary>(() => {
    const projects = this.projectsSignal();
    const tasks = this.tasksSignal();
    const totalCollaborators = new Set(projects.flatMap((project) => project.teamMembers)).size;
    const blockedTasks = tasks.filter((task) => task.blocked).length;
    const nextDeadline = [...projects]
      .sort((left, right) => this.toTimestamp(left.dueDate) - this.toTimestamp(right.dueDate))[0]
      ?.dueDate;
    const avgProgress = Math.round(
      projects.reduce((accumulator, project) => accumulator + project.progress, 0) /
        Math.max(projects.length, 1),
    );

    return {
      activeProjects: projects.length,
      avgProgress,
      nextDeadline: nextDeadline ?? null,
      totalCollaborators,
      blockedTasks,
    };
  });

  createProject(draft: NewProjectDraft): void {
    const teamMembers = this.splitCommaSeparatedValues(draft.teamMembers);
    const tags = this.splitCommaSeparatedValues(draft.tags);
    const nextProjectId = this.getNextId(this.projectsSignal().map((project) => project.id));
    const nextTaskId = this.getNextId(this.tasksSignal().map((task) => task.id));
    const methodology = draft.methodology || this.getDefaultMethodology();
    const newProject: ProjectCard = {
      id: nextProjectId,
      name: draft.name.trim(),
      client: draft.client.trim(),
      role: draft.role.trim() || 'Colaborador principal',
      summary: draft.summary.trim(),
      priority: draft.priority,
      health: 'Descubrimiento',
      progress: 0,
      dueDate: draft.dueDate,
      methodology,
      sprint: methodology === 'Kanban' ? 'Flujo inicial' : 'Sprint 00',
      completedTasks: 0,
      totalTasks: 4,
      teamMembers: teamMembers.length ? teamMembers : ['Equipo por asignar'],
      tags: tags.length ? tags : ['Nuevo proyecto'],
    };

    const kickoffTask: ProjectTask = {
      id: nextTaskId,
      title: `Definir alcance inicial de ${newProject.name}`,
      projectName: newProject.name,
      assignee: newProject.teamMembers[0],
      dueDate: draft.dueDate,
      status: 'Pendiente',
      priority: newProject.priority,
      effortPoints: 3,
      blocked: false,
    };

    this.projectsSignal.update((projects) => [newProject, ...projects]);
    this.tasksSignal.update((tasks) => [kickoffTask, ...tasks]);
  }

  private getDefaultMethodology(): ProjectMethodology {
    return 'Kanban';
  }

  private splitCommaSeparatedValues(value: string): string[] {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  private getNextId(ids: number[]): number {
    return Math.max(...ids, 0) + 1;
  }

  private toTimestamp(value: string): number {
    return new Date(value).getTime();
  }
}
