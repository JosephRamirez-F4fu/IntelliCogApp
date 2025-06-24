import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http-service';
import { EndPoints } from '@common/end-points';

@Injectable()
export class ModelService {
  constructor(private http: HttpService) {}

  runRandomForestEvaluation(evaluation_id: number): Observable<any> {
    return this.http.get(EndPoints.RUN_MODEL_RF + `/${evaluation_id}`);
  }

  runCnnEvaluation(evalutaion_id: any): Observable<any> {
    return this.http.get(EndPoints.RUN_MODEL_CNN + `/${evalutaion_id}`);
  }
}
