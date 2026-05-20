import { Component, inject } from "@angular/core";
import { ToastService } from "../../../../../../core/toast/toast.service";
import { FormsModule } from "@angular/forms";
import { FormField, submit } from "@angular/forms/signals";
import { ProjectTeamTableService } from "../../../../../../core/project/project.team.table.service";
import { TeamTableComponent } from "../team-table/team.table.component";
import { ProjectCreateService } from "../../../../../../core/project/project.create.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-new-project-form',
  templateUrl: './form.component.html',
  imports: [FormsModule, FormField, TeamTableComponent]
})
export class NewProjectFormComponent {

  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly projectCreateService = inject(ProjectCreateService);
  private readonly projectTeamTableService = inject(ProjectTeamTableService);
  
  readonly projectForm = this.projectCreateService.validateFormService.getProjectForm();
  readonly projectModel = this.projectCreateService.validateFormService.getProjectModel();
  readonly isCreatePanelOpen = this.projectCreateService.isCreatePanelOpen;
  readonly isLoading = this.projectCreateService.isLoading;
  
  closeCreateProjectPanel() {
    this.projectCreateService.closeCreateProjectPanel();
    this.projectCreateService.validateFormService.resetForm();
    this.projectTeamTableService.setSelectedMembers([]);
  };

  onSubmit(event: Event) {
    event.preventDefault();
    this.projectCreateService.setLoading(true);
    if (this.projectForm().valid()) {
      this.submitForm();
      this.projectCreateService.validateFormService.resetForm();
    } else {
      this.toastService.error("Please fix the errors in the form before submitting.");
      this.projectCreateService.validateFormService.markAllFieldsAsTouched();
      this.projectCreateService.setLoading(false);
    }
  }

  private submitForm():void {
    submit(this.projectForm, {
      action: async () => {
        const projectData = this.projectModel();
        const teamMembers = this.projectTeamTableService.selectedMembers();
        this.projectCreateService.createProject(projectData, teamMembers).subscribe({
          next: () => {
            this.toastService.success('Project created successfully.');
            this.projectCreateService.closeCreateProjectPanel();
            this.projectCreateService.setLoading(false);
            this.router.navigateByUrl("/home");
          },
          error: (err) => {
            console.error('Error creating project:', err.error ?? err);
            this.toastService.error('An error occurred while creating the project. Please try again.');
            this.projectCreateService.setLoading(false);
          }
        });
      }
    });
  }
}