import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRegisterData, UserRegisterFormData, UserRole, UserRoleRequest, UserSearchEmailResult } from './user.interfaces';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly apiBase = environment.authApiBaseUrl;

  constructor(private http: HttpClient) {}

  sendUserRegister(userData: UserRegisterFormData): Observable<void> {
    const userRegisterData: UserRegisterData = {
      name: userData.name,
      lastName: userData.lastname,
      email: userData.email,
      password: userData.password
    }
    return this.http.post<void>(this.apiBase + '/api/v1/user/register',userRegisterData)
      .pipe (
        catchError(this.handleError)
      )
  }

  emailExist(userName: string): Observable<boolean> {
    return this.http.post<boolean>(this.apiBase+'/api/v1/user/exist', userName)
      .pipe(
        map((res) => {
          return res;
        }),
        catchError(this.handleError)
      );
  }

  searchUsersByEmail(email: string): Observable<UserSearchEmailResult[]> {
    return this.http.get<UserSearchEmailResult[]>(
      this.apiBase + '/api/v1/user/search/email/' + email
    ).pipe(
      catchError(this.handleError)
    );
  }
  
  searchTeamById(team: UserRoleRequest[]): Observable<UserRole[]> {
    const arrayIds:string[] = team.map(member => member.userId);
    return this.http.post<UserSearchEmailResult[]>(
      this.apiBase + '/api/v1/user/search/team',
      arrayIds
    ).pipe(
      map((results) => {
        return results.map(result => {
          const role = team.find(member => member.userId === result.id)?.role || '';
          return {
            id: result.id,
            name: result.name,
            email: result.email,
            avatar: result.avatar,
            role
          } as UserRole;
        });
      }),
      catchError(this.handleError)
    );
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
