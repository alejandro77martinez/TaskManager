import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { ProjectService } from '../../../../core/project/project.service';
import { NewProjectFormComponent } from './components/new-project-form/form.component';
import { ProjectCreateService } from '../../../../core/project/project.create.service';
import { ProjectDetailsService } from '../../../../core/project/project.details.service';
import { DetailsProjectComponent } from './components/details-project/details.project.component';
import { TaskService } from '../../../../core/task/task.service';
import { TaskCard } from '../../../../core/task/task.interfaces';

@Component({
  selector: 'app-project',
  imports: [FormsModule, NewProjectFormComponent, DetailsProjectComponent],
  templateUrl: './project.component.html',
})
export class ProjectComponent implements AfterViewInit {
  
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);
  private readonly projectCreateService = inject(ProjectCreateService);
  private readonly projectDetailsService = inject(ProjectDetailsService);

  readonly projects = this.projectService.projects;
  readonly overviewCards = this.projectService.overviewCards;
  readonly projectSignals = this.projectService.projectSignals;
  readonly portfolioSummary = this.projectService.portfolioSummary;
  readonly formatDate = this.projectService.formatDate;
  readonly getHealthClasses = this.projectService.getHealthClasses;
  readonly getPriorityClasses = this.projectService.getPriorityClasses;
  readonly getTaskStatusClasses = this.taskService.getTaskStatusClasses;
  readonly previewCommaSeparatedValues = this.projectService.previewCommaSeparatedValues;

  ngAfterViewInit(): void {
    initFlowbite();
  }

  openProjectCreatePanel (): void {
    this.projectCreateService.openCreateProjectPanel();
  }

  openProjectDetailsPanel (projectId: string): void {
    this.projectDetailsService.openDetailsProjectPanel(projectId);
  }

  getInitials(member: string): string {
    return this.projectService.getInitialsMember(member);
  }

  getNameMember(member: string): string {
    return this.projectService.getNameMember(member);
  }

  getNameProject(projectId: string): string {
    return this.projectService.getNameProject(projectId);
  }
  
  getInProgressTasks(): TaskCard[] {
    return this.projectService.inProgressTasks()
  }

  getPendingTasks(): TaskCard[] {
    return this.projectService.blockedTasks()
  }
}
