import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoverService } from '../../services/recover-service';

@Component({
  selector: 'app-send-code',
  templateUrl: './index.html',
  styleUrls: ['./style.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SendCode {
  email = '';
  code = '';
  loading = false;
  message = '';
  resendLoading = false;
  resendMessage = '';

  constructor(private recoverService: RecoverService, private router: Router) {
    this.email = this.recoverService.email || '';
    if (!this.email) {
      this.router.navigate(['/recover-password']);
    }
  }

  verifyCode() {
    this.loading = true;
    this.recoverService.verifyRecoveryCode(this.email, this.code).subscribe({
      next: (res) => {
        this.recoverService.token = res.token;
        this.message = 'Código verificado. Puedes cambiar tu contraseña.';
        this.loading = false;
        this.router.navigate(['/change-password']);
      },
      error: () => {
        this.message = 'Código incorrecto o expirado.';
        this.loading = false;
      },
    });
  }

  resendCode() {
    this.resendLoading = true;
    this.resendMessage = '';
    this.recoverService.sendRecoveryEmail(this.email).subscribe({
      next: () => {
        this.resendMessage = 'Código reenviado a tu correo.';
        this.resendLoading = false;
      },
      error: () => {
        this.resendMessage = 'No se pudo reenviar el código.';
        this.resendLoading = false;
      },
    });
  }
}
