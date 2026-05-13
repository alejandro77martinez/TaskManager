import { Injectable, signal } from "@angular/core";
import { TaskRequest } from "./task.interfaces";
import { form, required, validate } from "@angular/forms/signals";

@Injectable({ providedIn: 'root' })
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

  private readonly taskModel = signal<TaskRequest>(this.initialValues);

  private readonly taskForm = form(this.taskModel, (schemaPath) => {
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
      console.log("Fecha a validar: ",value)
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

  resetForm() {
    this.taskModel.set({ ...this.initialValues });
    this.taskForm.title().reset();
    this.taskForm.description().reset();
    this.taskForm.type().reset();
    this.taskForm.assigneeId().reset();
    this.taskForm.dueDate().reset();
    this.taskForm.priority().reset();
    this.taskForm.effortPoints().reset();
  }

  markAllFieldsAsTouched() {
    this.taskForm.title().markAsTouched();
    this.taskForm.description().markAsTouched();
    this.taskForm.type().markAsTouched();
    this.taskForm.assigneeId().markAsTouched();
    this.taskForm.dueDate().markAsTouched();
    this.taskForm.priority().markAsTouched();
    this.taskForm.effortPoints().markAsTouched();
  }

  getCreateTaskModel() {
    return this.taskModel;
  }

  getCreateTaskForm() {
    return this.taskForm;
  }

}