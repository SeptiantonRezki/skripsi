import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { ScheduleTradeProgramService } from '../../../../services/dte/schedule-trade-program.service';
import { DateAdapter } from '@angular/material';
import * as moment from 'moment';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-schedule-program-index',
  templateUrl: './schedule-program-index.component.html',
  styleUrls: ['./schedule-program-index.component.scss']
})
export class ScheduleProgramIndexComponent {

  rows: any[];
  minDate: any;
  id: any;

  loadingIndicator = true;
  showLoading: Boolean;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  statusFilter: any[] =  [
    { name: 'Urutkan Perhari', value: 'day' },
    { name: 'Urutkan Perbulan', value: 'mounth' },
    { name: 'Urutkan Pertahun', value: 'year' }
  ]

  formFilter: FormGroup;
  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  offsetPagination: any;

  constructor(
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.adapter.setLocale("id");
    this.rows = [];
    this.onLoad = true;

    this.permission = this.roles.getRoles('principal.tugas');
    console.log(this.permission);

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.getListScheduler();

    this.formFilter = this.formBuilder.group({
      filter: "day",
      start_date: "",
      end_date: ""
    });
  }

  getListScheduler() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.scheduleTradeProgramService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
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
    this.offsetPagination = pageInfo.offset;      
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.scheduleTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination.filter = this.formFilter.get('filter').value;
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.scheduleTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
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

    this.pagination.filter = this.convertDate(this.formFilter.get('start_date').value) || this.convertDate(this.formFilter.get('end_date').value) ? this.formFilter.get('filter').value : '';
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);

    this.scheduleTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  setMinDate(param?: any): void {
    this.formFilter.get("end_date").setValue("");
    this.minDate = param;
  }

  deleteStp(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Schedule Trade Program",
      captionDialog: "Apakah anda yakin untuk menghapus schedule trade program ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.scheduleTradeProgramService.delete({ schedule_tp_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getListScheduler();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }
  
  export(id) {
    this.dataService.showLoading(true);
    this.scheduleTradeProgramService.export({ trade_scheduler_id: id }).subscribe(res => {
      // window.open(res.data, "_blank");
      // const link = document.createElement('a');
      // link.target = '_blank';
      // link.href = res.data;
      // link.setAttribute('visibility', 'hidden');
      // link.click();
      // console.log(res);

      this.downloadLink.nativeElement.href = res.data;
      this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
    })
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

}
