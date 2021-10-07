import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerCareService extends BaseService {
  public namespace = "customer_care";

  constructor(http: HttpClient) {
    super(http);
  }

  getQuestions(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "questions");
    return this.getApi(url, queryParams);
  }

  getRecoveryInfo(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "recovery_info", context);
    return this.getApi(url);
  }

  setRecoveryDevice(context?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "recovery_info", context);
    return this.postApi(url, body);
  }

  // For Device Recovered Module Pages

  getDeviceRecovered(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "recovery_device_list")
    return this.getApi(url, queryParams);
  }

  getDeviceRecoverySettings(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "recovery_device_settings");
    return this.getApi(url, queryParams);
  }

  updateDeviceRecoverySettings(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "recovery_device_settings");
    return this.postApi(url, body);
  }

  exportListDeviceRecovered(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_recovery_device");
    return this.getBlobAsJsonApi(url, queryParams);
  }
  // End Device Recovered Module Pages
}