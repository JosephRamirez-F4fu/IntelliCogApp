import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '@core/services/http-service';
import { EndPoints } from '@common/end-points';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./auth.css'],
  imports: [FormsModule], // Add FormsModule here

})
export class Register {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private httpService: HttpService, private router: Router) {}

  register(): void {
    if (this.password !== this.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    const body = {
      name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password,
      verify_password: this.confirmPassword
    };

    this.httpService.post(EndPoints.CREATE_USER, body).subscribe({
      next: (response: any) => {
        console.log('User registered successfully:', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error during registration:', error);
      }
    });
  }
}