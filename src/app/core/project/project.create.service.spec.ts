import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { ProjectCreateService } from './project.create.service';
import { ProjectService } from './project.service';
import { ProjectTeamTableService } from './project.team.table.service';
import { environment } from '../../../environments/environment';
import { UserRole } from '../users/user.interfaces';
import { NewProjectDraft } from './project.interfaces';
import { vi } from 'vitest';

describe('ProjectCreateService', () => {
  let service: ProjectCreateService;
  let httpMock: HttpTestingController;
  let authServiceStub: { authUser: () => { id: string } | null };
  let projectServiceStub: { getProjectsFromApi: () => void };
  let teamTableServiceStub: {
    setSelectedMembers: (members: UserRole[]) => void;
    setIsEditMode: (isEdit: boolean) => void;
    cleanInputMember: () => void;
  };

  const mockDraft: NewProjectDraft = {
    name: 'Mock Project',
    client: 'Mock Client',
    role: 'Owner',
    summary: 'A test project',
    priority: 'Alta',
    methodology: 'Kanban',
    dueDate: '2026-06-30',
    tags: 'frontend, ui, backend'
  };

  const mockTeamMembers: UserRole[] = [
    { id: 'user-2', name: 'User Two', email: 'two@example.com', avatar: 'avatar2.png', role: 'Developer' }
  ];

  beforeEach(() => {
    authServiceStub = {
      authUser: vi.fn(() => ({ id: 'user-1' }))
    };

    projectServiceStub = {
      getProjectsFromApi: vi.fn()
    };

    teamTableServiceStub = {
      setSelectedMembers: vi.fn(),
      setIsEditMode: vi.fn(),
      cleanInputMember: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        ProjectCreateService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: ProjectTeamTableService, useValue: teamTableServiceStub }
      ]
    });

    service = TestBed.inject(ProjectCreateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle loading state', () => {
    expect(service.isLoading()).toBe(false);
    service.setLoading(true);
    expect(service.isLoading()).toBe(true);
    service.setLoading(false);
    expect(service.isLoading()).toBe(false);
  });

  it('should open create panel and reset team table state', () => {
    service.openCreateProjectPanel();

    expect(service.isCreatePanelOpen()).toBe(true);
    expect(teamTableServiceStub.setSelectedMembers).toHaveBeenCalledWith([]);
    expect(teamTableServiceStub.setIsEditMode).toHaveBeenCalledWith(true);
    expect(teamTableServiceStub.cleanInputMember).toHaveBeenCalled();
  });

  it('should close create panel and reset team table state', () => {
    service.openCreateProjectPanel();
    expect(service.isCreatePanelOpen()).toBe(true);

    service.closeCreateProjectPanel();

    expect(service.isCreatePanelOpen()).toBe(false);
    expect(teamTableServiceStub.setSelectedMembers).toHaveBeenCalledWith([]);
    expect(teamTableServiceStub.setIsEditMode).toHaveBeenCalledWith(false);
    expect(teamTableServiceStub.cleanInputMember).toHaveBeenCalled();
  });

  it('should create project and call API with trimmed values', async () => {
    let result: string | undefined;

    service.createProject(mockDraft, mockTeamMembers).subscribe((message) => {
      result = message;
    });

    const request = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/project/');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body.name).toBe('Mock Project');
    expect(request.request.body.client).toBe('Mock Client');
    expect(request.request.body.teamMembers).toEqual([
      { userId: 'user-2', role: 'Developer' }
    ]);
    expect(request.request.body.userCreated).toEqual({ userId: 'user-1', role: 'Owner' });
    expect(request.request.body.tags).toEqual(['frontend', 'ui', 'backend']);

    request.flush({ ...request.request.body });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result).toBe('Project created successfully');
    expect(projectServiceStub.getProjectsFromApi).toHaveBeenCalled();
  });

  it('should assign default tag when tags are empty', async () => {
    let result: string | undefined;
    const emptyTagsDraft: NewProjectDraft = { ...mockDraft, tags: '' };

    service.createProject(emptyTagsDraft, mockTeamMembers).subscribe((message) => {
      result = message;
    });

    const request = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/project/');
    expect(request.request.body.tags).toEqual(['Nuevo proyecto']);
    request.flush({ ...request.request.body });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result).toBe('Project created successfully');
  });

  it('should handle createProject HTTP error', async () => {
    let error: any;

    service.createProject(mockDraft, mockTeamMembers).subscribe({
      next: () => {
        throw new Error('Should fail');
      },
      error: (err) => {
        error = err;
      }
    });

    const request = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/project/');
    request.error(new ProgressEvent('Network error'), { status: 500, statusText: 'Internal Server Error' });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(error).toBeTruthy();
    expect(error.message).toContain('Código: 500');
  });
});
