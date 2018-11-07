import { Component, OnInit, ViewChild } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { ScheduleTradeProgramService } from '../../../../services/dte/schedule-trade-program.service';
import { DateAdapter } from '@angular/material';
import * as moment from 'moment';
import { PagesName } from 'app/classes/pages-name';

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

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  constructor(
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder
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
    this.pagination.sort = 'scheduler_name';
    this.pagination.sort_type = 'asc';
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
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

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

    console.log("check pagination", this.pagination);

    this.scheduleTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;
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
    this.showLoading = true;
    this.scheduleTradeProgramService.export({ trade_scheduler_id: id }).subscribe(res => {
      // window.open(res.data, "_blank");
      const link = document.createElement('a');
      link.target = '_blank';
      link.href = res.data;
      link.setAttribute('visibility', 'hidden');
      link.click();
      this.showLoading = false;
      // console.log(res);
    })
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

}
