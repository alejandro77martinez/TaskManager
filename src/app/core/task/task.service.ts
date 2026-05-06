import { Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { TaskCard, TaskForProject } from "./task.interfaces";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly apiBaseUrl = environment.authApiBaseUrl;
  private readonly tasksForProjectSiganl = signal<TaskForProject[]>([]);

  readonly tasksForProject = this.tasksForProjectSiganl.asReadonly();

  constructor(private http: HttpClient) {}
  
  getTaskByProjectsIds(ids: string[]): void {
    this.http.post<TaskCard[]>(this.apiBaseUrl + '/api/v1/task/byprojects', ids).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (tasks) => {
        const tasksByProject: TaskForProject[] = ids.map(projectId => ({
          projectId,
          tasks: tasks.filter(task => task.projectId === projectId)
        }));
        this.tasksForProjectSiganl.set(tasksByProject);
      },
      error: (err) => {
        console.error('Error fetching tasks:', err)
      },
    });
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