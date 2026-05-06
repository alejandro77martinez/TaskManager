import { Component, inject } from "@angular/core";
import { ProjectService } from "../../../../../../core/project/project.service";
import { TaskService } from "../../../../../../core/task/task.service";

@Component({
  selector: "app-kanban-board",
  templateUrl: "./kanban.board.component.html",
})
export class KanbanBoardComponent {
  
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);

  readonly tasksForProject = this.taskService.tasksForProject;

  getNameProject(projectId: string): string {
    const project = this.projectService.projects().find(p => p.id === projectId);
    return project ? project.name : 'Proyecto desconocido';
  }

  getTasksEnCurso(projectId: string) {
    const projectTasks = this.tasksForProject().find(p => p.projectId === projectId);
    return projectTasks ? projectTasks.tasks.filter(t => t.status === 'En curso') : [];
  }

  getTasksEnRevision(projectId: string) {
    const projectTasks = this.tasksForProject().find(p => p.projectId === projectId);
    return projectTasks ? projectTasks.tasks.filter(t => t.status === 'En revision') : [];
  }

  getTasksCompletadas(projectId: string) {
    const projectTasks = this.tasksForProject().find(p => p.projectId === projectId);
    return projectTasks ? projectTasks.tasks.filter(t => t.status === 'Completada') : [];
  }

  getTasksCreadas(projectId: string) {
    const projectTasks = this.tasksForProject().find(p => p.projectId === projectId);
    return projectTasks ? projectTasks.tasks.filter(t => t.status === 'Creada') : [];
  }
}