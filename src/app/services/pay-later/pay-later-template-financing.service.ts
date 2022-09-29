import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayLaterTemplateFinancingService extends BaseService {
  namespace = "paylater_template_financing"
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  show(context, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show', context);
    return this.getApi(url, queryParams);
  }

  update(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'update');
    return this.postApi(url, body);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  // autocomplete(queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "autocomplete");
  //   return this.getApi(url, queryParams);
  // }

}
