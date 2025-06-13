import { environment } from '@env/environment';

export class EndPoints {
  // AUTH ENDPOINTS
  static EXAMPLES = environment.REST + '/examples';
  static CREATE_USER = environment.REST + "/auth/register";
  static LOGIN = environment.REST + "/auth/token";
  static LOGOUT = environment.REST + "/auth/logout";
  static RECOVER_PASSWORD = environment.REST + "auth/recover"
  static RESET_PASSWORD = environment.REST + "auth/reset";
  // USER ENDPOINTS
  static USER = environment.REST + "/users";
  static USER_CHANGE_PASSWORD = environment.REST + "/users/password";
  // PATIENTS ENDPOINTS
  static PATIENTS = environment.REST + "/patients";
  static PATIENTS_COMORBIDITIES = environment.REST + `/patients/{patient_id}/comorbidities`;
  // EVALUATION ENDPOINTS
  static EVALUATIONS_PATIENT = environment.REST + "/evaluations/patient/";
  static EVALUATIONS = environment.REST + "/evaluations";
  static EVALUEATIONS_CLINIC_DATA = environment.REST + "/evaluations/{evaluation_id}/clinic_data";
  static EVALUATIONS_MRI_IMAGE = environment.REST + "/evaluations/{evaluation_id}/mri_image";
  static EVALUATIONS_CLINIC_RESULTS = environment.REST + "/evaluations/{evaluation_id}/clinic_results";

}
