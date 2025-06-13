import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, EMPTY, map, Observable, throwError } from 'rxjs';
import { AppError } from '../models/app-error';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  static readonly CONNECTION_REFUSE = 0;
  static readonly UNAUTHORIZED = 401;
  private token: string | null = null;

  private headers!: HttpHeaders;
  private params!: HttpParams;
  private responseType: string  = '';
  private successfulNotification: string  = '';
  private errorNotification: string  = '';

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.resetOptions();
  }

  private resetOptions(): void {
    this.headers = new HttpHeaders();
    this.params = new HttpParams();
    this.responseType = 'json';
  }

  setToken(token: string): void {
    this.token = token;
  }

  paramsFrom(dto: any): this {
    Object.getOwnPropertyNames(dto)
      .forEach(item => this.param(item, dto[item]));
    return this;
  }

  param(key: string, value: string): this {
    if (value != null) {
      this.params = this.params.append(key, value); // This class is immutable
    }
    return this;
  }

  successful(notification = 'Successful'): this {
    this.successfulNotification = notification;
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
    return this.http
      .post(endpoint, body, requestOptions)
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  get(endpoint: string): Observable<any> {
    return this.http
      .get(endpoint, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  put(endpoint: string, body?: object): Observable<any> {
    return this.http
      .put(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  patch(endpoint: string, body?: object): Observable<any> {
    return this.http
      .patch(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  delete(endpoint: string): Observable<any> {
    return this.http
      .delete(endpoint, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error)));
  }

  header(key: string, value: string): HttpService {
    if (value != null) {
      this.headers = this.headers.append(key, value); // This class is immutable
    }
    return this;
  }

  private createOptions(): any {
    let headers = this.headers;
    if (this.token) {
      headers = headers.append('Authorization', `Bearer ${this.token}`);
    }
    const options: any = {
      headers: headers,
      params: this.params,
      responseType: this.responseType,
      observe: 'response'
    };
    this.resetOptions();
    return options;
  }

  private extractData(response: any): any {
    if (this.successfulNotification) {
      // this.snackBar.open(this.successfulNotification, '', {
      //   duration: 2000
      // });
      this.successfulNotification = '';
    }
    const contentType = response.headers.get('content-type');
    if (contentType) {
      if (contentType.indexOf('application/pdf') !== -1) {
        const blob = new Blob([response.body], {type: 'application/pdf'});
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
      // this.snackBar.open(this.errorNotification, 'Error', {duration: 5000});
      this.errorNotification = '';
    } else {
      // this.snackBar.open(notification, 'Error', {duration: 5000});
    }
  }

  private handleError(response: any): any {
    let error: AppError;
    if (response.status === HttpService.UNAUTHORIZED) {
      this.showError('Unauthorized');
      this.router.navigate(['']).then();
      return EMPTY;
    } else if (response.status === HttpService.CONNECTION_REFUSE) {
      this.showError('Connection Refuse');
      return EMPTY;
    } else {
      try {
        error = response.error; // with 'text': JSON.parse(response.error);
        this.showError(error.error + ' (' + response.status + '): ' + error.message);
        return throwError(() => error);
      } catch (e) {
        this.showError('Not response');
        return throwError(() => response.error);
      }
    }
  }
}
