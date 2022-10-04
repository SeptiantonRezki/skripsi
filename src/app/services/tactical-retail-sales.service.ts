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

  getProposal(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal");
    return this.getApi(url, queryParams);
  }

  putProposal(body): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal");
    return this.postApi(url, body);
  }

  getProposalDetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal_detail", { id: id });
    return this.getApi(url);
  }

  putProposalDetail(body, id): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal_detail", { id: id });
    return this.postApi(url, body);
  }

  cancelProposal(body, id): Observable<any> {
    const url = this.getUrl(this.namespace, "cancel_proposal", { id: id });
    return this.postApi(url, body);
  }

  getCustName(id): Observable<any> {
    const url = this.getUrl(this.namespace, "customer_name", {id:id});
    return this.getApi(url);
  }

  getExecutor(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_executor");
    return this.getApi(url, queryParams);
  }

  getKecamatan(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_kecamatan");
    return this.getApi(url, queryParams);
  }

  getProduct(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_product");
    return this.getApi(url, queryParams);
  }

  getArea(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_area");
    return this.getApi(url, queryParams);
  }

  getAreaByUser(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_area_by_user");
    return this.getApi(url, queryParams);
  }


  exportProposalNew(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_proposal_new");
    return this.getBlobApi(url, queryParams);
  }

  getProposalSummary(id): Observable<any> {
    const url = this.getUrl(this.namespace, "proposal_summary", { id: id });
    return this.getApi(url);
  }





  getParentArea(context?): Observable<any> {
    const url = this.getUrl("general", "parent_by_code", context);
    return this.getApi(url);
  }

  getListLevel(): Observable<any> {
    const url = this.getUrl("general", "list_level");
    return this.getApi(url);
  }

  getListChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_children", context);
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_other_children", context);
    return this.getApi(url);
  }

  getBusinessDetail(context?): Observable<any> {
    const url = this.getUrl("general", "get_business", context);
    return this.getApi(url);
  }



  exportWholesalerlist(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "exportWhosaller", context);
    return this.getBlobApi(url);
  }

  exportWholesalerNew(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "exportWholesaller", body);
    // return this.getBlobApi(url, queryParams);
    return this.postBlobApi(url, body);
  }
  
  importExcel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_preview");
    return this.multipartPost(url, body);
  }
  
  storeImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "store_import");
    return this.postApi(url, body);
  }
  getWsRoles(): Observable<any> {
    const url = this.getUrl(this.namespace, "roles");
    return this.getApi(url);
  }

  showKtp(body): Observable<any> {
    const url = this.getUrl(this.namespace, "show_ktp");
    return this.postBlobAsJsonApi(url, body);
  }

  showNpwp(body): Observable<any> {
    const url = this.getUrl(this.namespace, "show_npwp");
    return this.postBlobAsJsonApi(url, body);
  }

  showDocumentOrder(body): Observable<any> {
    const url = this.getUrl(this.namespace, "show_document_order");
    return this.postBlobAsJsonApi(url, body);
  }




}
