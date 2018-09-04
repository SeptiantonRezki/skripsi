import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { AdminPrincipalService } from "../services/user-management/admin-principal.service";
import { Observable } from "rxjs";
import { FieldForceService } from "../services/user-management/field-force.service";

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
