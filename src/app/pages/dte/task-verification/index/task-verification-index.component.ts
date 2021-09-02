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
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-verification-index',
  templateUrl: './task-verification-index.component.html',
  styleUrls: ['./task-verification-index.component.scss']
})
export class TaskVerificationIndexComponent implements OnInit {

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
  }

  updateFilter(string) {
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

    this.taskVerificationService.get(this.pagination).subscribe(res => {
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

    this.taskVerificationService.get(this.pagination).subscribe(
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

        setTimeout(() => {
          this.addObjectToTable();
        }, 1500);

      }, err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  addObjectToTable(){
    document.querySelector("datatable-body").id = "datatable-body";
    let table = document.getElementById("datatable-nontsm");

    let rows = table.querySelectorAll("datatable-row-wrapper");
    for (let index = 0; index < rows.length; index++) {
      // let numberRow = index + 1;
      rows[index].id = 'data-row';
      // rows[index].id = 'data-row-'+String(numberRow);

      let cells = rows[index].querySelectorAll("datatable-body-cell");
      for (let indexCell = 0; indexCell < cells.length; indexCell++) {
        cells[indexCell].id = 'data-cell';
        // cells[indexCell].id = 'data-cell-'+String(numberRow)+'-'+String(indexCell+1);          
      }
    }
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return '';
  }

  openConfirmDialog(item: any, popupType: string) {
    const dialogConfig = new MatDialogConfig();
    item.popupType = popupType;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = item;

    this.dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.getListTaskVerification();
      }
     });
  }


  async export(item) {
    this.dataService.showLoading({ show: true });

    let response: any = { rand: '' };
    const params = {
      trade_scheduler_id: item.id,
      last: 'true',
      rand: response.rand,
      trade_scheduler_template_id: item.scheduler_templates_id
    };

    try {
      // response = await this.taskVerificationService.export(params).toPromise();
      this.taskVerificationService.export(params).subscribe(res => {
        this.downloadLink.nativeElement.href = res.data;
        this.downloadLink.nativeElement.click();
        this.dataService.showLoading(false);
      }, err => {
        console.warn('err', err);
        alert('Terjadi kesalahan saat mendownload misi')
        this.dataService.showLoading(false);
      })
    } catch (error) {
      this.dataService.showLoading(false);
      throw error;
    }

    // if (response.data && response.status) {
    //   setTimeout(() => {
    //     this.downloadLink.nativeElement.href = response.data;
    //     this.downloadLink.nativeElement.click();
    //     this.dataService.showLoading(false);
    //   }, 1000);
    // } else {
    //   this.dataService.showLoading(false);
    //   alert('Terjadi kesalahan saat mendownload misi')
    // }
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

    this.taskVerificationService.get(this.pagination).subscribe(res => {
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

    this.taskVerificationService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  isDisableVerification(row) {
    if (row.task_need_verify === 0) {
      return true;
    } else {
      return false;
    }
  }

  isDisableReleaseCoin(row) {
    if (row.task_need_coin === 0) {
      return true;
    } else {
      return false;
    }
  }

}
