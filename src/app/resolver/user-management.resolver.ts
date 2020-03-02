import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { AdminPrincipalService } from "../services/user-management/admin-principal.service";
import { Observable } from "rxjs";
import { FieldForceService } from "../services/user-management/field-force.service";
import { WholesalerService } from "../services/user-management/wholesaler.service";
import { PaguyubanService } from "app/services/user-management/paguyuban.service";
import { PanelMitraService } from "app/services/user-management/private-label/panel-mitra.service";
import { SupplierCompanyService } from "app/services/user-management/private-label/supplier-company.service";

@Injectable()
export class ListRoleAdminResolver implements Resolve<any> {
  constructor(private adminPrincipal: AdminPrincipalService) {}
  resolve(): Observable<any> {
    return this.adminPrincipal.getListRole();
  }
}

@Injectable()
export class ListLevelFFResolver implements Resolve<any> {
  constructor(private fieldForcePrincipal: FieldForceService) {}
  resolve(): Observable<any> {
    return this.fieldForcePrincipal.getListLevel();
  }
}

@Injectable()
export class ListLevelAreaResolver implements Resolve<any>{
  constructor(private wholesalerService: WholesalerService){}
  resolve(): Observable<any> {
    return this.wholesalerService.getListLevel();
  }
}
@Injectable()
export class ListAdminPrincipalResolver implements Resolve<any> {
  constructor(private paguyubanService: PaguyubanService){}
  resolve(): Observable<any> {
    return this.paguyubanService.getListAdminPrincipal({});
  }
}
@Injectable()
export class ListCategoryProdukResolver implements Resolve<any> {
  constructor(private panelMitraService: PanelMitraService) {}
  resolve(): Observable<any> {
    return this.panelMitraService.getListCategory();
  }
}
@Injectable()
export class ListSupplierCompanyResolver implements Resolve<any> {
  constructor(private supplierCompanyService: SupplierCompanyService) {}
  resolve(): Observable<any> {
    return this.supplierCompanyService.getList();
  }
}