import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayLaterPanelService extends BaseService {
  namespace = "paylater_panel"
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  getMitra(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_mitra");
    return this.postApi(url, body, queryParams);
  }

  getSrc(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_src");
    return this.postApi(url, body, queryParams);
  }

  checkPanel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "check_panel");
    return this.postApi(url, body);
  }

  getCompaniesPanel(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "panel_companies");
    return this.getApi(url, queryParams);
  }

  exportPanel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_panel");
    return this.postBlobApi(url, body);
  }

  exportAllPanel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_all_panel");
    return this.postBlobApi(url, body);
  }

  store(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "store");
    return this.postApi(url, body);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "show", context);
    return this.getApi(url);
  }


  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }
}
