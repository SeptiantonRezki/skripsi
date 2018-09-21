import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class AudienceService extends BaseService {

  public namespace = "audience";
  
  constructor(http: HttpClient) { 
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  put(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getListAudience(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_scheduler');
    return this.getApi(url);
  }

  getListRetailer(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_retailer');
    return this.getApi(url, queryParams);
  }

  getListRetailerSelected(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', context);
    return this.getApi(url);
  }

  validateBudget(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'validate_budget');
    return this.postApi(url, body);
  }

  getListLevel(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_level");
    return this.getApi(url);
  }

  getListChildren(context): Observable<any> {
    const url = this.getUrl(this.namespace, "list_children", context);
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl(this.namespace, "list_other_children", context);
    return this.getApi(url);
  }
}
