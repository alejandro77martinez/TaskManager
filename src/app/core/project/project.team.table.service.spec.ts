import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProjectTeamTableService } from './project.team.table.service';
import { UserService } from '../users/user.service';
import { ToastService } from '../toast/toast.service';
import { UserRole, UserRoleRequest, UserSearchEmailResult } from '../users/user.interfaces';

describe('ProjectTeamTableService', () => {
  let service: ProjectTeamTableService;
  let userServiceStub: {
    searchTeamById: (team: UserRoleRequest[]) => any;
    searchUsersByEmail: (email: string) => any;
  };
  let toastServiceStub: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };

  const mockUsers: UserSearchEmailResult[] = [
    { id: 'user-1', email: 'one@example.com', name: 'One', avatar: 'avatar1.png' },
    { id: 'user-2', email: 'two@example.com', name: 'Two', avatar: 'avatar2.png' }
  ];

  const mockTeam: UserRoleRequest[] = [{ userId: 'user-2', role: 'Developer' }];

  beforeEach(() => {
    vi.useFakeTimers();

    userServiceStub = {
      searchTeamById: vi.fn(() => of([{ id: 'user-2', name: 'Two', email: 'two@example.com', avatar: 'avatar2.png', role: 'Developer' }])),
      searchUsersByEmail: vi.fn(() => of(mockUsers))
    };

    toastServiceStub = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ProjectTeamTableService,
        { provide: UserService, useValue: userServiceStub },
        { provide: ToastService, useValue: toastServiceStub }
      ]
    });

    service = TestBed.inject(ProjectTeamTableService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should set selected members', () => {
    const members: UserRole[] = [{ id: 'user-2', name: 'Two', email: 'two@example.com', avatar: 'avatar2.png', role: 'Developer' }];
    service.setSelectedMembers(members);
    expect(service.selectedMembers()).toEqual(members);
  });

  it('should load team members from UserService', () => {
    service.loadTeamMembers(mockTeam);

    expect(userServiceStub.searchTeamById).toHaveBeenCalledWith(mockTeam);
    expect(service.selectedMembers()).toEqual([
      { id: 'user-2', name: 'Two', email: 'two@example.com', avatar: 'avatar2.png', role: 'Developer' }
    ]);
  });

  it('should show toast error when loadTeamMembers fails', () => {
    userServiceStub.searchTeamById = vi.fn(() => throwError(() => new Error('fail')));
    service.loadTeamMembers(mockTeam);

    expect(toastServiceStub.error).toHaveBeenCalledWith('Failed to load team members. Please try again later.');
  });

  it('should update member role from input event', () => {
    const event = { target: { value: 'Tester' } } as unknown as Event;
    service.updateMemberRole(event);

    expect(service.teamMembersInput().role).toBe('Tester');
  });

  it('should select email suggestion and hide suggestions', () => {
    service.selectEmailSuggestion(mockUsers[0]);

    expect(service.teamMembersInput()).toEqual({
      id: 'user-1',
      email: 'one@example.com',
      name: 'One',
      avatar: 'avatar1.png',
      role: ''
    });
    expect(service.emailSuggestions()).toEqual([]);
    expect(service.showSuggestions()).toBe(false);
  });

  it('should close suggestions', () => {
    service.closeSuggestions();
    expect(service.showSuggestions()).toBe(false);
  });

  it('should clean input member and suggestions', () => {
    service.cleanInputMember();

    expect(service.teamMembersInput()).toEqual({ id: '', name: '', email: '', avatar: '', role: '' });
    expect(service.emailSuggestions()).toEqual([]);
    expect(service.showSuggestions()).toBe(false);
  });

  it('should add a team member successfully after selecting suggestion and setting role', () => {
    service.selectEmailSuggestion(mockUsers[1]);
    const roleEvent = { target: { value: 'Developer' } } as unknown as Event;
    service.updateMemberRole(roleEvent);

    service.addTeamMember();

    expect(service.selectedMembers()).toEqual([
      { id: 'user-2', name: 'Two', email: 'two@example.com', avatar: 'avatar2.png', role: 'Developer' }
    ]);
    expect(toastServiceStub.success).toHaveBeenCalledWith('Miembro agregado al equipo existosamente.');
  });

  it('should not add a team member when email or role is missing', () => {
    service.addTeamMember();
    expect(toastServiceStub.error).toHaveBeenCalledWith('Ingrese un email y un rol por favor.');
  });

  it('should not add duplicate email and should show info toast', () => {
    service.selectEmailSuggestion(mockUsers[0]);
    service.updateMemberRole({ target: { value: 'Developer' } } as unknown as Event);
    service.addTeamMember();

    service.selectEmailSuggestion(mockUsers[0]);
    service.updateMemberRole({ target: { value: 'Developer' } } as unknown as Event);
    service.addTeamMember();

    expect(toastServiceStub.info).toHaveBeenCalledWith('Email already added to the team members.');
    expect(service.selectedMembers().length).toBe(1);
  });

  it('should remove team member and show info toast', () => {
    const members: UserRole[] = [
      { id: 'user-1', name: 'One', email: 'one@example.com', avatar: 'avatar1.png', role: 'Developer' },
      { id: 'user-2', name: 'Two', email: 'two@example.com', avatar: 'avatar2.png', role: 'Tester' }
    ];
    service.setSelectedMembers(members);

    service.removeTeamMember('user-1');

    expect(service.selectedMembers()).toEqual([
      { id: 'user-2', name: 'Two', email: 'two@example.com', avatar: 'avatar2.png', role: 'Tester' }
    ]);
    expect(toastServiceStub.info).toHaveBeenCalledWith('Miembro eliminado correctamente');
  });

  it('should search users by email after debounce and show suggestions', () => {
    service.onEmailInput({ target: { value: 'te' } } as unknown as Event);
    vi.advanceTimersByTime(300);

    expect(userServiceStub.searchUsersByEmail).toHaveBeenCalledWith('te');
    expect(service.emailSuggestions()).toEqual(mockUsers);
    expect(service.showSuggestions()).toBe(true);
  });

  it('should not show suggestions for short email search terms', () => {
    service.onEmailInput({ target: { value: 'a' } } as unknown as Event);
    vi.advanceTimersByTime(300);

    expect(service.emailSuggestions()).toEqual([]);
    expect(service.showSuggestions()).toBe(false);
  });
});
