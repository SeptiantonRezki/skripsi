import {
    Component,
    OnInit,
    HostListener,
    ViewChild,
    ElementRef,
  } from "@angular/core";
  import { formatCurrency } from "@angular/common";
  import { Router, ActivatedRoute } from "@angular/router";
  import { DataService } from '../../../services/data.service';
  import { DialogService } from "../../../services/dialog.service";
  import { Subject, Observable, ReplaySubject } from "rxjs";
  import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
  import { takeUntil } from "rxjs/operators";
  import { Page } from "../../../classes/laravel-pagination";
  import * as _ from "underscore";
  import { environment } from "environments/environment";
  import { IdbService } from "app/services/idb.service";
  import { KPISettingService } from '../../../services/kpi-setting/kpi-setting.service';

  @Component({
    selector: 'app-list-kps.component',
    templateUrl: './list-kps.component.html'
  })
  export class KPSListComponent implements OnInit {
    rows: any[];
    pagination: Page = new Page();
    offsetPagination: any;
    id: any;
    loadingIndicator: Boolean;
    keyUp = new Subject<string>();

    constructor(
        private kpiSettingService: KPISettingService,
        private dataService: DataService,
        private dialogService: DialogService,
        private router: Router,
    ) {
    }

  ngOnInit() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.kpiSettingService.getList(this.pagination).subscribe((res) => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.kpiSettingService.getList(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.rows = [];
    this.dataService.setToStorage('kps', param);
  }
}
