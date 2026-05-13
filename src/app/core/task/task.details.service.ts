import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { TaskDetailsValidationService } from "./task.details.validation";
import { environment } from "../../../environments/environment";
import { TaskCard } from "./task.interfaces";
import { catchError, map, Observable, throwError } from "rxjs";
import { TaskService } from "./task.service";

@Injectable({ providedIn: 'root' })
export class TaskDetailsService {

  readonly taskDetailsValidationService = inject(TaskDetailsValidationService)
  readonly taskService = inject(TaskService)

  private readonly isDetailsPanelOpenSignal = signal(false);
  private readonly isLoadingSignal = signal(false);
  private readonly isEditModeSignal = signal(false);
  private readonly isModalOpenSignal = signal(false);
  private readonly apiBase = environment.authApiBaseUrl;

  readonly isDetailsPanelOpen = this.isDetailsPanelOpenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isEditMode = this.isEditModeSignal.asReadonly();
  readonly isModalOpen = this.isModalOpenSignal.asReadonly();

  constructor(private http: HttpClient) { }

  openDetailsPanel(task: TaskCard) {
    const restTask = {
      ...task,
      dueDate: this.toInputDate(task.dueDate),
      isSubtask: task.parentTaskId !== "" ? true : false
    }
    this.taskDetailsValidationService.setTaskDetailsModel(restTask)
    this.isDetailsPanelOpenSignal.set(true)
  }

  closeDetailsPanel() {
    this.isDetailsPanelOpenSignal.set(false)
  }

  setLoading(state: boolean) {
    this.isLoadingSignal.set(state)
  }

  setEditMode(state: boolean) {
    this.isEditModeSignal.set(state)
  }

  setModalOpen(state: boolean) {
    this.isModalOpenSignal.set(state)
  }

  updateTask(task: TaskCard): Observable<string> {
    const task2 = { ...task,
      parentTaskId: task.isSubtask ? task.parentTaskId : "",
    };
    const { isSubtask, id, ...rest} = task2;
    console.log("Objeto enviado: ", rest)
    return this.http.put<TaskCard>(this.apiBase + '/api/v1/task/' + task.id, rest, {
      withCredentials: true
    })
      .pipe(
        map((res) => {
          this.taskService.updateTask(res.projectId,res);
          return "Tarea actualizada correctamente";
        }),
        catchError(this.handleError)
      );
  }

  deletedTask(projectId: string, taskId: string): Observable<string> {
    return this.http.delete(this.apiBase + '/api/v1/task/' + taskId, {
      withCredentials: true
    })
      .pipe(
        map((res) => {
          this.taskService.deleteTaks(projectId, taskId)
          return "Tarea eliminada correctamente";
        }),
        catchError(this.handleError)
      );
  }

   private toInputDate(value: string): string {
    // Si viene como ISO: "2024-03-15T00:00:00.000Z"
    return new Date(value).toISOString().split('T')[0];
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status} - Mensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}