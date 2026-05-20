import { Injectable, signal } from "@angular/core";
import { ProjectRequest } from "./project.interfaces";
import { form, required, validate } from "@angular/forms/signals";

@Injectable({ providedIn: 'root' })
export class ProjectDetailsValidationService {

  private readonly initialValuesProjectDetails: ProjectRequest = {
    name: '',
    client: '',
    summary: '',
    priority: 'Media',
    health: 'Descubrimiento',
    progress: 0,
    methodology: 'Kanban',
    createdDate: '',
    startDate: '',
    dueDate: '',
    userCreated: { userId: '', role: '' },
    teamMembers: [],
    tags: []
  };

  private readonly projectDetailsModel = signal<ProjectRequest>(this.initialValuesProjectDetails);

  private readonly projectDetailsForm = form(this.projectDetailsModel, (schemaPath) => {
    required(schemaPath.name, {message: 'El nombre de proyecto es requerido'});
    required(schemaPath.client, {message: 'El cliente es requerido'});
    required(schemaPath.summary, {message: 'Resumen del proyecto es requerdio'});
    required(schemaPath.priority, {message: 'La prioridad del proyecto es requerida'});
    required(schemaPath.health, {message: 'El estado del proyecto es requerida'});
    required(schemaPath.methodology, {message: 'La metodologia del proyecto es requerida'});
    required(schemaPath.createdDate, {message: 'Created date is required'});
    required(schemaPath.startDate, {message: 'Una fecha de inicio es requerida'});
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
    required(schemaPath.userCreated.role, {message: 'Asignarse un rol es requerido'});
  });

  formDisable(){
    this.projectDetailsForm().disabled()
  }

  resetFormDetails() {
    this.projectDetailsModel.set(this.initialValuesProjectDetails);
    this.projectDetailsForm.name().reset();
    this.projectDetailsForm.client().reset();
    this.projectDetailsForm.summary().reset();
    this.projectDetailsForm.priority().reset();
    this.projectDetailsForm.health().reset();
    this.projectDetailsForm.methodology().reset();
    this.projectDetailsForm.createdDate().reset();
    this.projectDetailsForm.startDate().reset();
    this.projectDetailsForm.dueDate().reset();
    this.projectDetailsForm.userCreated.role().reset();
  }

  markAllFieldsAsTouchedDetails() {
    this.projectDetailsForm.name().markAsTouched();
    this.projectDetailsForm.client().markAsTouched();
    this.projectDetailsForm.summary().markAsTouched();
    this.projectDetailsForm.priority().markAsTouched();
    this.projectDetailsForm.health().markAsTouched();
    this.projectDetailsForm.methodology().markAsTouched();
    this.projectDetailsForm.createdDate().markAsTouched();
    this.projectDetailsForm.startDate().markAsTouched();
    this.projectDetailsForm.dueDate().markAsTouched();
  }

  getProjectDetailsForm() {
    return this.projectDetailsForm;
  }
  getProjectDetailsModel() {
    return this.projectDetailsModel;
  }

  setProjectDetailsModel(details: ProjectRequest) {
    this.projectDetailsModel.set(details);
  }
}