import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OTPSettingService extends BaseService {
  namespace = "otp_settings"
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  update(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'update');
    return this.postApi(url, body);
  }
}
