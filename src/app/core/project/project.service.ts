import { computed, inject, Injectable, signal } from '@angular/core';
import { ProjectCard, ProjectHealth, ProjectPriority, ProjectTask, ProjectTaskStatus } from './project.interfaces';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { UserSearchEmailResult } from '../users/user.interfaces';

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

  private readonly authService = inject(AuthService);
  private readonly projectsSignal = signal<ProjectCard[]>([]);
  private readonly membersSignal = signal<UserSearchEmailResult[]>([]);
  private readonly tasksSignal = signal<ProjectTask[]>(INITIAL_TASKS);
  private readonly loadProjectsFromApi = signal(false);
  private readonly apiBase = environment.authApiBaseUrl;

  readonly projects = this.projectsSignal.asReadonly();
  readonly loadProjects = this.loadProjectsFromApi.asReadonly();

  constructor(private http: HttpClient) {
    this.getProjectsFromApi();
  }

  readonly inProgressTasks = computed(() =>
    this.tasksSignal().filter((task) => task.status === 'En curso'),
  );
  readonly pendingTasks = computed(() =>
    this.tasksSignal().filter((task) => task.status === 'Pendiente'),
  );

  readonly overviewCards = computed(() => {
    const summary = this.portfolioSummary();
    return [
      {
        label: 'Proyectos activos',
        value: `${summary.activeProjects}`,
        helper: 'Iniciativas con seguimiento visible desde esta vista.',
      },
      {
        label: 'Avance promedio',
        value: `${summary.avgProgress}%`,
        helper: 'Progreso acumulado entre todos los frentes activos.',
      },
      {
        label: 'Colaboradores',
        value: `${summary.totalCollaborators}`,
        helper: 'Personas distintas participando en el portafolio.',
      },
      {
        label: 'Proxima entrega',
        value: this.formatDate(summary.nextDeadline, true),
        helper: 'Fecha mas cercana comprometida por el equipo.',
      },
    ];
  });

  readonly projectSignals = computed(() => {
    const projects = this.projects();
    const summary = this.portfolioSummary();

    return [
      {
        label: 'Alta prioridad',
        value: `${projects.filter((project) => project.priority === 'Alta').length}`,
      },
      {
        label: 'En foco',
        value: `${projects.filter((project) => project.health === 'En foco').length}`,
      },
      {
        label: 'Bloqueos',
        value: `${summary.blockedTasks}`,
      },
    ];
  });

  readonly portfolioSummary = computed(() => {
    const projects = this.projectsSignal();
    const tasks = this.tasksSignal();

    const activeProjects = projects.length;
    const avgProgress = activeProjects
      ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / activeProjects)
      : 0;
    const totalCollaborators = new Set(projects.flatMap((project) => project.teamMembers)).size;
    const nextDeadline = tasks
      .filter((task) => task.status !== 'Completada')
      .map((task) => task.dueDate)
      .filter(Boolean)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] ?? null;
    const blockedTasks = tasks.filter((task) => task.blocked).length;

    return {
      activeProjects,
      avgProgress,
      totalCollaborators,
      nextDeadline,
      blockedTasks,
    };
  });

  getInitialsMember(id: string): string {
    return this.membersSignal()
      .find(member => member.id === id)?.name
      .split(' ')
      .map(n => n[0])
      .join('') || '';
  }
  
  getNameMember(id:string): string {
    return this.membersSignal()
      .find(member => member.id === id)?.name || '';
  }

  formatDate(value: string | null, longFormat = false): string {
    if (!value) {
      return 'Sin fecha';
    }
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      ...(longFormat ? { year: 'numeric' } : {}),
    }).format(new Date(value));
  }

  getHealthClasses(health: ProjectHealth): string {
    switch (health) {
      case 'En foco':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
      case 'En riesgo':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
      default:
        return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200';
    }
  }
  
  getPriorityClasses(priority: ProjectPriority): string {
    switch (priority) {
      case 'Alta':
        return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200';
      case 'Media':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  }

  getTaskStatusClasses(status: ProjectTaskStatus): string {
    switch (status) {
      case 'En curso':
        return 'bg-primary-100 text-primary-700 ring-1 ring-primary-200';
      case 'Pendiente':
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
      case 'En revision':
        return 'bg-violet-100 text-violet-700 ring-1 ring-violet-200';
      default:
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
    }
  }

  previewCommaSeparatedValues(value: string): string[] {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  getProjectsFromApi(): void {
    this.http.get<ProjectCard[]>(this.apiBase + '/api/v1/project/ofTheUser/' + this.getUserId()).subscribe({
      next: (projects) => {
        this.projectsSignal.set(projects);
        const teamMenbersIds = Array.from(new Set(projects.flatMap(p => p.teamMembers)));
        this.getMembersByIds(teamMenbersIds);
      },
      error: (err) => console.error('Error fetching projects:', err),
    });
  }
  
  private getMembersByIds(ids: string[]): void {
    this.http.post<UserSearchEmailResult[]>(this.apiBase + '/api/v1/user/search/team', ids).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (members) => {
        const currentMembers = this.membersSignal();
        const updatedMembers = [...currentMembers, ...members.filter(member => !currentMembers.some(m => m.id === member.id))];
        this.membersSignal.set(updatedMembers);
        this.loadProjectsFromApi.set(true);
      },
      error: (err) => {
        this.loadProjectsFromApi.set(true);
        console.error('Error fetching members:', err)
      },
    });
  }

  private getUserId(): string {
    return this.authService.authUser()?.id ?? '';
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status} - Mensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
