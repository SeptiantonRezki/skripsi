import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-pay-later-template-financing-tab',
  templateUrl: './pay-later-template-financing-tab.component.html',
  styleUrls: ['./pay-later-template-financing-tab.component.scss']
})
export class PayLaterTemplateFinancingTabComponent implements OnInit {
  selectedTab: any;

  allRowsSelected: boolean;
  isSelectedRows: boolean;
  selectedRowIds: any[];
  // invoiceSelected: any;

  constructor(
    private dataService: DataService
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab_paylater_company");
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
    this.dataService.setToStorage("selected_tab_paylater_company", this.selectedTab);
  }

  onRowsSelected(event: any) {
    this.allRowsSelected = event.allRowsSelected || false;
    if (event.allRowsSelected) {
      // this.invoiceSelected = { allRowsSelected: true };
    }
    if (event.isSelected) {
      if (event.data.length > 0) {
        this.selectedRowIds = event.data.map((item: any) => item.id);
        this.isSelectedRows = true;
        // this.invoiceSelected = { isSelected: true, data: this.selectedRowIds };
      } else {
        this.selectedRowIds = [];
        this.isSelectedRows = false;
        // this.invoiceSelected = { isSelected: true, data: [] };
      }
    }
  }

}
