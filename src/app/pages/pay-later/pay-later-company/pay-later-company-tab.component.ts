import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pay-later-company-tab',
  templateUrl: './pay-later-company-tab.component.html',
  styleUrls: ['./pay-later-company-tab.component.scss']
})
export class PayLaterCompanyTabComponent implements OnInit {
  selectedTab: any;

  constructor(
    private dataService: DataService,
    private router: Router,
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab_paylater_company");
    // this.selectedTab = selectedTab ? selectedTab : 0;
    // this.selectedTab = 0;
    if (this.router.routerState.root.queryParams['value'].type === "kur") {
      this.selectedTab = 2;
    } else if (this.router.routerState.root.queryParams['value'].type === "retailer-financing") {
      this.selectedTab = 1;
    } else {
      this.selectedTab = 0;
    }
  }

  ngOnInit() {
    
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page_invoice");
    window.localStorage.removeItem("sort_invoice");
    window.localStorage.removeItem("sort_type_invoice");

    window.localStorage.removeItem("page_retailer");
    window.localStorage.removeItem("sort_retailer");
    window.localStorage.removeItem("sort_type_retailer");

    window.localStorage.removeItem("page_kur");
    window.localStorage.removeItem("sort_kur");
    window.localStorage.removeItem("sort_type_kur");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab_paylater_company", this.selectedTab);
  }

}
