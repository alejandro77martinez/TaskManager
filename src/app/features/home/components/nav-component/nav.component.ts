import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { SideDrawerService } from '../side-component/side-drawer.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  imports: [RouterLink]
})
export class NavComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly drawer = inject(SideDrawerService);
  readonly email = this.authService.authUser()?.email;
  readonly name = this.authService.authUser()?.name + " " + this.authService.authUser()?.lastName;

  toggleDrawer(trigger: HTMLElement): void {
    this.drawer.toggle(trigger);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
