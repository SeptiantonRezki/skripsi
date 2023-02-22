import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PojokUntungTemplateService extends BaseService {
  namespace = "pojok_untung_template"
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  store(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'store');
    return this.postApi(url, body);
  }
  
}
