import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class PayLaterDeactivateService extends BaseService {
  namespace = "paylater_deactivate";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  history(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'history');
    return this.getApi(url, queryParams);
  }

  approval(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'approval', context);
    return this.putApi(url, body);
  }
}
