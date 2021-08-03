import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormControl } from '@angular/forms';
import {map, startWith, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { PayLaterPanelService } from 'app/services/pay-later/pay-later-panel.service';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-pay-later-distribution-list',
  templateUrl: './pay-later-distribution-list.component.html',
  styleUrls: ['./pay-later-distribution-list.component.scss']
})
export class PayLaterDistributionListComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: string;

  loadingIndicator = true;
  loadingSearch = false;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild('table') table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  distributionControl = new FormControl();
  options: any[] = [];
  filteredOptions: Observable<any[]>;
  FILTER_BY: string = 'paylater_company_name'

  constructor(
    private payLaterPanelServicer: PayLaterPanelService,
    private dataService: DataService,
  ) {
    this.onLoad = true;
    this.getOptionText = this.getOptionText.bind(this);
    this.distributionControl.valueChanges.debounceTime(400).subscribe(val => {
      let query = (typeof val === 'object') ? val[this.FILTER_BY] : val;
      this.filteredOptions = this._filter(query);
    })
  }

  ngOnInit() {
    this.getList();
  }
  private _filter(value: any): Observable<any[]> {
    const filterValue = value.toLowerCase();
    this.loadingIndicator = true;
    this.loadingSearch = true;
    return this.payLaterPanelServicer.get(this.pagination)
      .pipe(
        map(response => {
          this.loadingIndicator = false;
          this.loadingSearch = false;
          return response.data.data.filter(option => {
            if (!filterValue) return false;
            return (option[this.FILTER_BY].toLowerCase().includes(filterValue) && filterValue);
          })
        }
        )
      )

  }

  getOptionText(option) {
    return (option && option[this.FILTER_BY]) ? option[this.FILTER_BY] : '';
  }

  getList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.payLaterPanelServicer.get(this.pagination).subscribe(
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
  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.payLaterPanelServicer.get(this.pagination).subscribe(res => {
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

    this.payLaterPanelServicer.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  addDistribution() {
    this.loadingIndicator = true;
    const newRows = [...this.rows, this.distributionControl.value];
    this.rows = [...newRows];
    this.loadingIndicator = false;
    this.clear();
  }
  clear() {
    this.distributionControl.setValue('');
  }

  deleteDistribution(id) {
    const rows = this.rows.filter(row => row.id !== id);
    this.rows = [...rows];
  }

  

}
