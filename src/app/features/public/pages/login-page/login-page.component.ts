import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink, FooterComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  email = '';
  password = '';

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.toastService.info('You are already signed in.');
      this.router.navigateByUrl('/home');
    }
  }

  loginWithCredentials(): void {
    const ok = this.authService.loginWithCredentials(this.email, this.password);

    if (!ok) {
      this.toastService.error('Enter a valid email and password.');
      return;
    }

    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/home';
    this.toastService.success('Welcome back.');
    this.router.navigateByUrl(redirect);
  }

  loginWithGoogle(): void {
    this.authService.startGoogleLogin();
  }
}
