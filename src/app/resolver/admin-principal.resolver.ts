import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { AdminPrincipalService } from "../services/admin-principal.service";
import { Observable } from "rxjs";

@Injectable()
export class ListRoleAdminResolver implements Resolve<any> {
  constructor(private adminPrincipal: AdminPrincipalService) {}
  resolve(): Observable<any> {
    return this.adminPrincipal.getListRole();
  }
}
