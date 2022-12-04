import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';

import { DataService } from "app/services/data.service";
import { TacticalRetailSalesService } from "app/services/tactical-retail-sales.service";

import moment from 'moment';

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
  summaryVisitFilter: FormGroup;
  
  summaryVisitTableData: DataTableData = {
    rows: [],
    loadingIndicator: true,
    reorderable: true,
    pagination: new Page(),
    offsetPagination: 0,
  };
  weeklyVisitTableData: DataTableData = {
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

  stockMovementFilter: FormGroup;
  stockMovementSelectedFilter: FormGroup;

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


  formFilterReport: FormGroup;
  filter1List: any[];
  filter2List: any[];

  constructor(
    private dataService: DataService,
    private TRSService: TacticalRetailSalesService,
    private formBuilder: FormBuilder,
  ) {
    this.permission = this.roles.getRoles('principal.trsreport');
    console.log("this.permission");
    console.log(this.permission);
  }

  ngOnInit() {
    //chanif
    this.dataService.showLoading(true);
    this.formFilterReport = this.formBuilder.group({
      programCode: new FormControl(),
      date_filter: ""
    })

    let request = {
      level: 6,
    };
    this.TRSService.getReportFilter1(request).subscribe(res => {
      this.filter1List = res.data;
    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    });
    this.TRSService.getReportFilter2(request).subscribe(res => {
      this.filter2List = res.data;
    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    });

    /*
    this.TRSService.getReportFilter2(request).subscribe(res => {
      this.filter2List = res.data;
    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    })
    */

    //ale
    this.refreshTotalSingle();
    this.refreshTotalMultiple();

    this.summaryVisitFilter = this.formBuilder.group({
      group: new FormControl("Daily"),
      program_code: new FormControl(),
      kps: new FormControl(),
      from: "",
      to: "",
    });
    this.summaryVisitFilter.valueChanges.debounceTime(1000).subscribe(selectedValue => {
      console.log('form value changed')
      console.log(selectedValue)
    });

    this.stockMovementFilter = this.formBuilder.group({
      program_code: new FormControl(),
      from: "",
      to: "",
    });
    this.stockMovementFilter.valueChanges.debounceTime(1000).subscribe(selectedValue => {
      console.log('form value changed')
      console.log(selectedValue)
    });

    this.stockMovementSelectedFilter = this.formBuilder.group({
      type: new FormControl(),
      need_to_review: new FormControl(),
      from: "",
      to: "",
    });
    this.stockMovementSelectedFilter.valueChanges.debounceTime(1000).subscribe(selectedValue => {
      console.log('form value changed')
      console.log(selectedValue)
    });

    
    this.dataService.showLoading(false);
  }

  filterReport1(){
    let param = {
      program_code: this.formFilterReport.get('programCode').value == null? '': this.formFilterReport.get('programCode').value,
      date_filter: this.formFilterReport.get('date_filter').value == ''?'':moment(this.formFilterReport.get('date_filter').value).format("YYYYMMDD"),
    };
    console.log(param);

    this.refreshTotalSingle();
    this.refreshTotalMultiple();
  }

  filterReport2(){
    this.refreshSummaryVisit();
    this.visitSelected = null;
  }

  updateVisitTable(event, obj){
    this.refreshSummaryVisit(obj);
    this.visitSelected = null;
  }

  filterReport3(){
    this.refreshStockMovement(); 
    this.stockMovementSelected = null;
    this.stockMovement2Selected = null;
  }

  filterReport31(){
    this.refreshStockMovement2(); 
    this.stockMovement2Selected = null;
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
      const response = await this.TRSService.exportTotalPerBrand(this.totalSingleTableData.pagination,
        {
          program_code: this.formFilterReport.get('programCode').value == null? '': this.formFilterReport.get('programCode').value,
          date_filter: this.formFilterReport.get('date_filter').value == ''?'':moment(this.formFilterReport.get('date_filter').value).format("YYYYMMDD"),
        }).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  refreshTotalSingle(){
    this.TRSService.totalPerBrand(this.totalSingleTableData.pagination, {
      is_single: true,
      program_code: this.formFilterReport.get('programCode').value == null? '': this.formFilterReport.get('programCode').value,
      date_filter: this.formFilterReport.get('date_filter').value == ''?'':moment(this.formFilterReport.get('date_filter').value).format("YYYYMMDD"),
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
      is_single: false,
      program_code: this.formFilterReport.get('programCode').value == null? '': this.formFilterReport.get('programCode').value,
      date_filter: this.formFilterReport.get('date_filter').value == ''?'':moment(this.formFilterReport.get('date_filter').value).format("YYYYMMDD"),
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
    console.log("ch export visit");
    this.dataService.showLoading(true);
    const filename = `Export_TRS_Visit_${new Date().toLocaleString()}.xlsx`;
    try {
      const param = this.visitSelected ? {
        selected_field_force: this.visitSelected.field_force,
        selected_program_code: this.visitSelected.program_code,
        VisitDate: this.visitSelected.VisitDate,
        group: this.summaryVisitFilter.get('group').value == null? '': this.summaryVisitFilter.get('group').value,
      } : {
        group: this.summaryVisitFilter.get('group').value == null? '': this.summaryVisitFilter.get('group').value,
      };
      const response = await this.TRSService.exportVisit(param, {
        program_code: this.summaryVisitFilter.get('program_code').value == null? '': this.summaryVisitFilter.get('program_code').value,
        kps: this.summaryVisitFilter.get('kps').value == null? '': this.summaryVisitFilter.get('kps').value,
        from: this.summaryVisitFilter.get('from').value == ''?'':moment(this.summaryVisitFilter.get('from').value).format("YYYY-MM-DD"),
        to: this.summaryVisitFilter.get('to').value == ''?'':moment(this.summaryVisitFilter.get('to').value).format("YYYY-MM-DD"),
      }).toPromise();
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

  refreshSummaryVisit(group?){
    let request = {
      group: this.summaryVisitFilter.get('group').value == null? '': this.summaryVisitFilter.get('group').value,
      program_code: this.summaryVisitFilter.get('program_code').value == null? '': this.summaryVisitFilter.get('program_code').value,
      kps: this.summaryVisitFilter.get('kps').value == null? '': this.summaryVisitFilter.get('kps').value,
      from: this.summaryVisitFilter.get('from').value == ''?'':moment(this.summaryVisitFilter.get('from').value).format("YYYY-MM-DD"),
      to: this.summaryVisitFilter.get('to').value == ''?'':moment(this.summaryVisitFilter.get('to').value).format("YYYY-MM-DD"),
    };

    if (group === undefined) {
      group = request.group;
    }

    if(group == 'Daily'){
      this.TRSService.summaryVisit(this.summaryVisitTableData.pagination, request).subscribe(
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
    } else {
      //=================WEEKLY
      this.TRSService.weeklySummaryVisit(this.weeklyVisitTableData.pagination, request).subscribe(
        async res => {
          console.log('aleapi refreshWeeklySummaryVisit res', res);
          Page.renderPagination(this.weeklyVisitTableData.pagination, res.data);
          this.weeklyVisitTableData.rows = res.data.data;
        },
        err => {},
        () => {
          this.weeklyVisitTableData.loadingIndicator = false;
        }
      );
    }
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
  setWeeklySummaryVisitPage(pageInfo) {
    this.weeklyVisitTableData.loadingIndicator = true;

    this.weeklyVisitTableData.offsetPagination = pageInfo.offset;

    if (this.weeklyVisitTableData.pagination['search']) {
      this.weeklyVisitTableData.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.weeklyVisitTableData.pagination.page = this.dataService.getFromStorage("page");
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
  onWeeklySummaryVisitSort(event) {
    this.weeklyVisitTableData.loadingIndicator = true;

    this.weeklyVisitTableData.pagination.sort = event.column.prop;
    this.weeklyVisitTableData.pagination.sort_type = event.newValue;
    this.weeklyVisitTableData.pagination.page = 1;

    this.dataService.setToStorage("page", this.weeklyVisitTableData.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.refreshSummaryVisit();
  }

  refreshDetailVisit(){
    this.TRSService.detailVisit(this.detailVisitTableData.pagination, {
      field_force: this.visitSelected.field_force,
      program_code: this.visitSelected.program_code,
      group: this.summaryVisitFilter.get('group').value,
      VisitDate: this.visitSelected.VisitDate,
      kps: this.visitSelected.kps_week,
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
      var params: any = {
        program_code: this.stockMovementFilter.get('program_code').value == null? '': this.stockMovementFilter.get('program_code').value,
        from: this.stockMovementFilter.get('from').value == ''?'':moment(this.stockMovementFilter.get('from').value).format("YYYY-MM-DD"),
        to: this.stockMovementFilter.get('to').value == ''?'':moment(this.stockMovementFilter.get('to').value).format("YYYY-MM-DD"),
      };

      if(this.stockMovementSelected){
        params.table_2_territory = this.stockMovementSelected.Territory;
        params.table_2_journey = this.stockMovementSelected.tgl_journey;

        params.table_2_type = this.stockMovementSelectedFilter.get('type').value == null? '': this.stockMovementSelectedFilter.get('type').value;
        params.table_2_need_to_review = this.stockMovementSelectedFilter.get('need_to_review').value == null? '': this.stockMovementSelectedFilter.get('need_to_review').value;
        params.table_2_from = this.stockMovementSelectedFilter.get('from').value == ''?'':moment(this.stockMovementSelectedFilter.get('from').value).format("YYYY-MM-DD");
        params.table_2_to = this.stockMovementSelectedFilter.get('to').value == ''?'':moment(this.stockMovementSelectedFilter.get('to').value).format("YYYY-MM-DD");  

        if(this.stockMovement2Selected){
          params.table_3_movement_code = this.stockMovement2Selected.movement_code;
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
    this.stockMovement2Selected = null;
  }

  refreshStockMovement(){
    this.TRSService.stockMovement(this.stockMovementTableData.pagination, {
      program_code: this.stockMovementFilter.get('program_code').value == null? '': this.stockMovementFilter.get('program_code').value,
      from: this.stockMovementFilter.get('from').value == ''?'':moment(this.stockMovementFilter.get('from').value).format("YYYY-MM-DD"),
      to: this.stockMovementFilter.get('to').value == ''?'':moment(this.stockMovementFilter.get('to').value).format("YYYY-MM-DD"),
    }).subscribe(
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
      territory: this.stockMovementSelected.Territory,
      journey: this.stockMovementSelected.tgl_journey,

      type: this.stockMovementSelectedFilter.get('type').value == null? '': this.stockMovementSelectedFilter.get('type').value,
      need_to_review: this.stockMovementSelectedFilter.get('need_to_review').value == null? '': this.stockMovementSelectedFilter.get('need_to_review').value,
      from: this.stockMovementSelectedFilter.get('from').value == ''?'':moment(this.stockMovementSelectedFilter.get('from').value).format("YYYY-MM-DD"),
      to: this.stockMovementSelectedFilter.get('to').value == ''?'':moment(this.stockMovementSelectedFilter.get('to').value).format("YYYY-MM-DD"),

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
      journey: this.stockMovementSelected.tgl_journey,
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