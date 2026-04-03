import { AfterViewInit, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import {
  NewProjectDraft,
  ProjectHealth,
  ProjectPriority,
  ProjectTaskStatus,
} from '../../../../core/project/project.interfaces';
import { ProjectService } from '../../../../core/project/project.service';

@Component({
  selector: 'app-project',
  imports: [FormsModule],
  templateUrl: './project.component.html',
})
export class ProjectComponent implements AfterViewInit {
  private readonly projectService = inject(ProjectService);

  readonly projects = this.projectService.projects;
  readonly inProgressTasks = this.projectService.inProgressTasks;
  readonly pendingTasks = this.projectService.pendingTasks;
  readonly portfolioSummary = this.projectService.portfolioSummary;
  readonly isCreatePanelOpen = signal(false);

  newProjectDraft: NewProjectDraft = this.createEmptyProjectDraft();

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

  ngAfterViewInit(): void {
    initFlowbite();
  }

  openCreateProjectPanel(): void {
    this.isCreatePanelOpen.set(true);
  }

  closeCreateProjectPanel(): void {
    this.isCreatePanelOpen.set(false);
  }

  createProject(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.projectService.createProject(this.newProjectDraft);
    this.newProjectDraft = this.createEmptyProjectDraft();
    form.resetForm(this.newProjectDraft);
    this.closeCreateProjectPanel();
    setTimeout(() => initFlowbite());
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? '')
      .join('');
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

  private createEmptyProjectDraft(): NewProjectDraft {
    return {
      name: '',
      client: '',
      role: '',
      summary: '',
      priority: 'Media',
      methodology: 'Kanban',
      dueDate: '',
      teamMembers: '',
      tags: '',
    };
  }
}
