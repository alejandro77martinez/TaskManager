import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
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
    required(schemaPath.name, {message: 'Project name is required'});
    required(schemaPath.client, {message: 'Client is required'});
    required(schemaPath.role, {message: 'Role is required'});
    required(schemaPath.summary, {message: 'Summary is required'});
    required(schemaPath.dueDate, {message: 'Due date is required'});
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