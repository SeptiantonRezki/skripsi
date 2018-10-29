import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CustomerService extends BaseService {
  public namespace = "customer";

  constructor(http: HttpClient) { 
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  getDetail(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", context);
    return this.getApi(url);
  }
}
