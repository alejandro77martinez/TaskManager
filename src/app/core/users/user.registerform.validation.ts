import { Injectable, signal } from '@angular/core';
import { UserRegisterFormData } from './user.interfaces';
import { email, form, minLength, required, validate } from '@angular/forms/signals';


@Injectable({ providedIn: 'root' })
export class RegisterFormValidationService {
  
  private readonly initialValues: UserRegisterFormData = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAndConditions: false
  };

  private readonly registerModel = signal<UserRegisterFormData>(this.initialValues);

  private readonly registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.name, {message: 'Nombre es requerido'});
    required(schemaPath.lastname, {message: 'Apellido es requerido'});
    required(schemaPath.email, {message: 'El correo electronico es requerido'});
    email(schemaPath.email, {message: 'Ingrese una dirección de email válida'});
    required(schemaPath.password, {message: 'Contraseña es requerida'});
    minLength(schemaPath.password, 8, {message: 'La contraseña debe tener al menos 8 caracteres'});
    required(schemaPath.confirmPassword, {message: 'Confirmar contraseña es requerido'});
    validate(schemaPath.confirmPassword, ({value, valueOf}) => {
      const confirmPassword = value();
      const password = valueOf(schemaPath.password);
      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Las contraseñas no coinciden',
        };
      }
      return null;
    });
    required(schemaPath.termsAndConditions, {message: 'Debe aceptar los términos y condiciones'});
  });

  resetForm() {
    this.registerModel.set({ ...this.initialValues });
    this.registerForm.name().reset();
    this.registerForm.lastname().reset();
    this.registerForm.email().reset();
    this.registerForm.password().reset();
    this.registerForm.confirmPassword().reset();
    this.registerForm.termsAndConditions().reset();
  }

  markAllFieldsAsTouched() {
    this.registerForm.name().markAsTouched();
    this.registerForm.lastname().markAsTouched();
    this.registerForm.email().markAsTouched();
    this.registerForm.password().markAsTouched();
    this.registerForm.confirmPassword().markAsTouched();
    this.registerForm.termsAndConditions().markAsTouched();
  }

  getRegisterModel() {
    return this.registerModel;
  }

  getRegisterForm() {
    return this.registerForm;
  }
}

