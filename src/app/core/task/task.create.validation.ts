import { Injectable, signal } from "@angular/core";
import { TaskRequest } from "./task.interfaces";
import { form, required } from "@angular/forms/signals";

@Injectable({providedIn: 'root'})
export class TaskCreateValidationService {
  
  private readonly initialValues: TaskRequest = {
    title: '',
    description: '',
    type: 'Funcionalidad',
    status: 'Creada',
    projectId: '',
    assigneeId: '',
    parentTaskId: '',
    dueDate: '',
    createdDate: '',
    startDate: '',
    priority: 'Media',
    effortPoints: 0,
    blocked: false,
    isSubtask: false
  };

  private readonly projectModel = signal<TaskRequest>(this.initialValues);

  private readonly projectForm = form(this.projectModel, (schemaPath) => {
    required(schemaPath.title, {message: 'Titulo de tarea es requerido'});
    required(schemaPath.description, {message: 'Descripcion de tarea es requerida'});
    required(schemaPath.type, {message: 'Tipo de tarea es requerido'});
    required(schemaPath.assigneeId, {message: 'Asignar tarea a un miembro del proyecto es requerido'});
    required(schemaPath.dueDate, {message: 'Fecha de vencimiento de tarea es requerida'});
    required(schemaPath.priority, {message: 'Prioridad de tarea es requerida'});
    required(schemaPath.effortPoints, {message: 'Puntos de esfuerzo es requerido'});
  });

  resetForm() {
    this.projectModel.set({ ...this.initialValues });
    this.projectForm.title().reset();
    this.projectForm.description().reset();
    this.projectForm.type().reset();
    this.projectForm.assigneeId().reset();
    this.projectForm.dueDate().reset();
    this.projectForm.priority().reset();
    this.projectForm.effortPoints().reset();
  }

  markAllFieldsAsTouched() {
    this.projectForm.title().markAsTouched();
    this.projectForm.description().markAsTouched();
    this.projectForm.type().markAsTouched();
    this.projectForm.assigneeId().markAsTouched();
    this.projectForm.dueDate().markAsTouched();
    this.projectForm.priority().markAsTouched();
    this.projectForm.effortPoints().markAsTouched();
  }

  getCreateTaskModel() {
    return this.projectModel;
  }

  getCrerateTaskForm() {
    return this.projectForm;
  }
}