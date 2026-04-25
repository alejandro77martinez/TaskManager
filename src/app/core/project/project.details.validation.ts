import { Injectable, signal } from "@angular/core";
import { ProjectRequest } from "./project.interfaces";
import { form, required } from "@angular/forms/signals";

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
    required(schemaPath.name, {message: 'Project name is required'});
    required(schemaPath.client, {message: 'Client is required'});
    required(schemaPath.summary, {message: 'Summary is required'});
    required(schemaPath.priority, {message: 'Priority is required'});
    required(schemaPath.health, {message: 'Health is required'});
    required(schemaPath.methodology, {message: 'Methodology is required'});
    required(schemaPath.createdDate, {message: 'Created date is required'});
    required(schemaPath.startDate, {message: 'Start date is required'});
    required(schemaPath.dueDate, {message: 'Due date is required'});
    required(schemaPath.userCreated.role, {message: 'User role is required'});
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