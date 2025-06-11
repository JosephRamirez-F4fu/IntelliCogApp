// This service is for reference only and demonstrates how to
// create the other services in the application. This service
// and its references in common/end-points.ts can be deleted.

import { inject, Injectable } from '@angular/core';
import { HttpService } from '@core/services/http-service';
import { Observable } from 'rxjs';
import { EndPoints } from '@common/end-points';

// Create in the specific folder of the feature models
interface Example {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExampleService {

  private httpService: HttpService = inject(HttpService);

  create(example: Example): Observable<Example> {
    return this.httpService.post(EndPoints.EXAMPLES, example);
  }

  getById(exampleId: string): Observable<Example> {
    return this.httpService.get(EndPoints.EXAMPLES + '/' + exampleId)
  }

  getAll(): Observable<Example[]> {
    return this.httpService.get(EndPoints.EXAMPLES);
  }

  update(exampleId: string, example: Example): Observable<Example> {
    return this.httpService
      .successful()
      .put(EndPoints.EXAMPLES + '/' + exampleId, example);
  }

  delete(exampleId: string): Observable<Example> {
    return this.httpService
      .successful()
      .delete(EndPoints.EXAMPLES + '/' + exampleId);
  }
}
