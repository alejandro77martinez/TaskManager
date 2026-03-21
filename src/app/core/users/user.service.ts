import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRegisterData, UserRegisterFormData } from './user.interfaces';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly apiBase = environment.authApiBaseUrl;

  constructor(private http: HttpClient) {}

  async sendUserRegister(userData: UserRegisterFormData): Promise<void> {
    const userRegisterData: UserRegisterData = {
      name: userData.name,
      lastName: userData.lastname,
      email: userData.email,
      password: userData.password
    }
    await this.register(userRegisterData);
  }
    
  private async register(userData: UserRegisterData): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.apiBase}/api/v1/auth/register`, userData, {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    } catch (error) {
      console.log('Registration failed:', error);
      throw error;
    }
  }

  emailExist(userName: string): Observable<boolean> {
    return this.http.post<boolean>(this.apiBase+'/api/v1/user/exist', userName).pipe(
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
