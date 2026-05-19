import { Component } from "@angular/core";
import { ListOfMemebersComponent } from "./components/list-of-members/list.of.members.component";
import { ChatComponent } from "./components/chat/chat.component";

@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  imports: [ListOfMemebersComponent, ChatComponent]
})
export class TeamComponent {
  
}