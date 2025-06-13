import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../core/services/http-service';
import { HttpParams } from '@angular/common/http';
import { EndPoints } from '@common/end-points';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-login',
  standalone: true, // Mark as standalone
  imports: [FormsModule], // Add FormsModule here
  templateUrl: './login.html',
  styleUrls: ['./auth.css']
})
export class Login {
  username: string = '';
  password: string = '';

  constructor(private httpService: HttpService, private router: Router) {}

  login(): void {
    const body = new HttpParams()
      .set('username', this.username)
      .set('password', this.password);

    this.httpService.post(EndPoints.LOGIN, body, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .subscribe({
        next: (response: any) => {
          const token = response.access_token; // Adjusted to match the API response structure
          this.httpService.setToken(token);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error during login:', error);
        }
      });
  }
}