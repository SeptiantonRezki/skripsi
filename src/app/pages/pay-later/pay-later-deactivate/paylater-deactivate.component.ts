import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-pay-later-deactivate',
  templateUrl: './paylater-deactivate-component.html',
  styleUrls: ['./paylater-deactivate.component.scss']
})
export class PayLaterDeactivateComponent implements OnInit {
  selectedTab: any;

  constructor(
    private dataService: DataService
  ) {
    const selectedTab = dataService.getFromStorage("selected_tab_paylater_deactivate");
    this.selectedTab = selectedTab ? selectedTab : 0;
  }

  ngOnInit() {

  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page_request");
    window.localStorage.removeItem("sort_request");
    window.localStorage.removeItem("sort_type_request");

    window.localStorage.removeItem("page_history");
    window.localStorage.removeItem("sort_history");
    window.localStorage.removeItem("sort_type_history");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab_paylater_deactivate", this.selectedTab);
  }

}
