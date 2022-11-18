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
  summaryVisitTableData: DataTableData = {
    rows: [],
    loadingIndicator: true,
    reorderable: true,
    pagination: new Page(),
    offsetPagination: 0,
  };
  detailVisitTableData: DataTableData = {
    rows: [],
    loadingIndicator: true,
    reorderable: true,
    pagination: new Page(),
    offsetPagination: 0,
  };
  stockMovementTableData: DataTableData = {
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
    this.refreshTotalPerBrand();
    this.refreshSummaryVisit();
    this.refreshDetailVisit();
    this.refreshStockMovement();
  }

  onChangeTab(event){
    console.log("onChangeTab", event)
  }

  refreshTotalPerBrand(){
    this.TRSService.totalPerBrand(this.totalPerBrandTableData.pagination).subscribe(
      async res => {
        console.log('aleapi refreshTotalPerBrand res', res);
        Page.renderPagination(this.totalPerBrandTableData.pagination, res.data);
        this.totalPerBrandTableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.totalPerBrandTableData.loadingIndicator = false;
      }
    );
  }

  setTotalPerBrandPage(pageInfo) {
    this.totalPerBrandTableData.loadingIndicator = true;

    this.totalPerBrandTableData.offsetPagination = pageInfo.offset;

    if (this.totalPerBrandTableData.pagination['search']) {
      this.totalPerBrandTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.totalPerBrandTableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshTotalPerBrand();
  }

  onTotalPerBrandSort(event) {
    this.totalPerBrandTableData.loadingIndicator = true;

    this.totalPerBrandTableData.pagination.sort = event.column.prop;
    this.totalPerBrandTableData.pagination.sort_type = event.newValue;
    this.totalPerBrandTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.totalPerBrandTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshTotalPerBrand();
  }

  refreshSummaryVisit(){
    this.TRSService.summaryVisit(this.summaryVisitTableData.pagination).subscribe(
      async res => {
        console.log('aleapi refreshSummaryVisit res', res);
        Page.renderPagination(this.summaryVisitTableData.pagination, res.data);
        this.summaryVisitTableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.summaryVisitTableData.loadingIndicator = false;
      }
    );
  }

  setSummaryVisitPage(pageInfo) {
    this.summaryVisitTableData.loadingIndicator = true;

    this.summaryVisitTableData.offsetPagination = pageInfo.offset;

    if (this.summaryVisitTableData.pagination['search']) {
      this.summaryVisitTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.summaryVisitTableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshSummaryVisit();
  }

  onSummaryVisitSort(event) {
    this.summaryVisitTableData.loadingIndicator = true;

    this.summaryVisitTableData.pagination.sort = event.column.prop;
    this.summaryVisitTableData.pagination.sort_type = event.newValue;
    this.summaryVisitTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.summaryVisitTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshSummaryVisit();
  }

  refreshDetailVisit(){
    this.TRSService.detailVisit(this.detailVisitTableData.pagination).subscribe(
      async res => {
        console.log('aleapi refreshDetailVisit res', res);
        Page.renderPagination(this.detailVisitTableData.pagination, res.data);
        this.detailVisitTableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.detailVisitTableData.loadingIndicator = false;
      }
    );
  }

  setDetailVisitPage(pageInfo) {
    this.detailVisitTableData.loadingIndicator = true;

    this.detailVisitTableData.offsetPagination = pageInfo.offset;

    if (this.detailVisitTableData.pagination['search']) {
      this.detailVisitTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.detailVisitTableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshDetailVisit();
  }

  onDetailVisitSort(event) {
    this.detailVisitTableData.loadingIndicator = true;

    this.detailVisitTableData.pagination.sort = event.column.prop;
    this.detailVisitTableData.pagination.sort_type = event.newValue;
    this.detailVisitTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.detailVisitTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshDetailVisit();
  }

  refreshStockMovement(){
    this.TRSService.stockMovement(this.stockMovementTableData.pagination).subscribe(
      async res => {
        console.log('aleapi refreshStockMovement res', res);
        Page.renderPagination(this.stockMovementTableData.pagination, res.data);
        this.stockMovementTableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.stockMovementTableData.loadingIndicator = false;
      }
    );
  }

  setStockMovementPage(pageInfo) {
    this.stockMovementTableData.loadingIndicator = true;

    this.stockMovementTableData.offsetPagination = pageInfo.offset;

    if (this.stockMovementTableData.pagination['search']) {
      this.stockMovementTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.stockMovementTableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshStockMovement();
  }

  onStockMovementSort(event) {
    this.stockMovementTableData.loadingIndicator = true;

    this.stockMovementTableData.pagination.sort = event.column.prop;
    this.stockMovementTableData.pagination.sort_type = event.newValue;
    this.stockMovementTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.stockMovementTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshStockMovement();
  }

}
