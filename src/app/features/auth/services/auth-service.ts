import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EndPoints } from '@common/end-points';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly RECOVER_TOKEN = 'recover_token';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  clearToken() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  refreshToken(): Observable<string> {
    return this.http
      .post<{ access_token: string }>(
        EndPoints.REFRESH,
        {},
        { withCredentials: true }
      )
      .pipe(map((res) => res.access_token));
  }
}
