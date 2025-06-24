import { Component } from '@angular/core';
import { SnackbarService } from '@core/services/snackbar-service';
import { UserService } from '../../services/user-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-technical-support',
  imports: [FormsModule, CommonModule],
  templateUrl: './technical-support.html',
  styleUrl: './technical-support.css',
  providers: [UserService, SnackbarService],
})
export class TechnicalSupport {
  titulo = '';
  descripcion = '';
  loading = false;
  constructor(
    private userService: UserService,
    private snackbar: SnackbarService
  ) {}

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.titulo.trim() || !this.descripcion.trim()) {
      this.snackbar.show('Completa todos los campos', 'warning');
      return;
    }
    this.loading = true;
    this.userService
      .sendEmailToTechnicalSupport({
        asunto: this.titulo,
        texto: this.descripcion,
      })
      .subscribe({
        next: () => {
          this.snackbar.show('Consulta enviada correctamente', 'success');
          this.titulo = '';
          this.descripcion = '';
          this.loading = false;
        },
        error: () => {
          this.snackbar.show('Error al enviar la consulta', 'error');
          this.loading = false;
        },
      });
  }
}
