import { environment } from '@env/environment';

export class EndPoints {
  // AUTH ENDPOINTS
  static EXAMPLES = environment.REST + '/examples';
  static CREATE_USER = environment.REST + '/auth/register';
  static LOGIN = environment.REST + '/auth/token';
  static LOGOUT = environment.REST + '/auth/logout';
  static RECOVER_PASSWORD = environment.REST + '/auth/recover';
  static RECOVER_PASSWORD_CONFIRM = environment.REST + '/auth/recover/confirm';
  static CHANGE_PASSWORD_AUTH = environment.REST + '/auth/change-password';
  static REFRESH = environment.REST + '/auth/refresh';
  // USER ENDPOINTS
  static USER = environment.REST + '/users';
  static USER_CHANGE_PASSWORD = environment.REST + '/users/password';
  static SEND_SUPORT_EMAIL = environment.REST + '/users/support-teacnical';
  // PATIENTS ENDPOINTS
  static PATIENTS = environment.REST + '/patients';
  static PATIENTS_ID = environment.REST + '/patients/dni';
  static PATIENTS_COMORBIDITIES =
    environment.REST + `/patients/{patient_id}/comorbidities`;
  // EVALUATION ENDPOINTS
  static EVALUATIONS_PATIENT = environment.REST + '/evaluations/patient/';
  static EVALUATIONS = environment.REST + '/evaluations';
  static EVALUEATIONS_CLINIC_DATA =
    environment.REST + '/evaluations/{evaluation_id}/clinic_data';
  static EVALUATIONS_MRI_IMAGE =
    environment.REST + '/evaluations/{evaluation_id}/mri_image';
  static EVALUATIONS_CLINIC_RESULTS =
    environment.REST + '/evaluations/{evaluation_id}/clinic_results';
  static EVALUATIONS_PDF =
    environment.REST + '/evaluations/patient/{patient_id}/evaluations/pdf';

  // model ENDPOINTS
  static RUN_MODEL_RF = environment.RESTMODEL + '/rf/evaluation';
  static RUN_MODEL_CNN = environment.RESTMODEL + '/cnn/evaluation';
}
