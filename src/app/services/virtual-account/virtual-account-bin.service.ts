import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VirtualAccountBinService extends BaseService {
  namespace = "virtual_account_bin";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  show(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'show', context);
    return this.getApi(url);
  }

  put(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.putApi(url, body);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  companiesList(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_companies', context);
    return this.getApi(url);
  }
  list(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'list', context);
    return this.getApi(url);
  }
}
