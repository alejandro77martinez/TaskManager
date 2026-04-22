import { Component, inject, signal } from "@angular/core";
import { ToastService } from "../../../../../../core/toast/toast.service";
import { FormsModule } from "@angular/forms";
import { FormField, submit } from "@angular/forms/signals";
import { CommonModule } from "@angular/common";
import { TeamTableComponent } from "../team-table/team.table.component";
import { ProjectDetailsService } from "../../../../../../core/project/project.details.service";
import { ProjectTeamTableService } from "../../../../../../core/project/project.team.table.service";

@Component({
  selector: 'app-details-project',
  templateUrl: './details.project.component.html',
  imports: [FormsModule, FormField, CommonModule, TeamTableComponent]
})
export class DetailsProjectComponent {
  
  private readonly toastService = inject(ToastService);
  private readonly projectDetailsService = inject(ProjectDetailsService);
  private readonly projectTeamTableService = inject(ProjectTeamTableService)

  readonly projectDetailsForm = this.projectDetailsService.detailValidationService.getProjectDetailsForm();
  readonly projectDetailsModel = this.projectDetailsService.detailValidationService.getProjectDetailsModel();
  readonly isEditing = this.projectDetailsService.isEditMode;
  readonly isDetailsPanelOpen = this.projectDetailsService.isDetailsPanelOpen;
  readonly isLoading = this.projectDetailsService.isLoading;
  readonly tagsInput = this.projectDetailsService.tagsInput;
  
  activateEditMode() {
    this.projectDetailsService.setEditMode(true)
    this.projectTeamTableService.setIsEditMode(true)
  }

  tagsInputSet(valInput: string) {
    this.projectDetailsService.tagsInputSet(valInput);
  }

  closeDetailsProjectPanel() {
    this.projectDetailsService.closeDetailsProjectPanel();
    this.projectDetailsService.setEditMode(false)
    this.projectTeamTableService.setIsEditMode(false)
  };  

  onSubmit(event: Event) {
    event.preventDefault();
    this.projectDetailsService.setLoading(true);
    if (this.projectDetailsForm().valid()) {
      this.submitForm();
    } else {
      this.toastService.error("Please fix the errors in the form before submitting.");
      this.projectDetailsService.detailValidationService.markAllFieldsAsTouchedDetails();
      this.projectDetailsService.setLoading(false);
    }
  }

  private submitForm(): void {
    submit(this.projectDetailsForm, {
      action: async () => {
        const projectData = this.projectDetailsModel();
        const teamMembers = this.projectTeamTableService.selectedMembers();
        this.projectDetailsService.updateProject(projectData, teamMembers).subscribe({
          next: () => {
            this.toastService.success('Project update successfully.');
            this.projectDetailsService.closeDetailsProjectPanel();
            this.projectDetailsService.setLoading(false);
            this.projectDetailsService.setEditMode(false)
          },
          error: (err) => {
            console.error('Error creating project:', err.error ?? err);
            this.toastService.error('An error occurred while creating the project. Please try again.');
            this.projectDetailsService.setLoading(false);
          }
        });
      }
    });
  }
}