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

  totalSingleTableData: DataTableData = {
    rows: [],
    loadingIndicator: true,
    reorderable: true,
    pagination: new Page(),
    offsetPagination: 0,
  };
  totalMultipleTableData: DataTableData = {
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

  stockMovementBrands = [];
  stockMovementSelected = null;
  stockMovement2Selected = null;
  stockMovementTableData: DataTableData = {
    rows: [],
    loadingIndicator: true,
    reorderable: true,
    pagination: new Page(),
    offsetPagination: 0,
  };
  stockMovement2TableData: DataTableData = {
    rows: [],
    loadingIndicator: true,
    reorderable: true,
    pagination: new Page(),
    offsetPagination: 0,
  };
  stockMovement3TableData: DataTableData = {
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
    this.refreshTotalSingle();
    this.refreshTotalMultiple();
    
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
      case 0: 
        this.refreshTotalSingle();
        this.refreshTotalMultiple();
        break;
      case 1: 
        this.refreshSummaryVisit();
        this.visitSelected = null;
        break;
      case 2: 
        this.refreshStockMovement(); 
        this.stockMovementSelected = null;
        this.stockMovement2Selected = null;
        break;
    }
  }
  
  async exportTotal() {
    this.dataService.showLoading(true);
    const filename = `Export_TRS_TotalSingle_${new Date().toLocaleString()}.xlsx`;
    try {
      const response = await this.TRSService.exportTotalPerBrand(this.totalSingleTableData.pagination).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  refreshTotalSingle(){
    this.TRSService.totalPerBrand(this.totalSingleTableData.pagination, {
      is_single: true
    }).subscribe(
      async res => {
        console.log('aleapi refreshTotalSingle res', res);
        Page.renderPagination(this.totalSingleTableData.pagination, res.data);
        this.totalSingleTableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.totalSingleTableData.loadingIndicator = false;
      }
    );
  }

  setTotalSinglePage(pageInfo) {
    this.totalSingleTableData.loadingIndicator = true;

    this.totalSingleTableData.offsetPagination = pageInfo.offset;

    if (this.totalSingleTableData.pagination['search']) {
      this.totalSingleTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.totalSingleTableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshTotalSingle();
  }

  onTotalSingleSort(event) {
    this.totalSingleTableData.loadingIndicator = true;

    this.totalSingleTableData.pagination.sort = event.column.prop;
    this.totalSingleTableData.pagination.sort_type = event.newValue;
    this.totalSingleTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.totalSingleTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshTotalSingle();
  }

  refreshTotalMultiple(){
    this.TRSService.totalPerBrand(this.totalMultipleTableData.pagination, {
      is_single: false
    }).subscribe(
      async res => {
        console.log('aleapi refreshTotalMultiple res', res);
        Page.renderPagination(this.totalMultipleTableData.pagination, res.data);
        this.totalMultipleTableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.totalMultipleTableData.loadingIndicator = false;
      }
    );
  }

  setTotalMultiplePage(pageInfo) {
    this.totalMultipleTableData.loadingIndicator = true;

    this.totalMultipleTableData.offsetPagination = pageInfo.offset;

    if (this.totalMultipleTableData.pagination['search']) {
      this.totalMultipleTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.totalMultipleTableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshTotalMultiple();
  }

  onTotalMultipleSort(event) {
    this.totalMultipleTableData.loadingIndicator = true;

    this.totalMultipleTableData.pagination.sort = event.column.prop;
    this.totalMultipleTableData.pagination.sort_type = event.newValue;
    this.totalMultipleTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.totalMultipleTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshTotalMultiple();
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
      var params: any = {};
      if(this.stockMovementSelected){
        params.table_2_movement_code = this.stockMovementSelected.movement_code
        params.table_2_name = this.stockMovementSelected.partner_from
        if(this.stockMovement2Selected){
          params.table_3_movement_code = this.stockMovement2Selected.movement_code
        }
      }
      const response = await this.TRSService.exportStockMovement(this.stockMovementTableData.pagination, params).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }
  
  stockMovementClick(data){
    this.stockMovementSelected = data;
    this.refreshStockMovement2();
  }

  refreshStockMovement(){
    this.TRSService.stockMovement(this.stockMovementTableData.pagination).subscribe(
      async res => {
        console.log('aleapi refreshStockMovement res', res);
        Page.renderPagination(this.stockMovementTableData.pagination, res.data);
        this.stockMovementTableData.rows = res.data.data;
        this.stockMovementBrands = res.data.data.length == 0 ? [] : Object.keys(res.data.data[0].brands)
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
  
  stockMovement2Click(data){
    this.stockMovement2Selected = data;
    this.refreshStockMovement3();
  }

  refreshStockMovement2(){
    this.TRSService.stockMovement2(this.stockMovement2TableData.pagination, {
      movement_code: this.stockMovementSelected.movement_code,
      name: this.stockMovementSelected.partner_from,
    }).subscribe(
      async res => {
        console.log('aleapi refreshStockMovement2 res', res);
        Page.renderPagination(this.stockMovement2TableData.pagination, res.data);
        this.stockMovement2TableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.stockMovement2TableData.loadingIndicator = false;
      }
    );
  }

  setStockMovement2Page(pageInfo) {
    this.stockMovement2TableData.loadingIndicator = true;

    this.stockMovement2TableData.offsetPagination = pageInfo.offset;

    if (this.stockMovement2TableData.pagination['search']) {
      this.stockMovement2TableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.stockMovement2TableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshStockMovement2();
  }

  onStockMovement2Sort(event) {
    this.stockMovement2TableData.loadingIndicator = true;

    this.stockMovement2TableData.pagination.sort = event.column.prop;
    this.stockMovement2TableData.pagination.sort_type = event.newValue;
    this.stockMovement2TableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.stockMovement2TableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshStockMovement2();
  }

  refreshStockMovement3(){
    this.TRSService.stockMovement3(this.stockMovement3TableData.pagination, {
      movement_code: this.stockMovement2Selected.movement_code,
    }).subscribe(
      async res => {
        console.log('aleapi refreshStockMovement3 res', res);
        Page.renderPagination(this.stockMovement3TableData.pagination, res.data);
        this.stockMovement3TableData.rows = res.data.data;
      },
      err => {},
      () => {
        this.stockMovement3TableData.loadingIndicator = false;
      }
    );
  }

  setStockMovement3Page(pageInfo) {
    this.stockMovement3TableData.loadingIndicator = true;

    this.stockMovement3TableData.offsetPagination = pageInfo.offset;

    if (this.stockMovement3TableData.pagination['search']) {
      this.stockMovement3TableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.stockMovement3TableData.pagination.page = this.dataService.getFromStorage("page");
    }

    this.refreshStockMovement3();
  }

  onStockMovement3Sort(event) {
    this.stockMovement3TableData.loadingIndicator = true;

    this.stockMovement3TableData.pagination.sort = event.column.prop;
    this.stockMovement3TableData.pagination.sort_type = event.newValue;
    this.stockMovement3TableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.stockMovement3TableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshStockMovement3();
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
