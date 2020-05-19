import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-pay-later-panel-create',
  templateUrl: './pay-later-panel-create.component.html',
  styleUrls: ['./pay-later-panel-create.component.scss']
})
export class PayLaterPanelCreateComponent implements OnInit, OnDestroy {
  selectedTab: any;

  constructor(
    private dataService: DataService
  ) {
    const selectedTab = dataService.getFromStorage("selected_tab_paylater_panel");
    this.selectedTab = selectedTab ? selectedTab : 0;
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.dataService.getFromStorage('bussiness_id_selected')) {
      localStorage.removeItem('bussiness_id_selected');
    }

    if (this.dataService.getFromStorage('company_selected')) {
      localStorage.removeItem('company_selected');
    }
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
