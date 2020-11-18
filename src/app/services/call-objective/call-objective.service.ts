import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class CallObjectiveSerive extends BaseService {

  public namespace = 'callObjective';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }
  getById(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_by_id', context);
    return this.getApi(url);
  }
  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }
  put(body, context): Observable<any> {
    console.log('nyampe service', context);
    const url = this.getUrl(this.namespace, 'put', context);
    return this.putApi(url, body);
  }

//   put(body, context): Observable<any> {
//     const url = this.getUrl(this.namespace, 'put', context);
//     return this.postApi(url, body);
//   }

//   delete(context): Observable<any> {
//     const url = this.getUrl(this.namespace, 'delete', context);
//     return this.deleteApi(url);
//   }
}
