import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { TaskCreateValidationService } from "./task.create.validation";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { TaskService } from "./task.service";
import { TaskCard, TaskRequest } from "./task.interfaces";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CreateTaskService {

  readonly taskCreateValidationService = inject(TaskCreateValidationService);
  readonly taskService = inject(TaskService);

  private readonly isCreateTaskPanelOpenSignal = signal<boolean>(false);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly apiBase = environment.authApiBaseUrl;

  readonly isCreateTaskPanelOpen = this.isCreateTaskPanelOpenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor(private http: HttpClient) { }

  setLoading(loading: boolean) {
    this.isLoadingSignal.set(loading);
  }

  openCreateTaskPanel(): void {
    this.taskCreateValidationService.resetForm();
    this.isCreateTaskPanelOpenSignal.set(true);
  }

  closeCreateTaskPanel(): void {
    this.isCreateTaskPanelOpenSignal.set(false);
  }

  createTask(taskData: TaskRequest): Observable<string> {
    const { isSubtask , ...rest} = taskData;
    return this.http.post<TaskCard>(this.apiBase + "/api/v1/task/", rest, {
      withCredentials: true
    }).pipe(
      map((res) => {
        this.taskService.addTask(taskData.projectId, res);
        return "Task creada exitosamente";
      }),
      catchError(this.handleError)
    );
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