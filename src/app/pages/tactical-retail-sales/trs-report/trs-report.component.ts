import { Component, OnInit } from '@angular/core';

import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';

import { DataService } from "app/services/data.service";
import { TacticalRetailSalesService } from "app/services/tactical-retail-sales.service";

interface DataTableData {
  rows: any[],
  loadingIndicator: Boolean,
  reorderable: Boolean,
  pagination: Page,
  offsetPagination: Number,
};

@Component({
  selector: 'app-trs-report',
  templateUrl: './trs-report.component.html',
  styleUrls: ['./trs-report.component.scss']
})
export class TrsReportComponent implements OnInit {

  onLoad: boolean;
  permission: any;
  roles: PagesName = new PagesName();

  selectedTab = 0;

  totalPerBrandTableData: DataTableData = {
    rows: [],
    loadingIndicator: true,
    reorderable: true,
    pagination: new Page(),
    offsetPagination: 0,
  };

  constructor(
    private dataService: DataService,
    private TRSService: TacticalRetailSalesService,
  ) {
    this.onLoad = false;
    this.permission = this.roles.getRoles('principal.trsreport.lihat');
  }

  ngOnInit() {
    // this.TRSService.getReports().subscribe(async res => {
    //   console.log("Ale", res)
    // });
    this.refreshVisitSummary();
  }

  onChangeTab(event){
    console.log("onChangeTab", event)
  }

  refreshVisitSummary(){
    // this.totalPerBrandTableData.rows = [
    //   { brand: "Ale 1" },
    //   { brand: "Ale 2" },
    // ]
    this.TRSService.getReports(this.totalPerBrandTableData.pagination).subscribe(
      async res => {
        console.log('refreshVisitSummary res', res);
        Page.renderPagination(this.totalPerBrandTableData.pagination, res.data);
        this.totalPerBrandTableData.rows = res.data.data;
        console.log('refreshVisitSummary rows', this.totalPerBrandTableData.rows);
      },
      err => {},
      () => {
        this.totalPerBrandTableData.loadingIndicator = false;
      }
    );
  }

  setVisitSummaryPage(pageInfo) {
    this.totalPerBrandTableData.loadingIndicator = true;

    this.totalPerBrandTableData.offsetPagination = pageInfo.offset;

    if (this.totalPerBrandTableData.pagination['search']) {
      this.totalPerBrandTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.totalPerBrandTableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshVisitSummary();
  }

  onVisitSummarySort(event) {
    this.totalPerBrandTableData.loadingIndicator = true;

    this.totalPerBrandTableData.pagination.sort = event.column.prop;
    this.totalPerBrandTableData.pagination.sort_type = event.newValue;
    this.totalPerBrandTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.totalPerBrandTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshVisitSummary();
  }

}
