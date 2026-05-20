import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { RegisterFormValidationService } from '../../../../core/users/user.registerform.validation';
import { ToastService } from '../../../../core/toast/toast.service';
import { submit, FormField } from '@angular/forms/signals';
import { UserRegisterFormData } from '../../../../core/users/user.interfaces';
import { UserService } from '../../../../core/users/user.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink, FooterComponent, FormField],
  templateUrl: './register-page.html',
})
export class RegisterPage {

  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly formValidationService = inject(RegisterFormValidationService);

  readonly registerModel = this.formValidationService.getRegisterModel();
  readonly registerForm = this.formValidationService.getRegisterForm();

  emailTaken      = signal<boolean>(false);
  isLoading       = signal<boolean>(false);
  showPassword = false;
  showPassword2 = false;

  ngOnInit(): void {
    this.formValidationService.resetForm();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading.set(true);
    this.emailTaken.set(false);
    if (this.registerForm().invalid()) {
      this.isLoading.set(false);
      this.formValidationService.markAllFieldsAsTouched()
      this.toastService.error('Por favor, corrija los errores del formulario antes de registrarse');
      return;
    }
    this.userService.emailExist(this.registerModel().email).subscribe({
      next: (res) => {
        if (res) {
          this.isLoading.set(false);
          this.emailTaken.set(true);
          this.toastService.error('El correo ya esta registrado.');
          return;
        }
        this.submitForm();
      },
      error: (err) => { 
        this.isLoading.set(false);
        this.toastService.error('Ocurrio un error al registrar revisa tus datos.');
      }
    })
    
  }

  clearEmailTakenError(): void {
    if (this.emailTaken()) {
      this.emailTaken.set(false);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordVisibility2(): void {
    this.showPassword2 = !this.showPassword2;
  }

  private submitForm(): void {
    submit(this.registerForm, {
      action: async () => {
        const registrationData: UserRegisterFormData = this.registerModel();
        this.userService.sendUserRegister(registrationData).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.toastService.success('Usuario registrado existosamente!!');
            this.router.navigateByUrl("/login");
          },
          error: (err) => { 
            this.isLoading.set(false);
            this.toastService.error('Ocurrio un error al registrar revisa tus datos.');
          }
        })
      },
    });
  }
}
