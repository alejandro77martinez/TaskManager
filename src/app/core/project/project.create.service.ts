import { inject, Injectable, signal } from "@angular/core";
import { CreateProjectFormValidationService } from "./project.create.validation";
import { NewProjectDraft, ProjectRequest } from "./project.interfaces";
import { catchError, map, Observable, throwError } from "rxjs";
import { UserRole } from "../users/user.interfaces";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../auth/auth.service";
import { environment } from "../../../environments/environment";
import { ProjectService } from "./project.service";
import { ProjectTeamTableService } from "./project.team.table.service";

@Injectable({ providedIn: 'root' })
export class ProjectCreateService {

  readonly validateFormService = inject(CreateProjectFormValidationService);
  private readonly authService = inject(AuthService);
  private readonly projectService = inject(ProjectService);
  private readonly projectTeamTableService = inject(ProjectTeamTableService)

  private readonly isCreatePanelOpenSignal = signal(false);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly apiBase = environment.authApiBaseUrl;

  readonly isCreatePanelOpen = this.isCreatePanelOpenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  setLoading(loading: boolean) {
    this.isLoadingSignal.set(loading);
  }
  openCreateProjectPanel(): void {
    this.isCreatePanelOpenSignal.set(true);
    this.projectTeamTableService.setSelectedMembers([]);
    this.projectTeamTableService.setIsEditMode(true);
    this.projectTeamTableService.cleanInputMember();
  }
  closeCreateProjectPanel(): void {
    this.isCreatePanelOpenSignal.set(false);
    this.projectTeamTableService.setSelectedMembers([]);
    this.projectTeamTableService.setIsEditMode(false);
    this.projectTeamTableService.cleanInputMember();
  }
  createProject(draft: NewProjectDraft, teamMembers: UserRole[]): Observable<String> {
    const tags = this.splitCommaSeparatedValues(draft.tags);
    const newProject: ProjectRequest = {
      name: draft.name.trim(),
      client: draft.client.trim(),
      summary: draft.summary.trim(),
      priority: draft.priority,
      health: 'Descubrimiento',
      progress: 0,
      methodology: draft.methodology,
      createdDate: new Date().toISOString(),
      startDate: new Date().toISOString(),
      dueDate: draft.dueDate,
      tags: tags.length ? tags : ['Nuevo proyecto'],
      userCreated: { userId: this.getUserId(), role: draft.role.trim() },
      teamMembers: teamMembers.map(member => ({ userId: member.id, role: member.role.trim() }))
    };
    return this.CreateProjectRequest(newProject);
  }
  private CreateProjectRequest(projectData: ProjectRequest): Observable<String> {
    return this.http.post<ProjectRequest>(this.apiBase + '/api/v1/project', projectData, {
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
  private getUserId(): string {
    return this.authService.authUser()?.id ?? '';
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