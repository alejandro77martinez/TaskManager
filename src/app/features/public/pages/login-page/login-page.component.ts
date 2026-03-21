import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoginFormValidationService } from '../../../../core/auth/auth.loginform.validation';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { ToastService } from '../../../../core/toast/toast.service';
import { FormField, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink, FooterComponent, FormField],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly loginFormValidationService = inject(LoginFormValidationService);

  readonly loginModel = this.loginFormValidationService.getLoginModel();
  readonly loginForm = this.loginFormValidationService.getLoginForm();
  
  showPassword = false;

  ngOnInit(): void {
    this.loginFormValidationService.resetForm();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().invalid()) {
      this.toastService.error('Please fix the errors in the form before submitting.');
      return;
    }
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        this.authService.login(credentials)
          .subscribe({
            next: () => { 
              const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/home';
              this.toastService.success('Welcome back.');
              this.router.navigateByUrl(redirect);
            },
            error: (err) => {     
              console.log("Error: ", err)                      // error
              this.toastService.error('Enter a valid email and password.');
            }}
          )
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
