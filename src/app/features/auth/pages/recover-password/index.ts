import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoverService } from '../../services/recover-service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './index.html',
  styleUrls: ['./style.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RecoverPassword {
  email = '';
  loading = false;
  message = '';

  constructor(private recoverService: RecoverService, private router: Router) {
    // Si ya hay email guardado, lo muestra
    this.email = this.recoverService.email || '';
  }

  sendEmail() {
    this.loading = true;
    this.recoverService.sendRecoveryEmail(this.email).subscribe({
      next: () => {
        this.message = 'Código enviado a tu correo.';
        this.loading = false;
        // Guarda el email y navega al siguiente paso
        this.recoverService.email = this.email;
        this.router.navigate(['/send-code']);
      },
      error: () => {
        this.message = 'No se pudo enviar el código. Verifica tu correo.';
        this.loading = false;
      },
    });
  }
}
