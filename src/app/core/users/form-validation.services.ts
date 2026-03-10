import { Injectable, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FormValidationService {

  private fb = inject(FormBuilder);

  createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  createRegisterForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      termsAndConditions: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordsMatch('password', 'confirmPassword') });
  }

  // Mensajes de error centralizados
  getErrorMessage(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);
    
    if (!control || !control.errors) return '';

    const errors: Record<string, Record<string, string>> = {
      name: {
        required:    'El nombre es obligatorio.',
        minlength:   'Mínimo 3 caracteres.'
      },
      lastname: {
        required:    'El apellido es obligatorio.',
        minlength:   'Mínimo 3 caracteres.'
      },
      email: {
        required: 'El correo es obligatorio.',
        email:    'Ingresa un correo válido.',
      },
      password: {
        required:     'La contraseña es obligatoria.',
        minlength:    'Mínimo 8 caracteres.'
      },
      confirmPassword: {
        required: 'Confirma tu contraseña.',
        passwordMismatch: 'Las contraseñas no coinciden.'
      },
      termsAndConditions: {
        required: 'Debes aceptar los términos y condiciones.'
      },
    };

    const fieldErrors = errors[controlName];
    if (!fieldErrors) return '';

    const firstError = Object.keys(control.errors ?? {}).find(key => fieldErrors[key]);
    if (!firstError && controlName === 'confirmPassword' && form.hasError('passwordMismatch')) {
      return fieldErrors['passwordMismatch'] ?? 'Las contraseñas no coinciden.';
    }

    return firstError ? fieldErrors[firstError] : '';
  }

  // Marcar todos los campos como tocados (para mostrar errores al enviar)
  markAllAsTouched(form: FormGroup): void {
    Object.values(form.controls).forEach(control => control.markAsTouched());
  }
  
  private passwordsMatch(passwordKey: string, confirmKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey)?.value;
      const confirm  = group.get(confirmKey)?.value;
      return password === confirm ? null : { passwordMismatch: true };
    };
  }
}
