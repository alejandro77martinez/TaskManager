import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRegisterData, UserRegisterFormData } from './user.interfaces';

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
