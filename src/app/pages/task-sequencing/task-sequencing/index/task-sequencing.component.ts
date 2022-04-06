import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../services/dialog.service";
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-task-sequencing',
  templateUrl: './task-sequencing.component.html',
  styleUrls: ['./task-sequencing.component.scss']
})
export class TaskSequencingComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];

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
    private ls: LanguagesService,
  ) {
    this.onLoad = false; // temporarily set to false to show the dummy table
    this.selected = []

    this.permission = this.roles.getRoles('principal.task_sequencing');
    console.log(this.permission);

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
  }

  onSelect({ selected }) {
    console.log(arguments);
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

    // this.adminPrincipalService.get(this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res);
    //   this.rows = res.data;
    //   this.loadingIndicator = false;
    // });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    // this.adminPrincipalService.get(this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res);
    //   this.rows = res.data;
    //   this.loadingIndicator = false;
    // });
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

    // this.adminPrincipalService.get(this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res);
    //   this.rows = res.data;
    //   this.loadingIndicator = false;
    // });
  }

}
