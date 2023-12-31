import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayLaterDistributionListService extends BaseService {
  namespace = "distribution_list"
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }
  create(body?): Observable<any> {
      const url = this.getUrl(this.namespace, "create");
      return this.postApi(url, body);
  }
  delete(context?): Observable<any> {
      const url = this.getUrl(this.namespace, "delete", context);
      return this.deleteApi(url);
  }
  autocomplete(queryParams?): Observable<any> {
      const url = this.getUrl(this.namespace, "autocomplete");
      return this.getApi(url, queryParams);
  }

}
