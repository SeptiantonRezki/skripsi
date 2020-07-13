import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { PayLaterDeactivateService } from 'app/services/pay-later/pay-later-deactivate.service';

@Component({
  selector: 'app-pay-later-activation',
  templateUrl: './pay-later-activation.component.html',
  styleUrls: ['./pay-later-activation.component.scss']
})
export class PayLaterActivationComponent implements OnInit {
  selectedTab: any;

  rows: any[];
  selected: any[];
  id: any[];
  statusRow: string;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  offsetPagination: any;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private payLaterDeactivateService: PayLaterDeactivateService
  ) {
    const selectedTab = dataService.getFromStorage("selected_tab_paylater_deactivate");
    this.selectedTab = selectedTab ? selectedTab : 0;
    this.onLoad = true;
    this.selected = [];

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
    this.getActivationList();
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page_mitra");
    window.localStorage.removeItem("sort_mitra");
    window.localStorage.removeItem("sort_type_mitra");

    window.localStorage.removeItem("page_src");
    window.localStorage.removeItem("sort_src");
    window.localStorage.removeItem("sort_type_src");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab_paylater_activate", this.selectedTab);
  }

  getActivationList() {
    const page = this.dataService.getFromStorage("page_mitra");
    const sort_type = this.dataService.getFromStorage("sort_type_mitra");
    const sort = this.dataService.getFromStorage("sort_mitra");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.payLaterDeactivateService.getActivationMitra(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
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
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.payLaterDeactivateService.getActivationMitra(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    this.payLaterDeactivateService.getActivationMitra(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);

    this.payLaterDeactivateService.getActivationMitra(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

}
