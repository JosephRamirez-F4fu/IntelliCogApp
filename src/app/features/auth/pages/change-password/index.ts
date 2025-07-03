import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoverService } from '../../services/recover-service';

@Component({
  selector: 'app-change-password',
  templateUrl: './index.html',
  styleUrls: ['./style.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ChangePassword {
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  message = '';
showNewPassword = false;
  constructor(private recoverService: RecoverService, private router: Router) {
    this.token = this.recoverService.token || '';
    if (!this.token) {
      // Si no hay token, redirige al paso anterior
      this.router.navigate(['/auth/send-code']);
    }
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }
    this.loading = true;
    this.recoverService
      .resetPassword(this.token, this.newPassword, this.confirmPassword)
      .subscribe({
        next: () => {
          this.message = 'Contraseña cambiada correctamente.';
          this.loading = false;
        },
        error: () => {
          this.message = 'No se pudo cambiar la contraseña. Intenta de nuevo.';
          this.loading = false;
        },
      });
  }
}
