import { Component, inject, signal } from "@angular/core";
import { ToastService } from "../../../../../../core/toast/toast.service";
import { FormsModule } from "@angular/forms";
import { FormField } from "@angular/forms/signals";
import { CommonModule } from "@angular/common";
import { TeamTableComponent } from "../team-table/team.table.component";
import { ProjectDetailsService } from "../../../../../../core/project/project.details.service";

@Component({
  selector: 'app-details-project',
  templateUrl: './details.project.component.html',
  imports: [FormsModule, FormField, CommonModule, TeamTableComponent]
})
export class DetailsProjectComponent {
  
  private readonly toastService = inject(ToastService);
  private readonly projectDetailsService = inject(ProjectDetailsService);

  readonly projectDetailsForm = this.projectDetailsService.detailValidationService.getProjectDetailsForm();
  readonly projectDetailsModel = this.projectDetailsService.detailValidationService.getProjectDetailsModel();
  readonly isDetailsPanelOpen = this.projectDetailsService.isDetailsPanelOpen;
  readonly isLoading = this.projectDetailsService.isLoading; 
  readonly closeDetailsProjectPanel = () => {
    this.projectDetailsService.closeDetailsProjectPanel();
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
    // Implement form submission logic here, e.g., call a service to update project details
    this.projectDetailsService.setLoading(false);
    this.toastService.success("Project details updated successfully.");
  }

}