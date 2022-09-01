import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TacticalRetailSalesService extends BaseService {
  public namespace = "tactical_retail_sales";

  constructor(http: HttpClient) {
    super(http);
  }

  getSysVar(): Observable<any> {
    const url = this.getUrl(this.namespace, "sysvar");
    return this.getApi(url);
  }

  putSysVar(body): Observable<any> {
    const url = this.getUrl(this.namespace, "sysvar");
    return this.postApi(url, body);
  }

  getProposal(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal");
    return this.getApi(url, queryParams);
  }
  putProposal(body): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal");
    return this.postApi(url, body);
  }

  getProposalDetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal_detail", { product_id: id });
    return this.getApi(url);
  }

  putProposalDetail(body): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal_detail");
    return this.postApi(url, body);
  }

}
