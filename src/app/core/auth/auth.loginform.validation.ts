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
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
    required(schemaPath.password, {message: 'Password is required'});
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