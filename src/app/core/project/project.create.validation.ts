import { Injectable, signal } from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';
import { NewProjectDraft } from './project.interfaces';

@Injectable({ providedIn: 'root' })
export class CreateProjectFormValidationService {

  private readonly initialValues: NewProjectDraft = {
    name: '',
    client: '',
    role: '',
    summary: '',
    priority: 'Media',
    methodology: 'Kanban',
    dueDate: '',
    tags: ''
  };

  private readonly projectModel = signal<NewProjectDraft>(this.initialValues);

  private readonly projectForm = form(this.projectModel, (schemaPath) => {
    required(schemaPath.name, {message: 'El nombre de proyecto es requerido'});
    required(schemaPath.client, {message: 'El cliente es requerido'});
    required(schemaPath.role, {message: 'Asignarse un rol es requerido'});
    required(schemaPath.summary, {message: 'Resumen del proyecto es requerdio'});
    required(schemaPath.dueDate, {message: 'Un fecha de entrega es requerida'});
    validate(schemaPath.dueDate, (ctx) => {
      const value = ctx.value();
      if (!value) {
        return [];
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return [{
          kind: 'datePast',
          message: 'La fecha no puede ser anterior al día de hoy'
        }];
      }
      return [];
    });
  });

  resetForm() {
    this.projectModel.set({ ...this.initialValues });
    this.projectForm.name().reset();
    this.projectForm.client().reset();
    this.projectForm.role().reset();
    this.projectForm.summary().reset();
    this.projectForm.priority().reset();
    this.projectForm.methodology().reset();
    this.projectForm.dueDate().reset();
    this.projectForm.tags().reset();
  }

  markAllFieldsAsTouched() {
    this.projectForm.name().markAsTouched();
    this.projectForm.client().markAsTouched();
    this.projectForm.role().markAsTouched();
    this.projectForm.summary().markAsTouched();
    this.projectForm.priority().markAsTouched();
    this.projectForm.methodology().markAsTouched();
    this.projectForm.dueDate().markAsTouched();
    this.projectForm.tags().markAsTouched();
  }

  getProjectModel() {
    return this.projectModel;
  }
  getProjectForm() {
    return this.projectForm;
  }

}