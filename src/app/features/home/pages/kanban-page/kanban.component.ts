import { Component } from "@angular/core";
import { KanbanBoardComponent } from "./components/kanban-board/kanban.board.component";
import { CreateTaskComponent } from "./components/create-task/create.task.component";

@Component({
  selector: "app-kanban",
  templateUrl: "./kanban.component.html",
  imports: [KanbanBoardComponent, CreateTaskComponent]
})
export class KanbanComponent {

}