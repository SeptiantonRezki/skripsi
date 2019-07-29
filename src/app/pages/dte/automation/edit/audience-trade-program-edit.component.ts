import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-audience-trade-program-edit',
  templateUrl: './audience-trade-program-edit.component.html',
  styleUrls: ['./audience-trade-program-edit.component.scss']
})
export class AudienceTradeProgramEditComponent {
  selectedTab: any;
  detailAutomation: any;
  automationType: String;
  onDetail: Boolean;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute
  ) {
    this.detailAutomation = dataService.getFromStorage("detail_dte_automation");
    activatedRoute.url.subscribe(params => {
      this.onDetail = params[1].path === 'detail' ? true : false;
    });
    switch (this.detailAutomation.type) {
      case "e-order":
        dataService.setToStorage("selected_tab", 0);
        this.automationType = "e-order";
        break;
      case "coupon":
        dataService.setToStorage("selected_tab", 1);
        this.automationType = "coupon";
        break;
      default:
        dataService.setToStorage("selected_tab", 2);
        this.automationType = "referral_code";
    }
    const selectedTab = dataService.getFromStorage("selected_tab");
    this.selectedTab = selectedTab ? selectedTab : 0;
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page");
    window.localStorage.removeItem("sort");
    window.localStorage.removeItem("sort_type");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab", this.selectedTab);
  }

}
