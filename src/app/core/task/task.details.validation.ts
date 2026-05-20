import { Injectable, signal } from "@angular/core";
import { TaskCard } from "./task.interfaces";
import { form, required, validate } from "@angular/forms/signals";

@Injectable({ providedIn: 'root' })
export class TaskDetailsValidationService {

  private readonly initialValues: TaskCard = {
    id: '',
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
  }

  private readonly taskDetailsModel = signal<TaskCard>(this.initialValues);

  private readonly taskDetailsForm = form(this.taskDetailsModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Titulo de tarea es requerido' });
    required(schemaPath.description, { message: 'Descripcion de tarea es requerida' });
    required(schemaPath.type, { message: 'Tipo de tarea es requerido' });
    required(schemaPath.assigneeId, { message: 'Asignar tarea a un miembro del proyecto es requerido' });
    required(schemaPath.dueDate, { message: 'Fecha de vencimiento de tarea es requerida' });
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
    required(schemaPath.priority, { message: 'Prioridad de tarea es requerida' });
    required(schemaPath.effortPoints, { message: 'Puntos de esfuerzo es requerido' });
  });

  formDisable() {
    this.taskDetailsForm().disabled()
  }

  resetForm() {
    this.taskDetailsModel.set({ ...this.initialValues });
    this.taskDetailsForm.title().reset();
    this.taskDetailsForm.description().reset();
    this.taskDetailsForm.type().reset();
    this.taskDetailsForm.assigneeId().reset();
    this.taskDetailsForm.dueDate().reset();
    this.taskDetailsForm.priority().reset();
    this.taskDetailsForm.effortPoints().reset();
  }

  markAllFieldsAsTouched() {
    this.taskDetailsForm.title().markAsTouched();
    this.taskDetailsForm.description().markAsTouched();
    this.taskDetailsForm.type().markAsTouched();
    this.taskDetailsForm.assigneeId().markAsTouched();
    this.taskDetailsForm.dueDate().markAsTouched();
    this.taskDetailsForm.priority().markAsTouched();
    this.taskDetailsForm.effortPoints().markAsTouched();
  }

  setTaskDetailsModel(currentTask: TaskCard) {
    this.taskDetailsModel.set(currentTask);
  }

  getTaskDetailsModel() {
    return this.taskDetailsModel;
  }

  getTaskDetailsForm() {
    return this.taskDetailsForm;
  }
}