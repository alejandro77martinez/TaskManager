import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProjectDetailsService } from './project.details.service';
import { ProjectDetailsValidationService } from './project.details.validation';
import { ProjectTeamTableService } from './project.team.table.service';
import { ProjectService } from './project.service';
import { TaskService } from '../task/task.service';
import { ProjectRequest } from './project.interfaces';
import { UserRole, UserRoleRequest } from '../users/user.interfaces';
import { environment } from '../../../environments/environment';

describe('ProjectDetailsService', () => {
  let service: ProjectDetailsService;
  let httpMock: HttpTestingController;
  let projectServiceStub: {
    getNameMember: (id: string) => string;
    deletedProject: (id: string) => void;
    getProjectsFromApi: () => void;
  };
  let detailValidationServiceStub: {
    setProjectDetailsModel: (project: ProjectRequest) => void;
    formDisable: () => void;
  };
  let teamTableServiceStub: {
    setIsEditMode: (value: boolean) => void;
    cleanInputMember: () => void;
    loadTeamMembers: (members: UserRoleRequest[]) => void;
  };
  let taskServiceStub: {
    tasksForProject: () => { projectId: string; tasks: { id: string }[] }[];
    removeSetTasks: (ids: string[]) => any;
    deleteAllProjectTaskInSignal: (projectId: string) => void;
  };

  const mockProject: ProjectRequest = {
    id: 'project-1',
    name: 'Mock Project',
    client: 'Mock Client',
    summary: 'A test project',
    priority: 'Alta',
    health: 'En foco',
    progress: 42,
    methodology: 'Kanban',
    createdDate: '2026-06-01T00:00:00.000Z',
    startDate: '2026-06-10T00:00:00.000Z',
    dueDate: '2026-06-30T00:00:00.000Z',
    userCreated: { userId: 'user-1', role: 'Owner' },
    teamMembers: [{ userId: 'user-2', role: 'Developer' }],
    tags: ['frontend', 'ui']
  };

  beforeEach(() => {
    projectServiceStub = {
      getNameMember: vi.fn((id: string) => `name-${id}`),
      deletedProject: vi.fn(),
      getProjectsFromApi: vi.fn()
    };

    detailValidationServiceStub = {
      setProjectDetailsModel: vi.fn(),
      formDisable: vi.fn()
    };

    teamTableServiceStub = {
      setIsEditMode: vi.fn(),
      cleanInputMember: vi.fn(),
      loadTeamMembers: vi.fn()
    };

    taskServiceStub = {
      tasksForProject: vi.fn(() => [
        { projectId: 'project-1', tasks: [{ id: 'task-1' }] }
      ]),
      removeSetTasks: vi.fn(() => of({})),
      deleteAllProjectTaskInSignal: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        ProjectDetailsService,
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: ProjectDetailsValidationService, useValue: detailValidationServiceStub },
        { provide: ProjectTeamTableService, useValue: teamTableServiceStub },
        { provide: TaskService, useValue: taskServiceStub }
      ]
    });

    service = TestBed.inject(ProjectDetailsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return creator name from ProjectService', () => {
    expect(service.getNameCreator('user-2')).toBe('name-user-2');
  });

  it('should open and close details panel with team table reset', () => {
    service.openDetailsProjectPanel('project-1');

    const request = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/project/project-1');
    expect(request.request.method).toBe('GET');
    request.flush(mockProject);

    expect(service.isDetailsPanelOpen()).toBe(true);
    expect(teamTableServiceStub.setIsEditMode).toHaveBeenCalledWith(false);
    expect(teamTableServiceStub.cleanInputMember).toHaveBeenCalled();
    expect(teamTableServiceStub.loadTeamMembers).toHaveBeenCalledWith(mockProject.teamMembers);
    expect(detailValidationServiceStub.setProjectDetailsModel).toHaveBeenCalledWith({
      ...mockProject,
      startDate: '2026-06-10',
      dueDate: '2026-06-30'
    });
    expect(detailValidationServiceStub.formDisable).toHaveBeenCalled();

    service.closeDetailsProjectPanel();
    expect(service.isDetailsPanelOpen()).toBe(false);
  });

  it('should remove project and delete related tasks', async () => {
    let result: String | undefined;

    service.removeProject('project-1').subscribe((message) => {
      result = message;
    });

    const request = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/project/project-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(result).toBe('Project deleted successfully');
    expect(taskServiceStub.removeSetTasks).toHaveBeenCalledWith(['task-1']);
    expect(taskServiceStub.deleteAllProjectTaskInSignal).toHaveBeenCalledWith('project-1');
    expect(projectServiceStub.deletedProject).toHaveBeenCalledWith('project-1');
  });

  it('should update project and call API with formatted tags and members', async () => {
    const updatedProject: ProjectRequest = {
      ...mockProject,
      tags: ['frontend', 'ui']
    };

    const teamMembers: UserRole[] = [{ id: 'user-2', name: 'User Two', email: 'two@example.com', avatar: '', role: 'Developer' }];

    service.tagsInputSet('frontend, ui');

    let result: String | undefined;
    service.updateProject(updatedProject, teamMembers).subscribe((message) => {
      result = message;
    });

    const request = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/project/project-1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body.tags).toEqual(['frontend', 'ui']);
    expect(request.request.body.teamMembers).toEqual([{ userId: 'user-2', role: 'Developer' }]);

    request.flush(request.request.body);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(result).toBe('Project created successfully');
    expect(projectServiceStub.getProjectsFromApi).toHaveBeenCalled();
  });
});
