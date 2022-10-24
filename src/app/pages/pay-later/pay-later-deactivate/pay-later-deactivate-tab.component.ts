import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-pay-later-deactivate-tab',
  templateUrl: './pay-later-deactivate-tab.component.html',
  styleUrls: ['./pay-later-deactivate-tab.component.scss']
})
export class PayLaterDeactivateTabComponent implements OnInit {
  selectedTab: any;

  constructor(
    private dataService: DataService
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab_paylater_deactivate");
    // this.selectedTab = selectedTab ? selectedTab : 0;
    this.selectedTab = 0;
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
    this.dataService.setToStorage("selected_tab_paylater_deactivate", this.selectedTab);
  }

}
