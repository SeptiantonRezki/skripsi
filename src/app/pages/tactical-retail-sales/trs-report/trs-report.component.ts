import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';

import { DataService } from "app/services/data.service";
import { TacticalRetailSalesService } from "app/services/tactical-retail-sales.service";

declare global {
  interface Navigator { msSaveOrOpenBlob: any; }
}

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

  visitSelected = null;
  summaryVisitFilterGroupData = [ "Daily", "Weekly" ];
  summaryVisitFilterProgramCodeData = [ "Code 1", "Code 2" ];
  summaryVisitFilter: FormGroup;
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
    private formBuilder: FormBuilder,
  ) {
    this.permission = this.roles.getRoles('principal.trsreport.lihat');
  }

  ngOnInit() {
    this.refreshTotalPerBrand();
    
    this.summaryVisitFilter = this.formBuilder.group({
      group: new FormControl("Daily"),
      program_code: new FormControl("Code 1"),
      from: "",
      to: "",
    })
    this.summaryVisitFilter.valueChanges.debounceTime(1000).subscribe(selectedValue => {
      console.log('form value changed')
      console.log(selectedValue)
    })
  }

  onChangeTab(event){
    console.log("onChangeTab", event)
    switch(event.index){
      case 0: this.refreshTotalPerBrand(); break;
      case 1: 
        this.refreshSummaryVisit();
        this.visitSelected = null;
        break;
      case 2: this.refreshStockMovement(); break;
    }
  }

  async exportTotalPerBrand() {
    this.dataService.showLoading(true);
    const filename = `Export_TRS_TotalPerBrand_${new Date().toLocaleString()}.xlsx`;
    try {
      const response = await this.TRSService.exportTotalPerBrand(this.totalPerBrandTableData.pagination).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
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

  async exportVisit() {
    this.dataService.showLoading(true);
    const filename = `Export_TRS_Visit_${new Date().toLocaleString()}.xlsx`;
    try {
      const param = this.visitSelected ? {
        field_force: this.visitSelected.field_force,
        program_code: this.visitSelected.program_code,
      } : null;
      const response = await this.TRSService.exportVisit(param).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  summaryVisitNameClick(data){
    this.visitSelected = data;
    this.refreshDetailVisit();
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
    this.TRSService.detailVisit(this.detailVisitTableData.pagination, {
      field_force: this.visitSelected.field_force,
      program_code: this.visitSelected.program_code,
    }).subscribe(
      async res => {
        console.log('aleapi refreshDetailVisit res', res);
        Page.renderPagination(this.detailVisitTableData.pagination, res.data);
        res.data.data.map(i => {
          i.gmap = i.lat && i.lng ? `https://www.google.com/maps/search/?api=1&query=${i.lat},${i.lng}` : null;
          return i
        })
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

  async exportStockMovement() {
    this.dataService.showLoading(true);
    const filename = `Export_TRS_StockMovement_${new Date().toLocaleString()}.xlsx`;
    try {
      const response = await this.TRSService.exportStockMovement(this.stockMovementTableData.pagination).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
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

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  handleError(error) {
    console.log(error);
    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
  }

}
