import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerCareService  extends BaseService {
  public namespace = "customer_care";

  constructor(http: HttpClient) {
    super(http);
  }

  getQuestions(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "questions");
    return this.getApi(url, queryParams);
  }
}