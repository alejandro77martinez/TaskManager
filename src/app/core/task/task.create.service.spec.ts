import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CreateTaskService } from './task.create.service';
import { TaskCreateValidationService } from './task.create.validation';
import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { TaskRequest, TaskCard } from './task.interfaces';

describe('CreateTaskService', () => {
  let service: CreateTaskService;
  let httpMock: HttpTestingController;
  let taskServiceStub: { addTask: (projectId: string, task: TaskCard) => void };
  let validationStub: { resetForm: () => void };

  const mockTaskRequest: TaskRequest = {
    title: 'New Task',
    description: 'Desc',
    type: 'Funcionalidad',
    status: 'Creada',
    projectId: 'project-1',
    assigneeId: 'user-1',
    parentTaskId: '',
    dueDate: '2026-06-20',
    createdDate: '2026-06-01',
    startDate: '2026-06-01',
    priority: 'Media',
    effortPoints: 3,
    isSubtask: false,
    blocked: false
  } as TaskRequest;

  beforeEach(() => {
    taskServiceStub = { addTask: vi.fn() };
    validationStub = { resetForm: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        CreateTaskService,
        { provide: TaskService, useValue: taskServiceStub },
        { provide: TaskCreateValidationService, useValue: validationStub }
      ]
    });

    service = TestBed.inject(CreateTaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should open and close panel and reset form', () => {
    service.openCreateTaskPanel();
    expect(validationStub.resetForm).toHaveBeenCalled();
    expect(service.isCreateTaskPanelOpen()).toBe(true);

    service.closeCreateTaskPanel();
    expect(service.isCreateTaskPanelOpen()).toBe(false);
  });

  it('should create task and add to TaskService', async () => {
    let res: string | undefined;
    service.createTask(mockTaskRequest).subscribe((message) => (res = message));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ ...mockTaskRequest, id: 'created-1' });

    await new Promise((r) => setTimeout(r, 0));
    expect(res).toBe('Task creada exitosamente');
    expect(taskServiceStub.addTask).toHaveBeenCalledWith('project-1', { ...mockTaskRequest, id: 'created-1' } as TaskCard);
  });

  it('should handle createTask http error', async () => {
    let err: any;
    service.createTask(mockTaskRequest).subscribe({ next: () => {}, error: (e) => (err = e) });
    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/');
    req.error(new ProgressEvent('Net')); // client-side
    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
  });
});
