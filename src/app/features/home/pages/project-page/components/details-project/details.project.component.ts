import { Component, inject } from "@angular/core";
import { ToastService } from "../../../../../../core/toast/toast.service";
import { FormsModule } from "@angular/forms";
import { FormField, submit } from "@angular/forms/signals";
import { TeamTableComponent } from "../team-table/team.table.component";
import { ProjectDetailsService } from "../../../../../../core/project/project.details.service";
import { ProjectTeamTableService } from "../../../../../../core/project/project.team.table.service";

@Component({
  selector: 'app-details-project',
  templateUrl: './details.project.component.html',
  imports: [FormsModule, FormField, TeamTableComponent]
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
  readonly isModalOpen = this.projectDetailsService.isModalOpen;

  openModal() { 
    this.projectDetailsService.setIsModalOpen(true); 
  }

  closeModal() { 
    this.projectDetailsService.setIsModalOpen(false); 
  }

  confirmarDeletion(idProject: string) {
    this.projectDetailsService.removeProject(idProject).subscribe({
      next: () => {
        this.toastService.success("Proyecto eliminado existosamente.");
        this.closeDetailsProjectPanel();
      },
      error: (err) => {
        console.error('Error deleting project:', err.error ?? err);
        this.toastService.error("An error occurred while deleting the project. Please try again.");
      }
    });
  }
  
  activateEditMode() {
    this.toastService.info("Ahora es posible editar los datos")
    this.projectDetailsService.setEditMode(true)
    this.projectTeamTableService.setIsEditMode(true)
  }

  getNameCreator(id: string): string {
    return this.projectDetailsService.getNameCreator(id)
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
            this.projectDetailsService.setEditMode(false);
            this.projectTeamTableService.setIsEditMode(false)
          },
          error: (err) => {
            console.error('Error update project:', err.error ?? err);
            this.toastService.error('An error occurred while updated the project. Please try again.');
            this.projectDetailsService.setLoading(false);
          }
        });
      }
    });
  }
}