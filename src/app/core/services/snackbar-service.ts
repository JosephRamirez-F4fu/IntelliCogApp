import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface SnackbarMessage {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private messageSubject = new Subject<SnackbarMessage>();
  message$ = this.messageSubject.asObservable();

  show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 3000
  ) {
    this.messageSubject.next({ message, type, duration });
  }
}
