import { Component, OnInit } from '@angular/core';
import {
  SnackbarService,
  SnackbarMessage,
} from '../../core/services/snackbar-service';

@Component({
  selector: 'app-snackbar',
  template: `
    @if (visible) {
    <div class="snackbar" [class]="type" [class.show]="visible">
      <span class="snackbar-message">{{ message }}</span>
      <button class="snackbar-close" (click)="close()" aria-label="Cerrar">
        &times;
      </button>
    </div>
    }
  `,
  styleUrls: ['./snackbar.component.css'],
  standalone: true,
})
export class SnackbarComponent implements OnInit {
  message = '';
  type: string = 'info';
  visible = false;
  private timeout: any;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit() {
    this.snackbarService.message$.subscribe((msg: SnackbarMessage) => {
      this.message = msg.message;
      this.type = msg.type || 'info';
      this.visible = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.close(), msg.duration ?? 3000);
    });
  }

  close() {
    this.visible = false;
    clearTimeout(this.timeout);
  }
}
