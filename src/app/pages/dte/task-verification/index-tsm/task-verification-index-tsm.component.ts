import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import * as moment from 'moment';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { IdleService } from 'app/services/idle.service';
import { TaskVerificationService } from 'app/services/dte/task-verification.service';
import { ConfirmDialogTsmComponent } from '../dialog/confirm-dialog-tsm/confirm-dialog-tsm.component';
import { SequencingService } from 'app/services/dte/sequencing.service';

@Component({
  selector: 'app-task-verification-index-tsm',
  templateUrl: './task-verification-index-tsm.component.html',
  styleUrls: ['./task-verification-index-tsm.component.scss']
})
export class TaskVerificationIndexTsmComponent implements OnInit {

  onLoad: boolean;
  loadingIndicator: boolean;

  permissionVerifikasiMisi: any;
  permissionVerifikasiMisiAll: any;
  permissionReleaseCoin: any;
  roles: PagesName = new PagesName();

  rows: any[];
  keyUp = new Subject<string>();

  table: DatatableComponent;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;

  formFilter: FormGroup;

  minDate: any;

  statusFilter: any[] = [
    { name: 'Urutkan Perhari', value: 'day' },
    { name: 'Urutkan Perbulan', value: 'mounth' },
    { name: 'Urutkan Pertahun', value: 'year' }
  ];

  listStatuses: any[] = [
    { name: 'Semua Status', value: "" },
    { name: 'Publish', value: 'publish' },
    { name: 'Unpublish', value: 'unpublish' },
    { name: 'Draft', value: 'draft' }
  ];

  dialogRef: any;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  constructor(
    private dialogService: DialogService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private userIdle: IdleService,
    private taskVerificationService: TaskVerificationService,
    private dialog: MatDialog,
    private sequencingService: SequencingService
  ) {
    this.adapter.setLocale('id');
    this.rows = [];
    this.onLoad = true;
    this.loadingIndicator = true;

    this.permissionVerifikasiMisi = this.roles.getRoles('principal.dtetaskverification');
    this.permissionVerifikasiMisiAll = this.roles.getRoles('principal.dtetaskverificationall');
    this.permissionReleaseCoin = this.roles.getRoles('principal.dtetaskverificationreleasecoin');

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.getListTaskVerification();

    this.formFilter = this.formBuilder.group({
      filter: 'day',
      start_date: '',
      end_date: '',
      status: '',
    });

    setTimeout(() => {
      document.querySelector("datatable-body").id = "datatable-body";
      document.querySelectorAll("datatable-row-wrapper").forEach((row,idx) => {
        row.id = 'data-row-'+String(idx+1);
        let temp = idx+1;
        row.querySelectorAll("datatable-body-cell").forEach((cell,idx)=>{
          cell.id = 'data-cell-'+String(temp)+'-'+String(idx+1);
        })
      })
    }, 1500);
  }

  updateFilter(string?) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage('page');
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.pagination['type'] = this.convertDate(this.formFilter.get('start_date').value) ||
      this.convertDate(this.formFilter.get('end_date').value) ? this.formFilter.get('filter').value : '';
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.pagination['status'] = this.formFilter.get('status').value;

    this.taskVerificationService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  getListTaskVerification() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.taskVerificationService.getTsm(this.pagination).subscribe(
      res => {
        if (res.total < res.per_page && page !== 1) {
          this.dataService.setToStorage('page', 1);
          this.getListTaskVerification();
        } else {
          Page.renderPagination(this.pagination, res);
          this.rows = res.data;
          this.onLoad = false;
          this.loadingIndicator = false;
        }
      }, err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return '';
  }

  setMinDate(e) { }

  openConfirmDialog(item: any, popupType: string) {
    const dialogConfig = new MatDialogConfig();
    item.popupType = popupType;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = item;

    this.dialogRef = this.dialog.open(ConfirmDialogTsmComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.getListTaskVerification();
      }
    });
  }

  export(item) {
    this.dataService.showLoading({ show: true });

    let response: any = { rand: "" };

    let params = {
      task_sequencing_management_id: item.task_sequencing_management_id,
      task_sequencing_management_template_id: item.task_sequencing_management_template_id,
      rand: "",
      last: "true"
    }

    this.taskVerificationService.exportTrueTsm(params).subscribe(response => {
      if (response.data && response.status) {
        setTimeout(() => {
          this.downloadLink.nativeElement.href = response.data;
          this.downloadLink.nativeElement.click();
          this.dataService.showLoading(false);
        }, 500);
      }
    }, err => {
      this.dataService.showLoading(false);
    })

    // masih belum tahu untuk apa ...
    // this.sequencingService.export(params).subscribe(
    //   (response) => {
    //     console.log('response tsm bund', response)
    //     if (response.data && response.status) {
    //       setTimeout(() => {
    //         this.downloadLink.nativeElement.href = response.data;
    //         this.downloadLink.nativeElement.click();
    //         this.dataService.showLoading(false);
    //       }, 500);
    //     }
    //   }, (error) => {
    //     this.dataService.showLoading(false);
    //   }
    // )
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

    this.taskVerificationService.getTsm(this.pagination).subscribe(res => {
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

    this.taskVerificationService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  isDisableVerification(row) {
    if (row.task_sequencing_management_template_quiz === 1) return true;

    if (row.task_need_verify === 0) {
      return true;
    } else {
      return false;
    }
  }

  isDisableReleaseCoin(row) {
    if (row.task_sequencing_management_template_quiz === 1) return true;

    if (row.task_need_coin === 0) {
      return true;
    } else {
      return false;
    }
  }

}
