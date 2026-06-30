import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { TaskService } from './task.service';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../../environments/environment';
import { TaskCard } from './task.interfaces';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  let toastServiceStub: { success: (msg: string) => void; info: (msg: string) => void; show: (type: string, msg: string) => void };

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

  beforeEach(() => {
    toastServiceStub = {
      success: vi.fn(),
      info: vi.fn(),
      show: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        TaskService,
        { provide: ToastService, useValue: toastServiceStub }
      ]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get tasks by project ids and populate signal', () => {
    service.getTaskByProjectsIds(['project-1']);

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/byprojects');
    expect(req.request.method).toBe('POST');
    req.flush(mockTasks);

    expect(service.tasksForProject().length).toBe(1);
    expect(service.getTasksForCurrentProject('project-1').length).toBe(1);
  });

  it('should remove set tasks via DELETE', () => {
    service.removeSetTasks(['task-1']).subscribe();

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/set');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(['task-1']);
    req.flush({});
  });

  it('should update task status and call toast on completed', () => {
    // seed signal
    service['tasksForProjectSiganl'].set([{ projectId: 'project-1', tasks: [mockTasks[0]] }]);

    service.updateTaskStatus('project-1', 'task-1', 'Completada');

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/task-1/status/Completada');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockTasks[0], status: 'Completada' });

    expect(toastServiceStub.success).toHaveBeenCalledWith('Tarea marcada como completada');
    const tasks = service.getTasksForCurrentProject('project-1');
    expect(tasks.find(t => t.id === 'task-1')?.status).toBe('Completada');
  });

  it('should toggle block/unblock and call show toast', () => {
    service['tasksForProjectSiganl'].set([{ projectId: 'project-1', tasks: [mockTasks[0]] }]);

    service.updateTaskBlockUnblock('project-1', 'task-1', false);

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/task-1/blocked/true');
    expect(req.request.method).toBe('PUT');
    req.flush({});

    expect(service.getTasksForCurrentProject('project-1')[0].blocked).toBe(true);
  });

  it('should compute advance correctly', () => {
    const taskA = { ...mockTasks[0], id: 't1', projectId: 'p1', effortPoints: 3, status: 'Completada' } as TaskCard;
    const taskB = { ...mockTasks[0], id: 't2', projectId: 'p1', effortPoints: 3, status: 'En curso' } as TaskCard;
    service['tasksForProjectSiganl'].set([{ projectId: 'p1', tasks: [taskA, taskB] }]);

    expect(service.getAdvance('p1')).toBe(50);
  });

  it('should add task to signal', () => {
    service['tasksForProjectSiganl'].set([{ projectId: 'p-add', tasks: [] }]);
    const newTask = { ...mockTasks[0], id: 't-new', projectId: 'p-add' } as TaskCard;

    service.addTask('p-add', newTask);

    expect(service.getTasksForCurrentProject('p-add').length).toBe(1);
  });

  it('should delete tasks in signal', () => {
    const t1 = { ...mockTasks[0], id: 'd1', projectId: 'p-del' } as TaskCard;
    const t2 = { ...mockTasks[0], id: 'd2', projectId: 'p-del' } as TaskCard;
    service['tasksForProjectSiganl'].set([{ projectId: 'p-del', tasks: [t1, t2] }]);

    service.deleteTasksInSignal('p-del', ['d1']);
    expect(service.getTasksForCurrentProject('p-del').length).toBe(1);
  });

  it('should toggle show block task modal', () => {
    expect(service.showBlockTaskModal()).toBe(false);
    service.setShowBlockTaskModal(true);
    expect(service.showBlockTaskModal()).toBe(true);
    service.setShowBlockTaskModal(false);
    expect(service.showBlockTaskModal()).toBe(false);
  });

  it('should set task to block', () => {
    const t = mockTasks[0];
    service.setTaskToBlock(t);
    expect(service.taskToBlock()).toEqual(t);
  });

  it('should return priority and status classes for variants', () => {
    expect(service.getPriorityClasses('Media')).toContain('amber');
    expect(service.getPriorityClasses('Baja')).toContain('slate');

    expect(service.getTaskStatusClasses('Creada')).toContain('slate');
    expect(service.getTaskStatusClasses('En revision')).toContain('violet');
    expect(service.getTaskStatusClasses('Completada')).toContain('emerald');
  });

  it('should return all tasks flattened', () => {
    const t1 = { ...mockTasks[0], id: 'a1', projectId: 'pa' } as TaskCard;
    const t2 = { ...mockTasks[0], id: 'b1', projectId: 'pb' } as TaskCard;
    service['tasksForProjectSiganl'].set([
      { projectId: 'pa', tasks: [t1] },
      { projectId: 'pb', tasks: [t2] }
    ]);
    const all = service.getAllTask();
    expect(all.length).toBe(2);
  });

  it('should delete all project tasks in signal', () => {
    const p1 = { projectId: 'p1', tasks: [{ ...mockTasks[0], id: 'x1' }] };
    const p2 = { projectId: 'p2', tasks: [{ ...mockTasks[0], id: 'x2' }] };
    service['tasksForProjectSiganl'].set([p1, p2]);
    service.deleteAllProjectTaskInSignal('p1');
    expect(service.tasksForProject().length).toBe(1);
    expect(service.tasksForProject()[0].projectId).toBe('p2');
  });

  it('should update task in signal', () => {
    const original = { ...mockTasks[0], id: 'u1', projectId: 'up' } as TaskCard;
    service['tasksForProjectSiganl'].set([{ projectId: 'up', tasks: [original] }]);
    const updated = { ...original, title: 'updated' };
    service.updateTaskInSignal('up', updated);
    expect(service.getTasksForCurrentProject('up')[0].title).toBe('updated');
  });

  it('should handle removeSetTasks HTTP client error', async () => {
    let err: any;
    service.removeSetTasks(['bad']).subscribe({ next: () => {}, error: (e) => (err = e) });
    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/set');
    req.error(new ErrorEvent('Network error'));
    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
    expect(err.message).toContain('Http failure response');
  });

  it('should handle removeSetTasks HTTP server error', async () => {
    let err: any;
    service.removeSetTasks(['bad']).subscribe({ next: () => {}, error: (e) => (err = e) });
    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/set');
    req.error(new ProgressEvent('Server'), { status: 500, statusText: 'Server Err' });
    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
    expect(err.message).toContain('500');
  });

  it('should call info toast when updating to non-completed status', () => {
    service['tasksForProjectSiganl'].set([{ projectId: 'project-1', tasks: [mockTasks[0]] }]);
    service.updateTaskStatus('project-1', 'task-1', 'En curso');
    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/task-1/status/En curso');
    req.flush({ ...mockTasks[0], status: 'En curso' });
    expect(toastServiceStub.info).toHaveBeenCalledWith('Tarea actualizada a estado: En curso');
  });

  it('should show toast when blocking/unblocking a task', () => {
    service['tasksForProjectSiganl'].set([{ projectId: 'project-1', tasks: [mockTasks[0]] }]);
    service.updateTaskBlockUnblock('project-1', 'task-1', false);
    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/task/task-1/blocked/true');
    req.flush({});
    expect(toastServiceStub.show).toHaveBeenCalledWith('info', 'Tarea bloqueada exitosamente');
  });
});
