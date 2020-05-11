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
import { IdleService } from 'app/services/idle.service';

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
  statusFilter: any[] = [
    { name: 'Urutkan Perhari', value: 'day' },
    { name: 'Urutkan Perbulan', value: 'mounth' },
    { name: 'Urutkan Pertahun', value: 'year' }
  ]
  listStatuses: any[] = [
    { name: 'Semua Status', value: "" },
    { name: 'Publish', value: 'publish' },
    { name: 'Unpublish', value: 'unpublish' },
    { name: 'Draft', value: 'draft' }
  ];

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
    private dataService: DataService,
    private userIdle: IdleService
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
      end_date: "",
      status: ""
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
    this.pagination['type'] = this.formFilter.get('filter').value;
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

    this.pagination['type'] = this.convertDate(this.formFilter.get('start_date').value) || this.convertDate(this.formFilter.get('end_date').value) ? this.formFilter.get('filter').value : '';
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.pagination['status'] = this.formFilter.get('status').value;

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

  async export(item) {
    const length = 100 / item.trade_scheduler_templates.length === Infinity ? 0 : 100 / item.trade_scheduler_templates.length;
    let current_progress = 0;

    this.dataService.showLoading({ show: true });
    this.dataService.setProgress({ progress: current_progress.toFixed(0) });

    let response: any = { rand: "" };

    if (item.trade_scheduler_templates.length === 0) {
      this.dataService.setProgress({ progress: 100 });
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: "Template Jadwal Trade Program kosong" });
      return;
    }

    for (const { val, index } of item.trade_scheduler_templates.map((val, index) => ({ val, index }))) {

      let params = {
        trade_scheduler_id: item.id,
        last: (index + 1) === item.trade_scheduler_templates.length ? 'true' : 'false',
        rand: response.rand,
        trade_scheduler_template_id: val.id
      }

      try {
        this.userIdle.onHitEvent();
        response = await this.scheduleTradeProgramService.export(params).toPromise();

        current_progress = current_progress === 0 ? length : current_progress + length;
        this.dataService.setProgress({ progress: current_progress.toFixed(0) });

      } catch (error) {
        this.dataService.showLoading(false);
        throw error;
      }
    }

    this.dataService.setProgress({ progress: 100 });

    if (response.data && response.status) {
      setTimeout(() => {
        this.downloadLink.nativeElement.href = response.data;
        this.downloadLink.nativeElement.click();
        this.dataService.showLoading(false);
      }, 1000);
    }
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

}
