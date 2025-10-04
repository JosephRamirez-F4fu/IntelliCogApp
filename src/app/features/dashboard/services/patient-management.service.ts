import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http-service';
import { EndPoints } from '@common/end-points';

export interface PatientModel {
  id?: number;
  dni: string;
  name: string;
  last_name: string;
  sex: string;
  age: number;
}

@Injectable()
export class PatientManagementService {
  constructor(private http: HttpService) {}

  // Crear paciente (con o sin comorbilidades)
  createPatient(patient: PatientModel): Observable<any> {
    return this.http.post(EndPoints.PATIENTS, patient);
  }

  // Editar paciente (con o sin comorbilidades)
  updatePatient(id: number, patient: PatientModel): Observable<any> {
    return this.http.put(`${EndPoints.PATIENTS}/${id}`, patient);
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${EndPoints.PATIENTS}/${id}`);
  }

  // Obtener todos los pacientes
  getPatients(): Observable<PatientModel[]> {
    return this.http.get(EndPoints.PATIENTS);
  }

  getPatientsByDni(dni: string): Observable<PatientModel> {
    return this.http.get(`${EndPoints.PATIENTS}/dni/${dni}`);
  }

  // Obtener un paciente por ID
  getPatient(id: number): Observable<PatientModel> {
    return this.http.get(`${EndPoints.PATIENTS}/${id}`);
  }

  // patient-management.service.ts
  getPatientsFiltered(params: {
    full_name?: string;
    dni?: string;
    skip?: number;
    limit?: number;
  }): Observable<PatientModel[]> {
    const query = new URLSearchParams();
    if (params.full_name) query.append('full_name', params.full_name);
    if (params.dni) query.append('dni', params.dni);
    if (params.skip !== undefined) query.append('skip', params.skip.toString());
    if (params.limit !== undefined)
      query.append('limit', params.limit.toString());
    return this.http.get(`${EndPoints.PATIENTS}?${query.toString()}`);
  }
}
