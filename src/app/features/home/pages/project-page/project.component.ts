import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { ProjectHealth, ProjectPriority, ProjectTaskStatus } from '../../../../core/project/project.interfaces';
import { ProjectService } from '../../../../core/project/project.service';
import { NewProjectFormComponent } from './components/new-project-form/form.component';
import { ProjectCreateService } from '../../../../core/project/project.create.service';

@Component({
  selector: 'app-project',
  imports: [FormsModule, NewProjectFormComponent],
  templateUrl: './project.component.html',
})
export class ProjectComponent implements AfterViewInit {
  
  private readonly projectService = inject(ProjectService);
  private readonly projectCreateService = inject(ProjectCreateService);

  readonly projects = this.projectService.projects;
  readonly inProgressTasks = this.projectService.inProgressTasks;
  readonly pendingTasks = this.projectService.pendingTasks;
  readonly overviewCards = this.projectService.overviewCards;
  readonly projectSignals = this.projectService.projectSignals;
  readonly portfolioSummary = this.projectService.portfolioSummary;
  readonly formatDate = this.projectService.formatDate;
  readonly openCreateProjectPanel = this.projectCreateService.openCreateProjectPanel;

  ngAfterViewInit(): void {
    initFlowbite();
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

  getInitials(member: string): string {
    return this.projectService.getInitialsMember(member);
  }
}
