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
    required(schemaPath.name, {message: 'Name is required'});
    required(schemaPath.lastname, {message: 'Lastname is required'});
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
    required(schemaPath.password, {message: 'Password is required'});
    minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters long'});
    required(schemaPath.confirmPassword, {message: 'Confirm Password is required'});
    validate(schemaPath.confirmPassword, ({value, valueOf}) => {
      const confirmPassword = value();
      const password = valueOf(schemaPath.password);
      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
    required(schemaPath.termsAndConditions, {message: 'You must accept the terms and conditions'});
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

  getRegisterModel() {
    return this.registerModel;
  }

  getRegisterForm() {
    return this.registerForm;
  }
}

