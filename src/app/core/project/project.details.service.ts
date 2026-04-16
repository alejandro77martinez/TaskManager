import { inject, Injectable, signal } from "@angular/core";
import { ProjectDetailsValidationService } from "./project.details.validation";
import { ProjectRequest } from "./project.interfaces";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import { environment } from "../../../environments/environment.prod";

@Injectable({ providedIn: 'root' })
export class ProjectDetailsService {

  readonly detailValidationService = inject(ProjectDetailsValidationService);

  private readonly isDetailsPanelOpenSignal = signal(false);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly isEditModeSignal = signal(false);
  private readonly apiBase = environment.authApiBaseUrl;

  readonly isDetailsPanelOpen = this.isDetailsPanelOpenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isEditMode = this.isEditModeSignal.asReadonly();

  constructor(private http: HttpClient) { }

  setEditMode(editMode: boolean) {
    this.isEditModeSignal.set(editMode);
  }
  setLoading(loading: boolean) {
    this.isLoadingSignal.set(loading);
  }
  openDetailsProjectPanel(): void {
    this.isDetailsPanelOpenSignal.set(true);
  }
  closeDetailsProjectPanel(): void {
    this.isDetailsPanelOpenSignal.set(false);
  }

  getProjectById(projectId: string): void {
    this.http.get<ProjectRequest>(this.apiBase + '/api/v1/project/' + projectId, {},).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (project) => {
        this.detailValidationService.setProjectDetailsModel(project);
        this.setLoading(true);
      },
      error: (err) => {
        this.setLoading(true);
        console.error('Error fetching project details:', err);
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