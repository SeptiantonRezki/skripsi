import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PengajuanSrcService extends BaseService {
  public namespace = "pengajuan_src";

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

  put(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.postApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

}
