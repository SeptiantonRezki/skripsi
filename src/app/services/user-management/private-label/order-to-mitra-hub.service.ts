import { Injectable } from "@angular/core";
import { BaseService } from "../../base.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderToMitraHubService extends BaseService {
  public namespace = "PLOrdertoMitraHub";

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getList");
    return this.getApi(url, queryParams);
  }

  export(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
    return this.postBlobAsJsonApi(url, queryParams);
  }
}
