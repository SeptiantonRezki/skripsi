import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { VirtualAccountPanelService } from "app/services/virtual-account/virtual-account-panel.service";

import { Observable } from "rxjs";

@Injectable()
export class VirtualAccountListResolver implements Resolve<any> {
  constructor(
      private VirtualAccountPanelService: VirtualAccountPanelService,
      ) { }
  resolve(): Observable<any> {
    return this.VirtualAccountPanelService.getCompaniesPanel()
  }
}