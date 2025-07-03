import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '@core/services/http-service';
import { HttpParams } from '@angular/common/http';
import { EndPoints } from '@common/end-points';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { NgOptimizedImage } from '@angular/common';
import { SnackbarService } from '@core/services/snackbar-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true, // Mark as standalone
  imports: [FormsModule, RouterModule, NgOptimizedImage], // Add FormsModule here
  templateUrl: './login.html',
  styleUrls: ['../../auth.css'],
})
export class Login {
  username: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private httpService: HttpService,
    private authService: AuthService, // <--- añade esto
    private router: Router,
    private snackbar: SnackbarService
  ) {}

  login(): void {
    if (!this.username || !this.password) {
      this.snackbar.show(
        'Por favor, ingrese su usuario y contraseña',
        'error',
        4000
      );
      return; // Prevent login if fields are empty
    }

    this.loading = true;
    const body = new HttpParams()
      .set('username', this.username)
      .set('password', this.password);

    this.httpService
      .post(EndPoints.LOGIN, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      })
      .subscribe({
        next: (response: any) => {
          const token = response.access_token;
          this.authService.setToken(token);
          this.loading = false;
          this.snackbar.show('Acceso exitoso', 'success', 4000);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.log('Login error:', error.status);
          if (error.status === HttpService.UNAUTHORIZED) {
            this.snackbar.show('Contraseña Incorrecta', 'error', 4000);
          } else if (error.status == HttpService.NOT_FOUND) {
            this.snackbar.show('Usuario no encontrado', 'error', 4000);
          } else {
            this.snackbar.show('An error occurred during login', 'error', 4000);
          }
        },
      });
  }
}
