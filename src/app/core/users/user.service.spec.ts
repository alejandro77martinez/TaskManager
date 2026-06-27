import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { UserRegisterFormData, UserRoleRequest, UserSearchEmailResult } from './user.interfaces';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockRegisterFormData: UserRegisterFormData = {
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    termsAndConditions: true
  };

  const mockSearchResults: UserSearchEmailResult[] = [
    { id: 'user-1', email: 'john@example.com', name: 'John Doe', avatar: 'avatar1.png' },
    { id: 'user-2', email: 'jane@example.com', name: 'Jane Smith', avatar: 'avatar2.png' }
  ];

  const mockTeamRequest: UserRoleRequest[] = [
    { userId: 'user-1', role: 'Developer' },
    { userId: 'user-2', role: 'Tester' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        UserService
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send user registration data', async () => {
    let success = false;
    service.sendUserRegister(mockRegisterFormData).subscribe(() => (success = true));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!'
    });
    req.flush({});

    await new Promise((r) => setTimeout(r, 0));
    expect(success).toBe(true);
  });

  it('should handle register error', async () => {
    let err: any;
    service.sendUserRegister(mockRegisterFormData).subscribe({ next: () => {}, error: (e) => (err = e) });

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/register');
    req.error(new ProgressEvent('Net'), { status: 400, statusText: 'Bad Request' });

    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
    expect(err.message).toContain('Código: 400');
  });

  it('should check if email exists', async () => {
    let res: boolean | undefined;
    service.emailExist('john@example.com').subscribe((result) => (res = result));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/exist');
    expect(req.request.method).toBe('POST');
    req.flush(true);

    await new Promise((r) => setTimeout(r, 0));
    expect(res).toBe(true);
  });

  it('should return false when email does not exist', async () => {
    let res: boolean | undefined;
    service.emailExist('nonexistent@example.com').subscribe((result) => (res = result));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/exist');
    req.flush(false);

    await new Promise((r) => setTimeout(r, 0));
    expect(res).toBe(false);
  });

  it('should handle emailExist error', async () => {
    let err: any;
    service.emailExist('error@example.com').subscribe({ next: () => {}, error: (e) => (err = e) });

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/exist');
    req.error(new ErrorEvent('Network error'));

    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
  });

  it('should search users by email', async () => {
    let res: any;
    service.searchUsersByEmail('john').subscribe((result) => (res = result));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/search/email/john');
    expect(req.request.method).toBe('GET');
    req.flush(mockSearchResults);

    await new Promise((r) => setTimeout(r, 0));
    expect(res).toEqual(mockSearchResults);
  });

  it('should handle searchUsersByEmail error', async () => {
    let err: any;
    service.searchUsersByEmail('test').subscribe({ next: () => {}, error: (e) => (err = e) });

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/search/email/test');
    req.error(new ProgressEvent('Net'), { status: 500, statusText: 'Server Error' });

    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
    expect(err.message).toContain('500');
  });

  it('should search team by id and map results with roles', async () => {
    let res: any;
    service.searchTeamById(mockTeamRequest).subscribe((result) => (res = result));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/search/team');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(['user-1', 'user-2']);
    req.flush(mockSearchResults);

    await new Promise((r) => setTimeout(r, 0));
    expect(res).toEqual([
      { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: 'avatar1.png', role: 'Developer' },
      { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'avatar2.png', role: 'Tester' }
    ]);
  });

  it('should assign empty role when not found in team request', async () => {
    let res: any;
    const partialTeam: UserRoleRequest[] = [{ userId: 'user-1', role: 'Lead' }];
    service.searchTeamById(partialTeam).subscribe((result) => (res = result));

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/search/team');
    req.flush(mockSearchResults);

    await new Promise((r) => setTimeout(r, 0));
    expect(res[0].role).toBe('Lead');
    expect(res[1].role).toBe('');
  });

  it('should handle searchTeamById error', async () => {
    let err: any;
    service.searchTeamById(mockTeamRequest).subscribe({ next: () => {}, error: (e) => (err = e) });

    const req = httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/user/search/team');
    req.error(new ProgressEvent('Net'), { status: 503, statusText: 'Service Unavailable' });

    await new Promise((r) => setTimeout(r, 0));
    expect(err).toBeTruthy();
    expect(err.message).toContain('503');
  });
});
