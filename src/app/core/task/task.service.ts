import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { TaskCard, TaskForProject, TaskPriority, TaskStatus } from "./task.interfaces";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import { ToastService } from "../toast/toast.service";

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly toastService = inject(ToastService);
  private readonly apiBaseUrl = environment.authApiBaseUrl;
  private readonly tasksForProjectSiganl = signal<TaskForProject[]>([]);
  private readonly taskToBlockSignal = signal<TaskCard>({} as TaskCard);
  private readonly showBlockTaskModalSignal = signal<boolean>(false);

  readonly tasksForProject = this.tasksForProjectSiganl.asReadonly();
  readonly showBlockTaskModal = this.showBlockTaskModalSignal.asReadonly();
  readonly taskToBlock = this.taskToBlockSignal.asReadonly();

  constructor(private http: HttpClient) { }

  setShowBlockTaskModal(show: boolean) {
    this.showBlockTaskModalSignal.set(show);
  }

  addTask(projectId: string, newTask: TaskCard): void {
    const updateTask: TaskForProject[] = this.tasksForProjectSiganl().map(p => {
      return p.projectId === projectId ? {...p, tasks: [...p.tasks, newTask]} : p
    })
    this.tasksForProjectSiganl.set(updateTask)
  }

  deleteTask(projectId: string, taskId: string) {
    const updateTask: TaskForProject[] = this.tasksForProjectSiganl().map(p => {
      return p.projectId === projectId ? {...p, tasks: p.tasks.filter(t => t.id !== taskId)} : p
    })
    this.tasksForProjectSiganl.set(updateTask)
  }

  updateTask(projectId: string, task: TaskCard) {
    const updateTask: TaskForProject[] = this.tasksForProjectSiganl().map(p => {
      return p.projectId === projectId ? {...p, tasks: p.tasks.map(t => t.id === task.id ? task : t)} : p
    })
    this.tasksForProjectSiganl.set(updateTask)
  }

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

  setTaskToBlock(task: TaskCard): void {
    this.taskToBlockSignal.set(task);
  }

  updateTaskStatus(projectId: string, taskId: string, newState: string): void {
    this.http.put<TaskCard>(this.apiBaseUrl + `/api/v1/task/${taskId}/status/${newState}`, {}).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: () => {
        //update task in signal
        const currentTasksForProject = this.tasksForProjectSiganl();
        const updatedTasksForProject = currentTasksForProject.map(taskForProject => {
          if (taskForProject.projectId === projectId) {
            return {
              ...taskForProject,
              tasks: taskForProject.tasks.map(task =>
                task.id === taskId ? { ...task, status: newState as TaskCard['status'] } : task
              )
            };
          }
          return taskForProject;
        });
        this.tasksForProjectSiganl.set(updatedTasksForProject);
        if (newState === 'Completada') {
          this.toastService.success('Tarea marcada como completada');
        } else {
          this.toastService.info(`Tarea actualizada a estado: ${newState}`);
        }
      },
      error: (err) => {
        console.error('Error updating task status:', err);
      },
    });
  }

  updateTaskBlockUnblock(projectId: string, taskId: string, blocked: boolean): void {
    this.http.put(this.apiBaseUrl + `/api/v1/task/${taskId}/blocked/${!blocked}`, {}).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: () => {
        //update task in signal
        const currentTasksForProject = this.tasksForProjectSiganl();
        const updatedTasksForProject = currentTasksForProject.map(taskForProject => {
          if (taskForProject.projectId === projectId) {
            return {
              ...taskForProject,
              tasks: taskForProject.tasks.map(task =>
                task.id === taskId ? { ...task, blocked: !blocked } : task
              )
            };
          }
          return taskForProject;
        });
        this.tasksForProjectSiganl.set(updatedTasksForProject);
        this.setShowBlockTaskModal(false);
        const action = blocked ? 'desbloqueada' : 'bloqueada';
        this.toastService.show('info', `Tarea ${action} exitosamente`);
      },
      error: (err) => {
        console.error('Error updating task blocked status:', err);
      },
    });
  }

  getTasksForCurrentProject(projectId: string) {
    return this.tasksForProject().find(taskForProject => taskForProject.projectId === projectId)?.tasks || [];
  }

  getPriorityClasses(priority: TaskPriority): string {
    switch (priority) {
      case 'Alta':
        return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200';
      case 'Media':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  }

  getTaskStatusClasses(status: TaskStatus): string {
    switch (status) {
      case 'En curso':
        return 'bg-primary-100 text-primary-700 ring-1 ring-primary-200';
      case 'Creada':
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
      case 'En revision':
        return 'bg-violet-100 text-violet-700 ring-1 ring-violet-200';
      default:
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
    }
  }

  getAllTask(): TaskCard[] {
    const AllTask = this.tasksForProject().flatMap(p => p.tasks);
    return AllTask
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