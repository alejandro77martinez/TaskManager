import { Component } from "@angular/core";
import { KanbanBoardComponent } from "./components/kanban-board/kanban.board.component";

@Component({
  selector: "app-kanban",
  templateUrl: "./kanban.component.html",
  imports: [KanbanBoardComponent]
})
export class KanbanComponent {}