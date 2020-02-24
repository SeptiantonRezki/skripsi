import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MitraPanelService extends BaseService {
  namespace = "mitra_panel";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  getMitraList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "mitra_list");
    return this.getApi(url, queryParams);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "show", context);
    return this.getApi(url, {});
  }

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  update(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "update", context);
    return this.postApi(url, body);
  }

  export(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
    return this.postBlobApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  importFile(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'import');
    return this.postApi(url, body);
  }

  previewImport(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "preview_import");
    return this.getApi(url, queryParams);
  }

  courierList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "courier_list");
    return this.getApi(url, queryParams);
  }

  courierServiceList(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "courier_service", context);
    return this.getApi(url, queryParams);
  }
}
