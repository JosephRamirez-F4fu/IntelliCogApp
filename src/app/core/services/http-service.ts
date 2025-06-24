import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, EMPTY, map, Observable, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  static readonly CONNECTION_REFUSE = 0;
  static readonly UNAUTHORIZED = 401;
  static readonly BAD_REQUEST = 400;
  static readonly NOT_FOUND = 404;
  static readonly CONFLICT = 409;

  private headers!: HttpHeaders;
  private params!: HttpParams;
  private responseType: string = '';
  private errorNotification: string = '';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.resetOptions();
  }

  private resetOptions(): void {
    this.headers = new HttpHeaders();
    this.params = new HttpParams();
    this.responseType = 'json';
  }

  paramsFrom(dto: any): this {
    Object.getOwnPropertyNames(dto).forEach((item) =>
      this.param(item, dto[item])
    );
    return this;
  }

  param(key: string, value: string): this {
    if (value != null) {
      this.params = this.params.append(key, value); // This class is immutable
    }
    return this;
  }

  error(notification: string): this {
    this.errorNotification = notification;
    return this;
  }

  pdf(): this {
    this.responseType = 'blob';
    this.header('Accept', 'application/pdf , application/json');
    return this;
  }

  post(endpoint: string, body?: any, options?: any): Observable<any> {
    const requestOptions = { ...this.createOptions(), ...options };
    return this.http.post(endpoint, body, requestOptions).pipe(
      map((response) => {
        return this.extractData(response);
      }),
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  get(endpoint: string): Observable<any> {
    return this.http.get(endpoint, this.createOptions()).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error))
    );
  }

  put(endpoint: string, body?: object): Observable<any> {
    return this.http.put(endpoint, body, this.createOptions()).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error))
    );
  }

  patch(endpoint: string, body?: object): Observable<any> {
    return this.http.patch(endpoint, body, this.createOptions()).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error))
    );
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(endpoint, this.createOptions()).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error))
    );
  }

  header(key: string, value: string): HttpService {
    if (value != null) {
      this.headers = this.headers.append(key, value);
    }
    return this;
  }

  private createOptions(): any {
    const options: any = {
      headers: this.headers,
      params: this.params,
      responseType: this.responseType,
      observe: 'response',
      withCredentials: true,
    };
    this.resetOptions();
    return options;
  }

  private extractData(response: any): any {
    const contentType = response.headers.get('content-type');
    if (contentType) {
      if (contentType.indexOf('application/pdf') !== -1) {
        const blob = new Blob([response.body], { type: 'application/pdf' });
        window.open(window.URL.createObjectURL(blob));
      } else if (contentType.indexOf('application/json') !== -1) {
        return response.body; // with 'text': JSON.parse(response.body);
      }
    } else {
      return response;
    }
  }

  private showError(notification: string): void {
    if (this.errorNotification) {
      //this.snackBar.show(this.errorNotification, 'error', 5000);
      this.errorNotification = '';
    } else {
      //this.snackBar.show(notification, 'error', 5000);
    }
  }

  private handleError(response: any): any {
    let error: any = response.error;
    let status = response.status;
    // Intenta extraer mensaje de error de distintas formas
    let errorMsg =
      (error && (error.error || error.message || error.msg || error.detail)) ||
      response.statusText ||
      'Error desconocido';

    // Construye el mensaje final
    let finalMsg = `${status} - ${errorMsg}`;

    return throwError(() => response);
  }
}
