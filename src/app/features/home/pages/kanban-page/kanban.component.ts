import { Component } from "@angular/core";
import { KanbanBoardComponent } from "./components/kanban-board/kanban.board.component";
import { CreateTaskComponent } from "./components/create-task/create.task.component";
import { TaskDetailsComponent } from "./components/details-task/details.task.component";

@Component({
  selector: "app-kanban",
  templateUrl: "./kanban.component.html",
  imports: [KanbanBoardComponent, CreateTaskComponent, TaskDetailsComponent]
})
export class KanbanComponent {

}