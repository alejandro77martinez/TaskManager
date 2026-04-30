import { Component, inject } from "@angular/core";
import { ProjectService } from "../../../../../../core/project/project.service";

@Component({
  selector: "app-kanban-board",
  templateUrl: "./kanban.board.component.html",
})
export class KanbanBoardComponent {
  
  private readonly projectService = inject(ProjectService);

  readonly projects = this.projectService.projects;
}