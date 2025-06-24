import { inject } from '@angular/core';
import { HttpService } from '@core/services/http-service';
import { Observable } from 'rxjs';
import { EndPoints } from '@common/end-points';

export interface User {
  name: string;
  last_name: string;
  email: string;
  speciality: string;
}

export interface CorreoTecnico {
  asunto: string;
  texto: string;
}

export class UserService {
  private httpService: HttpService = inject(HttpService);
  public user!: User;

  getUser(): Observable<User> {
    return this.httpService.get(EndPoints.USER);
  }

  updateUser(user: User): Observable<User> {
    return this.httpService.put(EndPoints.USER, user);
  }
  deleteUser(): Observable<void> {
    return this.httpService.delete(EndPoints.USER);
  }
  changePassword(
    oldPassword: string,
    newPassword: string,
    verify_new_password: string
  ): Observable<void> {
    const body = {
      old_password: oldPassword,
      new_password: newPassword,
      verify_new_password: verify_new_password,
    };
    return this.httpService.put(EndPoints.USER_CHANGE_PASSWORD, body);
  }

  sendEmailToTechnicalSupport(correoTecnico: CorreoTecnico): Observable<void> {
    return this.httpService.post(EndPoints.SEND_SUPORT_EMAIL, correoTecnico);
  }
}
