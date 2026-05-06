import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoginFormValidationService } from '../../../../core/auth/auth.loginform.validation';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { ToastService } from '../../../../core/toast/toast.service';
import { FormField, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink, FooterComponent, FormField],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly loginFormValidationService = inject(LoginFormValidationService);

  readonly loginModel = this.loginFormValidationService.getLoginModel();
  readonly loginForm = this.loginFormValidationService.getLoginForm();
  
  isLoading       = signal<boolean>(false);
  showPassword = false;

  ngOnInit(): void {
    this.loginFormValidationService.resetForm();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    if (this.loginForm().invalid()) {
      this.toastService.error('Por favor, corrija los errores del formulario antes de iniciar sesión');
      this.loginFormValidationService.markAllFieldsAsTouched();
      this.isLoading.set(false);
      return;
    }
    this.submitForm();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private submitForm():void {
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        this.authService.login(credentials)
          .subscribe({
            next: (user) => { 
              this.toastService.success('Bienvenid@ de vuelta ' + user.name + '!');
              this.isLoading.set(false);
              this.router.navigateByUrl("/home");
            },
            error: (err) => { 
              this.isLoading.set(false);
              this.toastService.error('Introduce un correo electrónico y una contraseña válidos');
            }}
          )
      },
    });
  }
}
