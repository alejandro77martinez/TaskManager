import { Component, inject } from "@angular/core";
import { TeamService } from "../../../../../../core/team/team.service";
import { UserSearchEmailResult } from "../../../../../../core/users/user.interfaces";

@Component({
  selector: "app-list-of-members",
  templateUrl: "./list.of.members.component.html"
})
export class ListOfMemebersComponent {

  private readonly teamservice = inject(TeamService)

  getRoster(): UserSearchEmailResult[] {
    return this.teamservice.getRoster()
  }

  getNamesProjects(memberId: string): string[] {
    return this.teamservice.getNamesProjects(memberId)
  }
}