import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '@core/services/http-service';
import { EndPoints } from '@common/end-points';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NotifyOptions } from '@core/models/app-error';
import { SnackbarService } from '@core/services/snackbar-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['../../auth.css'],
  imports: [FormsModule, RouterModule, NgOptimizedImage, CommonModule], // Add FormsModule here
})
export class Register {
  firstName: string = '';
  lastName: string = '';
  speciality: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  especialities = ['Endocrinología', 'Neurología', 'Psiquiatría', 'Geriatría'];

  snackbar: NotifyOptions = {
    error: '',
    success: 'Usuario registrado correctamente',
    successType: 'success',
    errorType: 'error',
    duration: 4000,
  };

  constructor(
    private httpService: HttpService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  register(): void {
    if (this.password !== this.confirmPassword) {
      this.snackbarService.show('Las contraseñas no coinciden', 'error', 4000);
      return;
    }
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.snackbarService.show(
        'Por favor completa todos los campos',
        'error',
        4000
      );
      return;
    }

    const body = {
      name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      especiality: this.speciality,
      password: this.password,
      verify_password: this.confirmPassword,
    };

    this.httpService
      .post(EndPoints.CREATE_USER, body, this.snackbar)
      .subscribe({
        next: (response: any) => {
          console.log('User registered successfully:', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          if (error.status == HttpService.CONFLICT) {
            this.snackbarService.show(
              'El correo electrónico ya está en uso',
              'error',
              4000
            );
          }
          if (error.status == HttpService.BAD_REQUEST) {
            this.snackbarService.show(
              'Por favor completa todos los campos correctamente',
              'error',
              4000
            );
          }
        },
      });
  }
}
