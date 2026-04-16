import { Component, inject } from "@angular/core";
import { ProjectTeamTableService } from "../../../../../../core/project/project.team.table.service";
import { UserSearchEmailResult } from "../../../../../../core/users/user.interfaces";

@Component({
  selector: 'app-team-table',
  templateUrl: './team.table.component.html',
})
export class TeamTableComponent {

  private readonly projectTeamTableService = inject(ProjectTeamTableService);

  readonly selectedMembers = this.projectTeamTableService.selectedMembers;
  readonly teamMembersInput = this.projectTeamTableService.teamMembersInput;
  readonly emailSuggestions = this.projectTeamTableService.emailSuggestions;
  readonly showSuggestions = this.projectTeamTableService.showSuggestions;

  removeTeamMember(memberId: string): void {
    this.projectTeamTableService.removeTeamMember(memberId);
  }

  onEmailInput(event: Event): void {
    this.projectTeamTableService.onEmailInput(event);
  }

  updateMemberRole(event: Event): void {
    this.projectTeamTableService.updateMemberRole(event);
  }

  addTeamMember(): void {
    this.projectTeamTableService.addTeamMember();
  }

  closeSuggestions(): void {
    this.projectTeamTableService.closeSuggestions();
  }

  selectEmailSuggestion(suggestion: UserSearchEmailResult): void {
    this.projectTeamTableService.selectEmailSuggestion(suggestion);
  }
}