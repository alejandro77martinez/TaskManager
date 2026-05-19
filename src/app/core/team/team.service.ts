import { inject, Injectable } from "@angular/core";
import { ProjectService } from "../project/project.service";
import { UserSearchEmailResult } from "../users/user.interfaces";

@Injectable({ providedIn: 'root' })
export class TeamService {

  private readonly projectService = inject(ProjectService)

  getRoster(): UserSearchEmailResult[] {
    return this.projectService.members()
  }

  getNamesProjects(memberId: string): string[] {
    return this.projectService.projects()
    .filter(p => p.creator === memberId || p.teamMembers.includes(memberId))
    .map(p => p.name);
  }
}