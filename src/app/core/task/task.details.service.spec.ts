import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { TaskDetailsService } from './task.details.service';
import { TaskDetailsValidationService } from './task.details.validation';
import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { TaskCard } from './task.interfaces';

describe('TaskDetailsService', () => {
  let service: TaskDetailsService;
  let httpMock: HttpTestingController;
  let validationStub: { setTaskDetailsModel: (t: TaskCard) => void };
  let taskServiceStub: any;

  const mockTask: TaskCard = {
    id: 'task-1',
    title: 'Task 1',
    description: 'Desc',
    type: 'Funcionalidad',
    status: 'En curso',
    projectId: 'project-1',
    assigneeId: 'user-2',
    parentTaskId: '',
    dueDate: '2026-06-15T00:00:00.000Z',
    createdDate: '2026-06-01',
    startDate: '2026-06-01',
    priority: 'Alta',
    effortPoints: 5,
    blocked: false,
    isSubtask: false
  };

  beforeEach(() => {
    validationStub = { setTaskDetailsModel: vi.fn() };
    taskServiceStub = {
      getAllTask: vi.fn(() => []),
      updateTaskInSignal: vi.fn(),
      removeSetTasks: vi.fn(() => of({})),
      deleteTasksInSignal: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        TaskDetailsService,
        { provide: TaskDetailsValidationService, useValue: validationStub },
        { provide: TaskService, useValue: taskServiceStub }
      ]
    });

    service = TestBed.inject(TaskDetailsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should open and close details panel and set model', () => {
    service.openDetailsPanel(mockTask);
    expect(validationStub.setTaskDetailsModel).toHaveBeenCalled();
    expect(service.isDetailsPanelOpen()).toBe(true);

    service.closeDetailsPanel();
    expect(service.isDetailsPanelOpen()).toBe(false);
  });

  it('should return subtasks recursively', () => {
    const sub1 = { ...mockTask, id: 's1', parentTaskId: 'task-1' } as TaskCard;
    const sub2 = { ...mockTask, id: 's2', parentTaskId: 's1' } as TaskCard;
    taskServiceStub.getAllTask = vi.fn(() => [sub1, sub2]);

    const subs = service.getSubTasks('task-1');
    expect(subs.map(s => s.id)).toEqual(['s1', 's2']);
  });

  it('should update task via PUT and update signal', async () => {
    const updated = { ...mockTask, title: 'updated' };
    let res: string | undefined;
    service.updateTask(updated).subscribe((message) => (res = message));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/task-1');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...updated });

    await new Promise((r) => setTimeout(r, 0));
    expect(res).toBe('Tarea actualizada correctamente');
    expect(taskServiceStub.updateTaskInSignal).toHaveBeenCalledWith(updated.projectId, updated);
  });

  it('should delete task and subtasks via TaskService', async () => {
    const sub1 = { ...mockTask, id: 's1', parentTaskId: 'task-1' } as TaskCard;
    taskServiceStub.getAllTask = vi.fn(() => [sub1]);
    let res: string | undefined;

    service.deletedTask('project-1', 'task-1').subscribe((message) => (res = message));

    expect(taskServiceStub.removeSetTasks).toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 0));
    expect(res).toBe('Tareas eliminadas exitosamente');
    expect(taskServiceStub.deleteTasksInSignal).toHaveBeenCalled();
  });

  it('should handle updateTask http error', async () => {
    let err: any;
    service.updateTask(mockTask).subscribe({ next: () => {}, error: (e) => (err = e) });
    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/task-1');
    req.error(new ProgressEvent('Net'));
    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
  });

  it('should handle deletedTask error from TaskService', async () => {
    taskServiceStub.removeSetTasks = vi.fn(() => throwError(() => new Error('fail')));
    let err: any;
    service.deletedTask('project-1', 'task-1').subscribe({ next: () => {}, error: (e) => (err = e) });
    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
  });
});
