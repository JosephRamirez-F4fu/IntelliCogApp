import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EndPoints } from '@common/end-points';

@Injectable({ providedIn: 'root' })
export class RecoverService {
  constructor(private http: HttpClient) {}
  private RECOVER_TOKEN = 'recover_token';
  private EMAIL_KEY = 'recover_email';

  get email(): string | null {
    return sessionStorage.getItem(this.EMAIL_KEY);
  }

  set email(value: string | null) {
    if (value) {
      sessionStorage.setItem(this.EMAIL_KEY, value);
    } else {
      sessionStorage.removeItem(this.EMAIL_KEY);
    }
  }

  get token(): string | null {
    return sessionStorage.getItem(this.RECOVER_TOKEN);
  }

  set token(value: string | null) {
    if (value) {
      sessionStorage.setItem(this.RECOVER_TOKEN, value);
    } else {
      sessionStorage.removeItem(this.RECOVER_TOKEN);
    }
  }
  /**
   * Envía el email para iniciar el proceso de recuperación (envía código al correo)
   */
  sendRecoveryEmail(email: string): Observable<any> {
    this.email = email; // Guardar el email para usarlo en otros métodos
    return this.http.post(EndPoints.RECOVER_PASSWORD, { email });
  }

  /**
   * Verifica el código recibido en el email (obtiene el token)
   */
  verifyRecoveryCode(email: string, code: string): Observable<any> {
    return this.http.post(EndPoints.RECOVER_PASSWORD_CONFIRM, { email, code });
  }

  /**
   * Envía el token, la nueva contraseña y la verificación de la contraseña
   */
  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {
    return this.http.post(EndPoints.CHANGE_PASSWORD_AUTH, {
      token,
      new_password: newPassword,
      verify_new_password: confirmPassword,
    });
  }
}
