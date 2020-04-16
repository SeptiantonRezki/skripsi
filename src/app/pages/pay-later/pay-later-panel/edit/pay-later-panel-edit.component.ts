import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-pay-later-panel-edit',
  templateUrl: './pay-later-panel-edit.component.html',
  styleUrls: ['./pay-later-panel-edit.component.scss']
})
export class PayLaterPanelEditComponent implements OnInit {
  selectedTab: any;

  constructor(
    private dataService: DataService
  ) {
    const selectedTab = dataService.getFromStorage("selected_tab_paylater_panel");
    this.selectedTab = selectedTab ? selectedTab : 0;
  }

  ngOnInit() {

  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page_mitra");
    window.localStorage.removeItem("sort_mitra");
    window.localStorage.removeItem("sort_type_mitra");

    window.localStorage.removeItem("page_src");
    window.localStorage.removeItem("sort_src");
    window.localStorage.removeItem("sort_type_src");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab_paylater_panel", this.selectedTab);
  }

}
