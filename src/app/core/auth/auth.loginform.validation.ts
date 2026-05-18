import { Injectable, signal } from '@angular/core';
import { LoginData } from './auth.interfaces';
import {email, form, required } from '@angular/forms/signals';

@Injectable({ providedIn: 'root' })
export class LoginFormValidationService {

  private readonly initialValues: LoginData = {
    email: '',
    password: ''
  };

  private readonly loginModel = signal<LoginData>(this.initialValues);

  private readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'El correo electrónico es requerido'});
    email(schemaPath.email, {message: 'Ingrese una dirección de correo electrónico válida'});
    required(schemaPath.password, {message: 'La contraseña es requerida'});
  });
  
  resetForm() {
    this.loginModel.set({ ...this.initialValues });
    this.loginForm.email().reset();
    this.loginForm.password().reset();
  }

  markAllFieldsAsTouched() {
    this.loginForm.email().markAsTouched();
    this.loginForm.password().markAsTouched();
  }

  getLoginModel() {
    return this.loginModel;
  }

  getLoginForm() {
    return this.loginForm;
  }
}