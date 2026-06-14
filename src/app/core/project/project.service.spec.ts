import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { AuthService } from '../auth/auth.service';
import { TaskService } from '../task/task.service';
import { ProjectCard } from './project.interfaces';
import { UserSearchEmailResult } from '../users/user.interfaces';
import { environment } from '../../../environments/environment';
import { TaskCard } from '../task/task.interfaces';
import { vi } from 'vitest';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  let mockAuthService: { authUser: () => { id: string } | null };
  let mockTaskService: {
    getAllTask: () => TaskCard[];
    getAdvance: (projectId: string) => number;
    getTaskByProjectsIds: (ids: string[]) => void;
  };

  const mockProjects: ProjectCard[] = [
    {
      id: 'project-1',
      name: 'Project One',
      client: 'Client A',
      creator: 'user-1',
      role: 'Lead',
      summary: 'Summary',
      priority: 'Alta',
      health: 'En foco',
      progress: 50,
      dueDate: '2026-06-20',
      methodology: 'Kanban',
      sprint: 'Sprint 1',
      completedTasks: 2,
      totalTasks: 4,
      teamMembers: ['user-2', 'user-3'],
      tags: ['tag1', 'tag2']
    }
  ];

  const mockTasks: TaskCard[] = [
    {
      id: 'task-1',
      title: 'Task 1',
      description: 'Desc',
      type: 'Funcionalidad',
      status: 'En curso',
      projectId: 'project-1',
      assigneeId: 'user-2',
      parentTaskId: '',
      dueDate: '2026-06-15',
      createdDate: '2026-06-01',
      startDate: '2026-06-01',
      priority: 'Alta',
      effortPoints: 5,
      blocked: false,
      isSubtask: false
    }
  ];

  const mockMembers: UserSearchEmailResult[] = [
    { id: 'user-1', email: 'one@example.com', name: 'User One', avatar: 'avatar1.png' },
    { id: 'user-2', email: 'two@example.com', name: 'User Two', avatar: 'avatar2.png' }
  ];

  beforeEach(() => {
    mockAuthService = {
      authUser: vi.fn(() => ({ id: 'user-1' }))
    };

    mockTaskService = {
      getAllTask: vi.fn(() => mockTasks),
      getAdvance: vi.fn(() => 75),
      getTaskByProjectsIds: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        ProjectService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: TaskService, useValue: mockTaskService }
      ]
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get current project id', () => {
    service.setCurrentProjectId('project-1');
    expect(service.currentProjectId()).toBe('project-1');
  });

  it('should return project name for current project', () => {
    service['projectsSignal'].set(mockProjects);
    service.setCurrentProjectId('project-1');

    expect(service.getNameCurrentProject()).toBe('Project One');
  });

  it('should return empty string when current project not found', () => {
    service['projectsSignal'].set([]);
    service.setCurrentProjectId('unknown');

    expect(service.getNameCurrentProject()).toBe('');
  });

  it('should return members of current project', () => {
    service['projectsSignal'].set(mockProjects);
    service['membersSignal'].set(mockMembers);
    service.setCurrentProjectId('project-1');

    const members = service.getMembersOfCurrentProject();
    expect(members).toEqual([
      { id: 'user-2', email: 'two@example.com', name: 'User Two', avatar: 'avatar2.png' },
      { id: 'user-1', email: 'one@example.com', name: 'User One', avatar: 'avatar1.png' }
    ]);
  });

  it('should return empty members when current project missing', () => {
    service['projectsSignal'].set([]);
    service.setCurrentProjectId('project-1');

    expect(service.getMembersOfCurrentProject()).toEqual([]);
  });

  it('should calculate portfolio summary correctly', () => {
    service['projectsSignal'].set(mockProjects);

    const summary = service.portfolioSummary();
    expect(summary.activeProjects).toBe(1);
    expect(summary.avgProgress).toBe(75);
    expect(summary.totalCollaborators).toBe(2);
    expect(summary.blockedTasks).toBe(0);
    expect(summary.nextDeadline).toBe('2026-06-15');
  });

  it('should compute overview cards using portfolio summary', () => {
    service['projectsSignal'].set(mockProjects);

    const cards = service.overviewCards();
    expect(cards[0].label).toBe('Proyectos activos');
    expect(cards[0].value).toBe('1');
    expect(cards[1].label).toBe('Avance promedio');
    expect(cards[1].value).toBe('75%');
    expect(cards[2].label).toBe('Colaboradores');
    expect(cards[2].value).toBe('2');
  });

  it('should compute project signals', () => {
    service['projectsSignal'].set(mockProjects);

    const signals = service.projectSignals();
    expect(signals[0].value).toBe('1');
    expect(signals[1].value).toBe('1');
    expect(signals[2].value).toBe('0');
  });

  it('should return initials and names from members signal', () => {
    service['membersSignal'].set(mockMembers);

    expect(service.getInitialsMember('user-1')).toBe('UO');
    expect(service.getNameMember('user-2')).toBe('User Two');
    expect(service.getNameProject('project-1')).toBe('');
  });

  it('should format dates correctly', () => {
    expect(service.formatDate('2026-06-12')).toContain('12');
    expect(service.formatDate(null)).toBe('Sin fecha');
  });

  it('should map health and priority to CSS classes', () => {
    expect(service.getHealthClasses('En foco')).toContain('emerald');
    expect(service.getHealthClasses('En riesgo')).toContain('amber');
    expect(service.getPriorityClasses('Alta')).toContain('rose');
    expect(service.getPriorityClasses('Media')).toContain('amber');
  });

  it('should preview comma separated values', () => {
    const result = service.previewCommaSeparatedValues('a, b, c, d, e');
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should return in-progress and blocked tasks from TaskService', () => {
    const inProgress = service.inProgressTasks();
    expect(inProgress.length).toBe(1);
    expect(inProgress[0].status).toBe('En curso');

    const blocked = service.blockedTasks();
    expect(blocked.length).toBe(0);
  });

  it('should delete project from signal', () => {
    service['projectsSignal'].set(mockProjects);
    service.deletedProject('project-1');
    expect(service.projects()).toEqual([]);
  });

  it('should fetch projects from API and load members and tasks', () => {
    service.getProjectsFromApi();

    const getReq = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/project/ofTheUser/user-1');
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockProjects);

    const membersReq = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/search/team');
    expect(membersReq.request.method).toBe('POST');
    expect(membersReq.request.body).toEqual(['user-2', 'user-3', 'user-1']);
    membersReq.flush(mockMembers);

    expect(service.projects()).toEqual(mockProjects);
    expect(service.members()).toEqual(mockMembers);
    expect(mockTaskService.getTaskByProjectsIds).toHaveBeenCalledWith(['project-1']);
    expect(service.loadProjects()).toBe(true);
  });
});