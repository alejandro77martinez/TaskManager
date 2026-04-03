import { Component, HostListener, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { SideDrawerService } from "./side-drawer.service";

@Component({
  selector: 'app-side',
  templateUrl: './side.component.html',
  imports: [RouterLink, RouterLinkActive]
})
export class SideComponent {
  readonly drawer = inject(SideDrawerService);

  closeDrawer(): void {
    this.drawer.close();
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.drawer.close();
  }
}
