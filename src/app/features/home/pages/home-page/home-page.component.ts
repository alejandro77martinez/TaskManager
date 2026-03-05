import { AfterViewInit, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { initFlowbite } from 'flowbite';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  imports: [FooterComponent, RouterLink, RouterOutlet, RouterLinkActive],
})
export class HomePageComponent implements AfterViewInit {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngAfterViewInit(): void {
    // Re-initialize Flowbite after this route renders its template.
    initFlowbite();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
