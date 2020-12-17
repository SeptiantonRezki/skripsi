import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';
import { Emitter } from 'app/helper/emitter.helper';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { QiscusService } from 'app/services/qiscus.service';
import { SupportService } from 'app/services/settings/support.service';
import { Observable, Subject } from 'rxjs';
import * as moment from "moment";

@Component({
  selector: 'app-vendor-notif-update-list',
  templateUrl: './vendor-notif-update-list.component.html',
  styleUrls: ['./vendor-notif-update-list.component.scss']
})
export class VendorNotifUpdateListComponent implements OnInit {
  onLoad: boolean;
  loadingIndicator: boolean;

  formFilter: FormGroup;
  pagination: Page = new Page();
  offsetPagination: any;
  reorderable = true;

  allRowsSelected: boolean;
  selected: any[];
  totalData: number;

  minDate: any;

  keyUp = new Subject<string>();

  rows: any[] = [];
  _data: any = null;
  @Input()
  set data(data: any) {
    if (data !== null && data.result.data !== null) {
      if (data.result.data.length > 0) {
        Page.renderPagination(this.pagination, data.result);
        this.rows = data.result.data;
        this._data = data;
        this.totalData = data.result.total;
      } else {
        this.rows = [];
      }
    } else {
      this.rows = [];
    }
  }
  get data(): any { return this._data; }

  @Output()
  onRowsSelected = new EventEmitter<any>();
  constructor(
    private supportService: SupportService,
    public dialog: MatDialog,
    private emitter: Emitter,
    private qs: QiscusService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private adapter: DateAdapter<any>,
  ) {
    this.onLoad = true;
    this.allRowsSelected = false;
    this.selected = [];
    this.totalData = 0;
    this.loadingIndicator = false;
    this.adapter.setLocale('id');
    this.rows = [];

    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = 1;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination.per_page = 20;
    this.offsetPagination = 0;

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      }).subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.formFilter = this.formBuilder.group({
      from: '',
      to: ''
    });
  }

  selectFn(allRowsSelected: boolean) {
    this.allRowsSelected = allRowsSelected;
    if (!allRowsSelected) {
      this.selected = [];
    } else { this.selected.length = this.totalData; }
    this.onRowsSelected.emit({ allRowsSelected: allRowsSelected });
  }

  updateFilter(string?: string) {
    this.loadingIndicator = true;
    if (string) {
      this.pagination.search = string;
    } else {
      delete this.pagination.search;
      this.pagination.start_date = this.convertDate(this.formFilter.get('from').value);
      this.pagination.end_date = this.convertDate(this.formFilter.get('to').value);
    }

    this.pagination.page = 1;
    this.offsetPagination = 0;

    this.notificationService.getListNotif(this.pagination).subscribe((response) => {
      this.data = response;
      this.onLoad = false;
      this.loadingIndicator = false;
    }, (err) => {
      console.log('err', err);
    });
  }

  setMinDate(param?: any): void {
    this.formFilter.get('to').setValue('');
    this.minDate = param;
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }
    return '';
  }

  setPage(pageInfo: any) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.notificationService.getListNotif(this.pagination).subscribe(async (response) => {
      this.data = response;
      this.onLoad = false;
      this.loadingIndicator = false;
    }, (err) => {
      console.log('err', err);
    });
  }

  onSort(event: any) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.notificationService.getListNotif(this.pagination).subscribe(async (response) => {
      this.data = response;
      this.onLoad = false;
      this.loadingIndicator = false;
    }, (err) => {
      console.log('err', err);
    });
  }

  onSelect({ selected }) {
    // this.selected.splice(0, this.selected.length);
    // this.selected.push(...selected);
    this.selected = selected;
    this.onRowsSelected.emit({ isSelected: true, data: selected });
  }

  getId(row) {
    return row.id;
  }

  onCheckboxTrueChangeFn(event: any) {
  }

  directDetail(data: any, index: number) {
    if (this.isJSONStringify(data.data)) {
      data.data = JSON.parse(data.data);
      const dataNotif = data;
      this.onRowsSelected.emit({ isDirectDetail: true, data: dataNotif, index: index });
    } else {
      const dataNotif = data;
      this.onRowsSelected.emit({ isDirectDetail: true, data: dataNotif, index: index });
    }
  }

  isJSONStringify(data: any) {
    try {
      JSON.parse(data);
    } catch (ex) {
      console.warn('ex', ex);
      return false;
    }
    return true;
  }

}
