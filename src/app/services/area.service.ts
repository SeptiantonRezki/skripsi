import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { HttpClient } from "../../../node_modules/@angular/common/http";
import { Observable } from "../../../node_modules/rxjs";

@Injectable()
export class AreaService extends BaseService {
  public namespace = "area";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  export(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
    return this.postBlobApi(url, body);
  }

  import(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import");
    return this.postApi(url, body);
  }
}
