import { computed, inject, Injectable, signal } from '@angular/core';
import { ProjectCard, ProjectHealth, ProjectPriority } from './project.interfaces';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { UserSearchEmailResult } from '../users/user.interfaces';
import { TaskService } from '../task/task.service';
import { TaskCard } from '../task/task.interfaces';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  private readonly authService = inject(AuthService);
  private readonly taskService = inject(TaskService);
  private readonly projectsSignal = signal<ProjectCard[]>([]);
  private readonly membersSignal = signal<UserSearchEmailResult[]>([]);
  private readonly currentProjectIdSignal = signal<string>('');
  private readonly loadProjectsFromApi = signal(false);
  private readonly apiBase = environment.authApiBaseUrl;

  readonly currentProjectId = this.currentProjectIdSignal.asReadonly();
  readonly projects = this.projectsSignal.asReadonly();
  readonly loadProjects = this.loadProjectsFromApi.asReadonly();

  constructor(private http: HttpClient) {
    this.getProjectsFromApi();
  }

  setCurrentProjectId(id: string) {
    this.currentProjectIdSignal.set(id);
  }

  getMembersOfCurrentProject() {
    const currentProject = this.projectsSignal().find(project => project.id === this.currentProjectIdSignal());
    if (!currentProject) {
      return [];
    }
    const memberIds = Array.from(new Set(currentProject.teamMembers.concat(currentProject.creator)));
    return memberIds.map(memberId => this.membersSignal().find(member => member.id === memberId)).filter(Boolean) as UserSearchEmailResult[];
  }

  getNameCurrentProject() {
    const currentProject = this.projectsSignal().find(project => project.id === this.currentProjectIdSignal());
    return currentProject ? currentProject.name : '';
  }

  inProgressTasks(): TaskCard[] {
    return this.taskService.getAllTask().filter((task) => task.status === 'En curso')
  }

  blockedTasks(): TaskCard[] {
    return this.taskService.getAllTask().filter((task) => task.blocked)
  }

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
    const tasks = this.taskService.getAllTask();

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

  getNameProject(id:string): string {
    return this.projectsSignal()
      .find(p => p.id === id)?.name || "";
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
        const teamMenbersIds = Array.from(new Set(projects.flatMap(p => p.teamMembers).concat(projects.map(p => p.creator))));
        const projectsIds = projects.map(p => p.id);
        this.getMembersByIds(teamMenbersIds);
        this.taskService.getTaskByProjectsIds(projectsIds);
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
