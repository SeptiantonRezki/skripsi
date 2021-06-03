import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class PayLaterDeactivateService extends BaseService {
  namespace = "paylater_deactivate";
  protected _triggerActivationSRC = new Subject();
  public triggerActivationSRC = this._triggerActivationSRC.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  history(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'history');
    return this.getApi(url, queryParams);
  }

  approval(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'approval', context);
    return this.putApi(url, body);
  }

  getActivationMitra(queryParams?): Observable<any> {
    const url = this.getUrl("paylater_activate", 'activate_mitra');
    return this.getApi(url, queryParams);
  }

  getActivateSRC(queryParams?): Observable<any> {
    const url = this.getUrl("paylater_activate", 'activate_src');
    return this.getApi(url, queryParams);
  }

  refreshActivationSRC(event) {
    this._triggerActivationSRC.next(event);
  }

  export(queryParams?): Observable<any> {
    const url = this.getUrl("paylater_activate", 'export');
    return this.getBlobAsJsonApi(url, queryParams);
  }
  
}
