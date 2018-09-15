import { Resolve } from "@angular/router";
import { Injectable } from "@angular/core";
import { AccessService } from "../services/settings/access.service";
import { Observable } from "rxjs";

@Injectable()
export class ListMenuResolver implements Resolve<any> {
  constructor(private accessService: AccessService) {}
  resolve(): Observable<any> {
    return this.accessService.getListMenu();
  }
}