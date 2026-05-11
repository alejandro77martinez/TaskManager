import { Component, inject } from "@angular/core";
import { ProjectService } from "../../../../../../core/project/project.service";
import { TaskService } from "../../../../../../core/task/task.service";
import { initFlowbite } from "flowbite";
import { TaskCard } from "../../../../../../core/task/task.interfaces";
import { CreateTaskService } from "../../../../../../core/task/task.create.service";

@Component({
  selector: "app-kanban-board",
  templateUrl: "./kanban.board.component.html",
})
export class KanbanBoardComponent {

  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly createTaskService = inject(CreateTaskService);

  readonly tasksForProject = this.taskService.tasksForProject;
  readonly getPriorityClasses = this.taskService.getPriorityClasses;
  readonly showBlockTaksModal = this.taskService.showBlockTaskModal;

  ngAfterViewInit(): void {
    initFlowbite();
  }

  openBlockTaskModal(task: TaskCard) {
    this.taskService.setTaskToBlock(task);
    this.taskService.setShowBlockTaskModal(true);
  }

  closeBlockTaskModal() {
    this.taskService.setShowBlockTaskModal(false);
  }

  openCreateTaskPanel(idProject: string) {
    this.projectService.setCurrentProjectId(idProject);
    this.createTaskService.openCreateTaskPanel();
  }

  updateTaksBlockUnblock(projectId: string, taskId: string, blocked: boolean): void {
    this.taskService.updateTaskBlockUnblock(projectId, taskId, blocked);
  }

  getTaskToBlock(): TaskCard {
    return this.taskService.taskToBlock();
  }

  updateTaskStatus(projectId: string, taskId: string, newState: string) {
    this.taskService.updateTaskStatus(projectId, taskId, newState);
  }

  updateTaskBlockUnblock(projectId: string, taskId: string, blocked: boolean) {
    this.taskService.updateTaskBlockUnblock(projectId, taskId, blocked);
  }

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

  formatDate(dateString: string): string {
    return this.projectService.formatDate(dateString);
  }

  getNameMember(member: string): string {
    return this.projectService.getNameMember(member);
  }

  getParentTaskTitle(idParentTask: string, idproject: string): string {
    const parentTask = this.tasksForProject().find(p => p.projectId === idproject)?.tasks.find(t => t.id === idParentTask);
    return parentTask ? parentTask.title : '';
  }
}