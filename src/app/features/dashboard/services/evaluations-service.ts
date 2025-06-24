import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http-service';
import { EndPoints } from '@common/end-points';

// Modelos TypeScript equivalentes a tus schemas de Python
export interface ClinicDataModel {
  adl?: number;
  iadl?: number;
  berg?: number;
  vitamin_d?: number;
  vit_b12?: number;
  potassium?: number;
  stress?: boolean;
}

export interface ClinicResultsModel {
  description: string;
}

export interface EvaluationModel {
  id?: number;
  manual_classification?: string; // Ajusta el tipo según tu Enum
  model_classification?: string; // Ajusta el tipo según tu Enum
  model_probability?: number;
  modality?: string;
  patient_id?: number;
  patient?: {
    dni?: string;
    name?: string;
    last_name?: string;
    age?: number;
    sex?: string;
  };
  created_at?: string;
}

export interface filterParams {
  dni?: string;
  full_name?: string;
  modality?: string;
  skip?: number;
  limit?: number;
}

@Injectable()
export class EvaluationsService {
  constructor(private http: HttpService) {}

  // Evaluations
  createEvaluationOfPatient(
    patientId: number,
    data: EvaluationModel
  ): Observable<any> {
    return this.http.post(
      `${EndPoints.EVALUATIONS}/patient/${patientId}`,
      data
    );
  }

  getEvaluationsFiltered(params: filterParams) {
    const queryParams = new URLSearchParams();
    if (params.dni) queryParams.append('dni', params.dni);
    if (params.full_name) queryParams.append('full_name', params.full_name);
    if (params.modality) queryParams.append('modality', params.modality);

    if (params.skip !== undefined)
      queryParams.append('skip', params.skip.toString());
    if (params.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    const res = this.http.get(
      `${EndPoints.EVALUATIONS}?${queryParams.toString()}`
    );
    return res;
  }

  getEvaluation(evaluationId: number): Observable<EvaluationModel> {
    return this.http.get(`${EndPoints.EVALUATIONS}/${evaluationId}`);
  }

  deleteEvaluation(evaluationId: number): Observable<any> {
    return this.http.delete(`${EndPoints.EVALUATIONS}/${evaluationId}`);
  }

  // Clinic Data
  createClinicData(
    evaluationId: number,
    data: ClinicDataModel
  ): Observable<any> {
    return this.http.post(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_data`,
      data
    );
  }

  getClinicDataByEvaluation(evaluationId: number): Observable<ClinicDataModel> {
    return this.http.get(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_data`
    );
  }

  updateClinicData(
    evaluationId: number,
    data: ClinicDataModel
  ): Observable<any> {
    return this.http.put(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_data`,
      data
    );
  }

  deleteClinicData(evaluationId: number): Observable<any> {
    return this.http.delete(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_data`
    );
  }

  // MRI Image
  createMriImage(evaluationId: number, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagefile', imageFile);
    return this.http.post(
      `${EndPoints.EVALUATIONS}/${evaluationId}/mri_image`,
      formData
    );
  }

  getMriImageByEvaluation(evaluationId: number): Observable<any> {
    return this.http.get(`${EndPoints.EVALUATIONS}/${evaluationId}/mri_image`);
  }

  updateMriImage(evaluationId: number, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagefile', imageFile);
    return this.http.put(
      `${EndPoints.EVALUATIONS}/${evaluationId}/mri_image`,
      formData
    );
  }

  deleteMriImage(evaluationId: number): Observable<any> {
    return this.http.delete(
      `${EndPoints.EVALUATIONS}/${evaluationId}/mri_image`
    );
  }

  // Clinic Results
  createClinicResults(
    evaluationId: number,
    data: ClinicResultsModel
  ): Observable<any> {
    return this.http.post(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_results`,
      data
    );
  }

  getClinicResultsByEvaluation(
    evaluationId: number
  ): Observable<ClinicResultsModel> {
    return this.http.get(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_results`
    );
  }

  updateClinicResults(
    evaluationId: number,
    data: ClinicResultsModel
  ): Observable<any> {
    return this.http.put(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_results`,
      data
    );
  }

  deleteClinicResults(evaluationId: number): Observable<any> {
    return this.http.delete(
      `${EndPoints.EVALUATIONS}/${evaluationId}/clinic_results`
    );
  }

  updateEvalution(
    evaluationId: number,
    data: EvaluationModel
  ): Observable<any> {
    return this.http.put(`${EndPoints.EVALUATIONS}/${evaluationId}`, data);
  }

  sendPatientEvaluationPdfByEmail(
    patientId: number,
    evaluationId: number | null,
    email: string
  ): Observable<any> {
    const params = new URLSearchParams();
    if (evaluationId !== null && evaluationId !== undefined) {
      params.append('evaluation_id', evaluationId.toString());
    }
    params.append('send_email', 'true');
    params.append('email', email);

    return this.http.get(
      `${EndPoints.EVALUATIONS_PDF.replace(
        '{patient_id}',
        patientId.toString()
      )}?${params.toString()}`
    );
  }
  downloadPatientEvaluationPdf(
    patientId: number,
    evaluationId: number | null = null
  ): Observable<Blob> {
    const params = new URLSearchParams();
    if (evaluationId !== null && evaluationId !== undefined) {
      params.append('evaluation_id', evaluationId.toString());
    }
    // No se envía send_email ni email
    return this.http
      .pdf()
      .get(
        `${EndPoints.EVALUATIONS_PDF.replace(
          '{patient_id}',
          patientId.toString()
        )}?${params.toString()}`
      );
  }
}
