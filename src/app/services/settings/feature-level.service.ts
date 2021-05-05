import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { Observable } from '../../../../node_modules/rxjs';

@Injectable()
export class FeatureLevelService extends BaseService {
  public namespace = 'feature_level';
  constructor(http: HttpClient) {
    super(http);
  }

  list(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list');
    return this.getApi(url, queryParams);
  }
  getDetail(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', context);
    return this.getApi(url);
  }
  getAvailablePermissions(): Observable<any> {
    const url = this.getUrl(this.namespace, 'available_permissions');
    return this.getApi(url);
  }
  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }
  put(body?, id?): Observable<any> {
      const url = this.getUrl(this.namespace, 'put', {id});
      return this.putApi(url, body);
  }
  delete(id?): Observable<any> {
      const url = this.getUrl(this.namespace, 'delete', {id});
      return this.deleteApi(url);
  }

}
