import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { FormsModule, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormValidationService } from '../../../../core/users/form-validation.services';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink, FooterComponent, ReactiveFormsModule],
  templateUrl: './register-page.html',
})
export class RegisterPage {

  private validationService = inject(FormValidationService);
  registerForm: FormGroup = this.validationService.createRegisterForm();

  getErrorMessage(controlName: string): string {
    return this.validationService.getErrorMessage(controlName, this.registerForm);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      // Aquí iría la lógica para enviar los datos al backend
      console.log('Form submitted', this.registerForm.value);
    } else {
      // Marcar todos los campos como tocados para mostrar los errores
      this.registerForm.markAllAsTouched();
    }
  }
}
