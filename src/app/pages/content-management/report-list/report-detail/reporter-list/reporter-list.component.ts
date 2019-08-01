import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Page } from "../../../../../classes/laravel-pagination";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { PagesName } from "app/classes/pages-name";
import { ReportListService } from "app/services/content-management/report-list.service";

@Component({
  selector: 'app-reporter-list',
  templateUrl: './reporter-list.component.html',
  styleUrls: ['./reporter-list.component.scss']
})
export class ReporterListComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];
  detailReport: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  offsetPagination: Number = null;

  keyUp = new Subject<string>();

  @ViewChild("activeCell") activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private reportListService: ReportListService
  ) {
    this.onLoad = true;
    this.selected = [];
    this.detailReport = this.dataService.getFromStorage("detail_report_item");

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.getReporters();
  }

  getReporters() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.reportListService.detail({ report_id: this.detailReport.id }, this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data.map(row => {
          return {
            ...row,
            collapsed: false
          }
        });

        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.reportListService.detail({ report_id: this.detailReport.id }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      // this.rows = res.data;
      this.rows = res.data.map(row => {
        return {
          ...row,
          collapsed: false
        }
      });
      this.loadingIndicator = false;
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

    this.reportListService.detail({ report_id: this.detailReport.id }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      // this.rows = res.data;
      this.rows = res.data.map(row => {
        return {
          ...row,
          collapsed: false
        }
      });
      this.loadingIndicator = false;
    });
  }

  collapsingRow(rowIndex) {
    this.rows[rowIndex].collapsed = !this.rows[rowIndex].collapsed;
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.reportListService.detail({ report_id: this.detailReport.id }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      // this.rows = res.data;
      this.rows = res.data.map(row => {
        return {
          ...row,
          collapsed: false
        }
      });
      this.loadingIndicator = false;
    });
  }

}
