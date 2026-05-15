import { inject, Injectable, signal } from "@angular/core";
import { ProjectDetailsValidationService } from "./project.details.validation";
import { ProjectRequest } from "./project.interfaces";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { ProjectTeamTableService } from "./project.team.table.service";
import { UserRole } from "../users/user.interfaces";
import { ProjectService } from "./project.service";

@Injectable({ providedIn: 'root' })
export class ProjectDetailsService {

  readonly detailValidationService = inject(ProjectDetailsValidationService);
  private readonly teamTableService = inject(ProjectTeamTableService)
  private readonly projectService = inject(ProjectService)

  private readonly isDetailsPanelOpenSignal = signal(false);
  private readonly isLoadingSignal = signal(false);
  private readonly isEditModeSignal = signal(false);
  private readonly tagsInputSignal = signal('');
  private readonly isModalOpenSignal = signal(false);
  private readonly apiBase = environment.authApiBaseUrl;

  readonly tagsInput = this.tagsInputSignal.asReadonly();
  readonly isDetailsPanelOpen = this.isDetailsPanelOpenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isEditMode = this.isEditModeSignal.asReadonly();
  readonly isModalOpen = this.isModalOpenSignal.asReadonly();

  constructor(private http: HttpClient) { }

  getNameCreator(id: string): string {
    return this.projectService.getNameMember(id)
  }
  setEditMode(editMode: boolean) {
    this.isEditModeSignal.set(editMode);
  }
  setLoading(loading: boolean) {
    this.isLoadingSignal.set(loading);
  }
  setIsModalOpen(isOpen: boolean) {
    this.isModalOpenSignal.set(isOpen);
  }
  openDetailsProjectPanel(projectId: string): void {
    this.getProjectById(projectId);
    this.isDetailsPanelOpenSignal.set(true);
    this.teamTableService.setIsEditMode(false)
    this.teamTableService.cleanInputMember();
  }
  closeDetailsProjectPanel(): void {
    this.isDetailsPanelOpenSignal.set(false);
  }

  tagsInputSet(tags: string) {
    this.tagsInputSignal.set(tags)
  }

  removeProject(projectId: string): Observable<String> {
    return this.http.delete(this.apiBase + '/api/v1/project/' + projectId, {
      withCredentials: true
    })
      .pipe(
        map((res) => {
          //Borrar aqui tareas del proyecto eliminado usando TaskService
          this.projectService.getProjectsFromApi();
          return "Project deleted successfully";
        }),
        catchError(this.handleError)
      );
  }

  updateProject(projectData: ProjectRequest, teamMembers: UserRole[]): Observable<String> {
    const newProject: ProjectRequest = {
      ...projectData,
      tags: this.splitCommaSeparatedValues(this.tagsInputSignal()),
      teamMembers: teamMembers.map(member => ({ userId: member.id, role: member.role.trim() }))
    };
    return this.updateProjectRequest(newProject);
  }

  private updateProjectRequest(projectData: ProjectRequest): Observable<String> {
    return this.http.put<ProjectRequest>(this.apiBase + '/api/v1/project/' + projectData.id, projectData, {
      withCredentials: true
    })
      .pipe(
        map((res) => {
          this.projectService.getProjectsFromApi();
          return "Project created successfully";
        }),
        catchError(this.handleError)
      );
  }
  
  private splitCommaSeparatedValues(value: string): string[] {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  private getProjectById(projectId: string): void {
    this.http.get<ProjectRequest>(this.apiBase + '/api/v1/project/' + projectId, {},).pipe(
      map(data => ({
        ...data,
        startDate: this.toInputDate(data.startDate),
        dueDate: this.toInputDate(data.dueDate)
      })),
      catchError(this.handleError)
    ).subscribe({
      next: (project) => {
        this.tagsInputSignal.set(project.tags.join(', '))
        this.detailValidationService.setProjectDetailsModel(project);
        this.detailValidationService.formDisable();
        this.teamTableService.loadTeamMembers(project.teamMembers)
      },
      error: (err) => {
        console.error('Error fetching project details:', err);
      },
    });
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