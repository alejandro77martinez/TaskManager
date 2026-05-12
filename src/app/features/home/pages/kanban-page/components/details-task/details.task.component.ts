import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormField } from "@angular/forms/signals";
import { ToastService } from "../../../../../../core/toast/toast.service";
import { TaskDetailsService } from "../../../../../../core/task/task.details.service";
import { ProjectService } from "../../../../../../core/project/project.service";

@Component({
  selector: "app-task-details",
  templateUrl: "./details.task.component.html",
  imports: [FormsModule, FormField]
})
export class TaskDetailsComponent { 
  
  private readonly toastService = inject(ToastService);
  private readonly taskDetailsService = inject(TaskDetailsService);
  private readonly projectService = inject(ProjectService);

  readonly taskDetailsForm = this.taskDetailsService.taskDetailsValidationService.getTaskDetailsForm();
  readonly taskDetailsModel = this.taskDetailsService.taskDetailsValidationService.getTaskDetailsModel();
  readonly isTaskDetailsPanelOpen = this.taskDetailsService.isDetailsPanelOpen;
  readonly isLoading = this.taskDetailsService.isLoading;

  getNameCurrentProject() {
    return this.projectService.getNameCurrentProject();
  }

  getMembersForCurrentProject() {
    return this.projectService.getMembersOfCurrentProject();
  }

  closeTaskDetailsPanel() {
    this.taskDetailsService.closeDetailsPanel();
  }

  getTaskofProject() {
    return this.taskDetailsService.taskService.getTasksForCurrentProject(this.projectService.currentProjectId());
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.taskDetailsService.setLoading(true);
    if (this.taskDetailsForm().valid()) {
      this.submitForm();
    } else {
      this.toastService.error("Existe un error en los datos proporcionados, corrija e intente nuevamente.");
      this.taskDetailsService.taskDetailsValidationService.markAllFieldsAsTouched();
      this.taskDetailsService.setLoading(false);
    }
  }

  private submitForm() {
    const taskData = {...this.taskDetailsModel(), 
      projectId: this.projectService.currentProjectId(),
      parentTaskId: this.taskDetailsForm.isSubtask().value() ? this.taskDetailsForm.parentTaskId().value() : "",
    };
    this.taskDetailsService.updateTask(taskData).subscribe({
      next: (res) => {
        this.toastService.success(res);
        this.taskDetailsService.closeDetailsPanel();
        this.taskDetailsService.setLoading(false);
      },
      error: (err) => {
        console.error('Error creating task:', err.error ?? err);
        this.toastService.error('A ocurrido un error al crear la tarea. Por favor, intenta de nuevo.');
        this.taskDetailsService.setLoading(false);
      }
    });
  }
}