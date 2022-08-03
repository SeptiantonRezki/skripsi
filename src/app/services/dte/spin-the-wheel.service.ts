import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class SpinTheWheelService extends BaseService {
  public namespace = "spin_the_wheel";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  create(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  checkAudience(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'check_audience');
    return this.postApi(url, body);
  }

  saveAudience(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'save_audience');
    return this.postApi(url, body);
  }

  put_spin(context: any, body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update_spin", context);
    return this.postApi(url, body);
  }
  
  put_preview(context: any, body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update_preview", context);
    return this.postApi(url, body);
  }
  
  saveSettings(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "save_settings");
    return this.postApi(url, body);
  }

  showAudience(context: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'show_audience', {id: context});
    return this.getApi(url);
  }
}
