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

  allRowsSelected: boolean;
  isSelectedRows: boolean;
  selectedRowIds: any[];
  mitraSelected: any;

  constructor(
    private dataService: DataService
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab_paylater_panel");
    // this.selectedTab = selectedTab ? selectedTab : 0;
    this.selectedTab = 0;
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

  onRowsSelected(event: any) {
    this.allRowsSelected = event.allRowsSelected || false;
    if (event.allRowsSelected) {
      this.mitraSelected = { allRowsSelected: true };
    }
    if (event.isSelected) {
      if (event.data.length > 0) {
        this.selectedRowIds = event.data.map((item: any) => item.id);
        this.isSelectedRows = true;
        this.mitraSelected = { isSelected: true, data: this.selectedRowIds };
      } else {
        this.selectedRowIds = [];
        this.isSelectedRows = false;
        this.mitraSelected = { isSelected: true, data: [] };
      }
    }
  }

}
