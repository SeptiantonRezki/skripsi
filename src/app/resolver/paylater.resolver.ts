import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { PayLaterPanelService } from "app/services/pay-later/pay-later-panel.service";

import { Observable } from "rxjs";

@Injectable()
export class PaylaterListCompanyResolver implements Resolve<any> {
  constructor(
      private paylaterPanelService: PayLaterPanelService,
      ) { }
  resolve(): Observable<any> {
    return this.paylaterPanelService.getCompaniesPanel()
  }
}