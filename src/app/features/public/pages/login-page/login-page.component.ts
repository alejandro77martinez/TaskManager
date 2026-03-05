import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  error = signal<string | null>(null);

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (token && email) {
      this.authService.completeGoogleCallback(token, email);
      this.router.navigateByUrl('/home');
    }
  }

  loginWithCredentials(): void {
    const ok = this.authService.loginWithCredentials(this.email, this.password);

    if (!ok) {
      this.error.set('Ingresa email y contraseña válidos.');
      return;
    }

    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/home';
    this.router.navigateByUrl(redirect);
  }

  loginWithGoogle(): void {
    this.authService.startGoogleLogin();
  }
}
