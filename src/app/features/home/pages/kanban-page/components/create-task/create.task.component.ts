import { Component, inject } from "@angular/core";
import { CreateTaskService } from "../../../../../../core/task/task.create.service";
import { ToastService } from "../../../../../../core/toast/toast.service";
import { FormsModule } from "@angular/forms";
import { FormField } from "@angular/forms/signals";
import { ProjectService } from "../../../../../../core/project/project.service";

@Component({
  selector: "app-create-task",
  templateUrl: "./create.task.component.html",
  imports: [FormsModule, FormField]
})
export class CreateTaskComponent {

  private readonly toastService = inject(ToastService);
  private readonly createTaskService = inject(CreateTaskService);
  private readonly projectService = inject(ProjectService);

  readonly createTaskForm = this.createTaskService.taskCreateValidationService.getCrerateTaskForm();
  readonly createTaskModel = this.createTaskService.taskCreateValidationService.getCreateTaskModel();
  readonly isCreateTaskPanelOpen = this.createTaskService.isCreateTaskPanelOpen;
  readonly isLoading = this.createTaskService.isLoading;
 
  getNameCurrentProject() {
    return this.projectService.getNameCurrentProject();
  }

  getMembersForCurrentProject() {
    return this.projectService.getMembersOfCurrentProject();
  }

  closeCreateTaskPanel() {
    this.createTaskService.closeCreateTaskPanel();
  }

  getTaskofProject() {
    return this.createTaskService.getTasksForCurrentProject(this.projectService.currentProjectId());
  }
  
  onSubmit(event: Event) {
    event.preventDefault();
    this.createTaskService.setLoading(true);
    if (this.createTaskForm().valid()) {
      this.submitForm();
    } else {
      this.toastService.error("Please fix the errors in the form before submitting.");
      this.createTaskService.taskCreateValidationService.markAllFieldsAsTouched();
      this.createTaskService.setLoading(false);
    }
  }

  private submitForm() {
    const taskData = {...this.createTaskModel(), 
      projectId: this.projectService.currentProjectId(),
      parentTaskId: this.createTaskForm.isSubtask().value() ? this.createTaskForm.parentTaskId().value() : "",
      createdDate: new Date().toISOString()
    };
    this.createTaskService.createTask(taskData).subscribe({
      next: (res) => {
        this.toastService.success(res);
        this.createTaskService.closeCreateTaskPanel();
        this.createTaskService.setLoading(false);
      },
      error: (err) => {
        console.error('Error creating task:', err.error ?? err);
        this.toastService.error('A ocurrido un error al crear la tarea. Por favor, intenta de nuevo.');
        this.createTaskService.setLoading(false);
      }
    });
  }
}